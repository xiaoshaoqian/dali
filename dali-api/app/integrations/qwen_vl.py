"""Qwen-VL-Max integration for one-shot visual analysis.

This module provides integration with Alibaba DashScope Qwen-VL-Max model
for garment recognition, including:
- Center point coordinates extraction
- Garment category detection
- Visual description for image generation

Uses the DashScope API for Qwen-VL-Max (qwen-vl-max) model.
"""

import json
import logging
import re
from dataclasses import dataclass
from typing import Any

import httpx

from app.config import settings
from app.core.exceptions import APIException

logger = logging.getLogger(__name__)


@dataclass
class AnchorPoint:
    """Represents a detected item's anchor point."""

    x: float  # Normalized X coordinate (0-1)
    y: float  # Normalized Y coordinate (0-1)
    category: str  # Garment category in Chinese
    visual_description: str  # Description for image generation
    confidence: float = 0.9


@dataclass
class VisualAnalysisResult:
    """Result from one-shot visual analysis."""

    anchor_points: list[AnchorPoint]
    overall_style: str  # Overall style description
    color_palette: list[str]  # Detected color names
    raw_response: str | None = None


# Prompt template for one-shot analysis
ONE_SHOT_ANALYSIS_PROMPT = """分析这张服装照片，提供以下信息：

1. **检测到的服装单品**：列出图片中所有可见的服装单品，每个单品包含：
   - 类型（如：上衣、裤子、裙子、外套、鞋子、包包、配饰等）
   - 中心点坐标（归一化坐标，范围0-1，格式：[x, y]）
   - 视觉描述（用于AI绘图的英文描述，包含颜色、材质、风格等）

2. **整体风格**：简短描述整体穿搭风格

3. **主要配色**：列出2-4个主要颜色

请严格按照以下JSON格式输出，不要添加其他内容：
```json
{
  "items": [
    {
      "category": "外套",
      "center": [0.5, 0.3],
      "description": "beige oversized trench coat with belt"
    },
    {
      "category": "裤子",
      "center": [0.5, 0.7],
      "description": "black wide-leg pants"
    }
  ],
  "overall_style": "简约通勤风",
  "colors": ["米色", "黑色"]
}
```"""


class QwenVLClient:
    """Client for Qwen-VL-Max visual analysis via DashScope API."""

    DASHSCOPE_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"
    MODEL_NAME = "qwen-vl-max"

    def __init__(self) -> None:
        """Initialize Qwen-VL client."""
        self.api_key = settings.DASHSCOPE_API_KEY
        self._client: httpx.AsyncClient | None = None

    @property
    def client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=60.0)
        return self._client

    async def close(self) -> None:
        """Close HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def analyze_image_one_shot(
        self,
        image_url: str,
    ) -> VisualAnalysisResult:
        """Perform one-shot visual analysis on an image.

        Extracts:
        - Center coordinates for each detected garment
        - Garment category in Chinese
        - Visual description for image generation (English)

        Args:
            image_url: URL of the image to analyze

        Returns:
            VisualAnalysisResult with anchor points and metadata

        Raises:
            QwenVLError: If API call fails or response parsing fails
        """
        if not self.api_key:
            logger.warning("[QwenVL] API key not configured, returning mock result")
            return self._get_mock_result()

        logger.info(f"[QwenVL] Analyzing image: {image_url[:80]}...")

        # Build request payload for DashScope API
        payload = {
            "model": self.MODEL_NAME,
            "input": {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"image": image_url},
                            {"text": ONE_SHOT_ANALYSIS_PROMPT}
                        ]
                    }
                ]
            },
            "parameters": {
                "result_format": "message"
            }
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            response = await self.client.post(
                self.DASHSCOPE_API_URL,
                json=payload,
                headers=headers,
            )
            response.raise_for_status()

            result = response.json()
            logger.debug(f"[QwenVL] Raw response: {result}")

            # Extract content from response
            # DashScope format: output.choices[0].message.content
            content = self._extract_content(result)
            if not content:
                raise QwenVLError("Empty response from Qwen-VL-Max")

            # Parse JSON from response
            parsed = self._parse_json_response(content)

            # Convert to VisualAnalysisResult
            anchor_points = []
            for item in parsed.get("items", []):
                center = item.get("center", [0.5, 0.5])
                anchor_points.append(AnchorPoint(
                    x=float(center[0]) if len(center) > 0 else 0.5,
                    y=float(center[1]) if len(center) > 1 else 0.5,
                    category=item.get("category", "服装"),
                    visual_description=item.get("description", "clothing item"),
                    confidence=0.9,
                ))

            return VisualAnalysisResult(
                anchor_points=anchor_points,
                overall_style=parsed.get("overall_style", "休闲"),
                color_palette=parsed.get("colors", []),
                raw_response=content,
            )

        except httpx.HTTPStatusError as e:
            logger.error(f"[QwenVL] HTTP error: {e.response.status_code} - {e.response.text}")
            raise QwenVLError(f"API request failed: {e.response.status_code}") from e
        except httpx.RequestError as e:
            logger.error(f"[QwenVL] Request error: {e}")
            raise QwenVLError(f"Request failed: {e}") from e
        except Exception as e:
            logger.error(f"[QwenVL] Unexpected error: {e}", exc_info=True)
            raise QwenVLError(f"Analysis failed: {e}") from e

    def _extract_content(self, response: dict[str, Any]) -> str:
        """Extract text content from DashScope response."""
        try:
            # Standard DashScope response format
            output = response.get("output", {})
            choices = output.get("choices", [])
            if choices:
                message = choices[0].get("message", {})
                content = message.get("content", "")
                if isinstance(content, list):
                    # Content may be a list of items
                    for item in content:
                        if isinstance(item, dict) and "text" in item:
                            return item["text"]
                    return str(content[0]) if content else ""
                return content

            # Fallback: direct text in output
            if "text" in output:
                return output["text"]

            return ""
        except Exception as e:
            logger.warning(f"[QwenVL] Failed to extract content: {e}")
            return ""

    def _parse_json_response(self, content: str) -> dict[str, Any]:
        """Parse JSON from LLM response, handling markdown code blocks."""
        # Try to extract JSON from markdown code block
        json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1).strip()
        else:
            # Try to find raw JSON
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                json_str = json_match.group(0)
            else:
                raise QwenVLError(f"No JSON found in response: {content[:200]}")

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            raise QwenVLError(f"Failed to parse JSON: {e}") from e

    def _get_mock_result(self) -> VisualAnalysisResult:
        """Return mock result for development/testing."""
        return VisualAnalysisResult(
            anchor_points=[
                AnchorPoint(
                    x=0.5,
                    y=0.25,
                    category="外套",
                    visual_description="beige trench coat with belt, classic style",
                    confidence=0.95,
                ),
                AnchorPoint(
                    x=0.5,
                    y=0.65,
                    category="裤子",
                    visual_description="black wide-leg dress pants",
                    confidence=0.92,
                ),
            ],
            overall_style="职场通勤风",
            color_palette=["米色", "黑色", "白色"],
            raw_response=None,
        )


class QwenVLError(APIException):
    """Exception raised when Qwen-VL API call fails."""

    def __init__(self, message: str, code: str = "QWEN_VL_ERROR") -> None:
        super().__init__(
            status_code=500,
            code=code,
            message=message,
        )


# Singleton instance
qwen_vl_client = QwenVLClient()
