"""Qwen-VL-Max Vision API integration for clothing detection.

Uses DashScope API to call Qwen-VL-Max for visual analysis of clothing items.
Returns structured data with clothing categories and positions.
"""

import json
import logging
from dataclasses import dataclass
from typing import Any

import dashscope
from dashscope import MultiModalConversation

from app.config import settings
from app.core.exceptions import APIException

logger = logging.getLogger(__name__)


@dataclass
class ClothingItem:
    """Detected clothing item with position."""
    id: str
    category: str
    description: str
    center_x: float  # Normalized 0-1
    center_y: float  # Normalized 0-1


@dataclass
class VisualAnalysisResult:
    """Result of visual clothing analysis."""
    items: list[ClothingItem]
    raw_response: str | None = None


# System prompt for clothing detection
CLOTHING_DETECTION_PROMPT = """你是一个专业的服装识别AI。请分析这张图片中的服装单品。

要求：
1. 识别图片中所有可见的服装单品（如：外套、上衣、裤子、裙子、鞋子、包包等）
2. 对于每个单品，提供：
   - category: 类别名称（中文，如：外套、上衣、裤子、裙子、鞋子、包包）
   - description: 简短描述（英文，如：black leather jacket）
   - center_x: 单品中心点的水平位置（0-1之间的小数，0=最左，1=最右）
   - center_y: 单品中心点的垂直位置（0-1之间的小数，0=最上，1=最下）

请以JSON数组格式返回，例如：
```json
[
  {"category": "外套", "description": "beige trench coat", "center_x": 0.5, "center_y": 0.25},
  {"category": "裤子", "description": "black jeans", "center_x": 0.5, "center_y": 0.7}
]
```

只返回JSON数组，不要其他文字。如果图片中没有服装，返回空数组 []。"""


class QwenVisionClient:
    """Client for Qwen-VL-Max visual analysis."""

    def __init__(self) -> None:
        """Initialize Qwen Vision client."""
        # DashScope supports two authentication methods:
        # 1. Dedicated API Key (sk-xxxxx)
        # 2. AccessKeyID:AccessKeySecret format
        if settings.DASHSCOPE_API_KEY:
            dashscope.api_key = settings.DASHSCOPE_API_KEY
            logger.info("[QwenVision] Using dedicated DASHSCOPE_API_KEY")
        elif settings.ALIBABA_ACCESS_KEY_ID and settings.ALIBABA_ACCESS_KEY_SECRET:
            # Use existing Alibaba Cloud credentials in format: "AccessKeyID:AccessKeySecret"
            dashscope.api_key = f"{settings.ALIBABA_ACCESS_KEY_ID}:{settings.ALIBABA_ACCESS_KEY_SECRET}"
            logger.info("[QwenVision] Using ALIBABA_ACCESS_KEY credentials for DashScope")
        else:
            logger.warning("[QwenVision] No API credentials configured, API calls will fail")

    async def analyze_clothing_items(self, image_url: str) -> VisualAnalysisResult:
        """Analyze clothing items in an image.

        Uses Base64 encoding for maximum stability with DashScope API.
        This approach is recommended by Alibaba Cloud for images < 7MB.

        Args:
            image_url: URL of the image to analyze (OSS signed URL).

        Returns:
            VisualAnalysisResult with detected clothing items and positions.
        """
        import base64
        from urllib.parse import unquote

        import httpx

        if not settings.DASHSCOPE_API_KEY and not (
            settings.ALIBABA_ACCESS_KEY_ID and settings.ALIBABA_ACCESS_KEY_SECRET
        ):
            raise QwenVisionError("No API credentials configured (need DASHSCOPE_API_KEY or ALIBABA_ACCESS_KEY)", code="CONFIG_ERROR")

        # Decode URL if it was encoded during transmission
        if '%' in image_url:
            decoded_url = unquote(image_url)
            logger.info("[QwenVision] URL was encoded, decoded for download")
        else:
            decoded_url = image_url

        logger.info(f"[QwenVision] Downloading image from OSS: {decoded_url[:80]}...")

        try:
            # Step 1: Download image from OSS
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(decoded_url)
                response.raise_for_status()
                image_bytes = response.content
                content_type = response.headers.get("content-type", "image/jpeg")

            logger.info(f"[QwenVision] Downloaded {len(image_bytes)} bytes, type: {content_type}")

            # Step 2: Convert to Base64
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")

            # Determine image format from content-type
            if "png" in content_type:
                mime_type = "image/png"
            elif "gif" in content_type:
                mime_type = "image/gif"
            elif "webp" in content_type:
                mime_type = "image/webp"
            else:
                mime_type = "image/jpeg"

            # Create data URI for DashScope API
            data_uri = f"data:{mime_type};base64,{image_base64}"
            logger.info(f"[QwenVision] Base64 encoded image ({mime_type}), size: {len(image_base64)} chars")

            # Step 3: Build multimodal message with Base64 image
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"image": data_uri},
                        {"text": CLOTHING_DETECTION_PROMPT},
                    ],
                }
            ]

            # Step 4: Call Qwen-VL-Max API
            logger.info("[QwenVision] Calling Qwen-VL-Max API...")
            response = MultiModalConversation.call(
                model="qwen-vl-max",
                messages=messages,
            )

            if response.status_code != 200:
                logger.error(f"[QwenVision] API error: {response.code} - {response.message}")
                raise QwenVisionError(f"API call failed: {response.message}", code=response.code)

            # Extract response content
            raw_content = response.output.choices[0].message.content[0].get("text", "")
            logger.info(f"[QwenVision] Raw response: {raw_content[:200]}...")

            # Parse JSON response
            items = self._parse_response(raw_content)

            return VisualAnalysisResult(
                items=items,
                raw_response=raw_content,
            )

        except httpx.HTTPStatusError as e:
            logger.error(f"[QwenVision] Failed to download image: {e}")
            raise QwenVisionError(f"Failed to download image: {e.response.status_code}") from e
        except httpx.RequestError as e:
            logger.error(f"[QwenVision] Network error downloading image: {e}")
            raise QwenVisionError(f"Network error: {str(e)}") from e
        except QwenVisionError:
            raise
        except Exception as e:
            logger.error(f"[QwenVision] Unexpected error: {str(e)}", exc_info=True)
            raise QwenVisionError(f"Analysis failed: {str(e)}") from e

    def _parse_response(self, content: str) -> list[ClothingItem]:
        """Parse JSON response from Qwen-VL-Max.

        Args:
            content: Raw text response from the model.

        Returns:
            List of ClothingItem objects.
        """
        # Try to extract JSON from the response
        # The model might wrap JSON in markdown code blocks
        json_str = content.strip()

        # Remove markdown code blocks if present
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        elif json_str.startswith("```"):
            json_str = json_str[3:]

        if json_str.endswith("```"):
            json_str = json_str[:-3]

        json_str = json_str.strip()

        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.warning(f"[QwenVision] Failed to parse JSON: {e}, raw: {content[:100]}")
            # Return empty list if parsing fails
            return []

        if not isinstance(data, list):
            logger.warning(f"[QwenVision] Expected list, got {type(data)}")
            return []

        items = []
        for idx, item in enumerate(data):
            try:
                clothing_item = ClothingItem(
                    id=str(idx + 1),
                    category=item.get("category", "服装"),
                    description=item.get("description", ""),
                    center_x=float(item.get("center_x", 0.5)),
                    center_y=float(item.get("center_y", 0.5)),
                )
                items.append(clothing_item)
            except (KeyError, ValueError, TypeError) as e:
                logger.warning(f"[QwenVision] Failed to parse item {idx}: {e}")
                continue

        logger.info(f"[QwenVision] Parsed {len(items)} clothing items")
        return items


class QwenVisionError(APIException):
    """Exception raised when Qwen Vision API call fails."""

    def __init__(self, message: str, code: str = "QWEN_VISION_ERROR") -> None:
        super().__init__(
            status_code=500,
            code=code,
            message=message,
        )


# Singleton instance
qwen_vision_client = QwenVisionClient()
