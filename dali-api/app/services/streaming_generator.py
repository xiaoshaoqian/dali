"""Streaming outfit generator service.

This service coordinates the streaming AI generation pipeline:
1. Call Qwen-VL-Max for one-shot visual analysis
2. Stream LLM response with <draw_prompt> tag detection
3. Async trigger image generation when tag is detected
4. Deliver events via SSE to frontend

State machine: STREAMING_TEXT → BUFFERING_PROMPT → TRIGGERING_IMAGE → STREAMING_TEXT
"""

import asyncio
import logging
import uuid
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

import httpx

from app.config import settings
from app.integrations.qwen_vl import QwenVLError, VisualAnalysisResult, qwen_vl_client
from app.integrations.siliconflow import SiliconFlowError, siliconflow_client

logger = logging.getLogger(__name__)


class StreamState(str, Enum):
    """States for the streaming state machine."""

    STREAMING_TEXT = "streaming_text"
    BUFFERING_PROMPT = "buffering_prompt"
    TRIGGERING_IMAGE = "triggering_image"
    COMPLETE = "complete"
    ERROR = "error"


@dataclass
class SSEEvent:
    """Server-Sent Event data structure."""

    event: str
    data: dict[str, Any]

    def to_sse_format(self) -> str:
        """Convert to SSE wire format."""
        import json
        return f"event: {self.event}\ndata: {json.dumps(self.data, ensure_ascii=False)}\n\n"


@dataclass
class StreamingContext:
    """Context maintained during streaming generation."""

    outfit_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    state: StreamState = StreamState.STREAMING_TEXT
    text_buffer: str = ""
    draw_prompt_buffer: str = ""
    generated_image_url: str | None = None
    visual_analysis: VisualAnalysisResult | None = None
    error: str | None = None

    # Image generation task (runs async)
    image_task: asyncio.Task | None = None


# System prompt with draw_prompt instructions
OUTFIT_SYSTEM_PROMPT = """你是一位专业的时尚搭配顾问，为用户提供穿搭建议。

用户会提供一张服装照片，你需要：
1. 分析照片中的服装特点（颜色、款式、材质等）
2. 根据用户选择的场景，推荐搭配方案
3. 用简洁生动的语言描述搭配理论

**重要格式要求**：
在输出推荐单品后，用 <draw_prompt>英文绘图指令</draw_prompt> 标签包裹一段图片生成提示词（英文），
然后继续输出搭配理论解析。标签内容对用户不可见，但会用于生成搭配效果图。

示例输出格式：
---
根据您的米色风衣，我为您推荐以下职场通勤搭配：

**推荐单品**：
- 内搭：白色真丝衬衫，优雅大方
- 下装：黑色阔腿西裤，显瘦修长
- 配饰：金色耳钉，精致点睛

<draw_prompt>a professional woman wearing beige trench coat, white silk blouse, black wide-leg pants, minimalist style, office background, fashion photography</draw_prompt>

**搭配理论**：
采用**高对比度配色法则**，米色与黑色形成视觉冲击，白色内搭提亮肤色。阔腿裤拉长腿部线条，整体造型干练优雅，完美匹配职场通勤场景。
---

请务必包含 <draw_prompt> 标签，内容用英文描述完整的搭配效果。"""


class StreamingOutfitGenerator:
    """Streaming outfit generation with real-time SSE events."""

    TONGYI_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    MODEL_NAME = "qwen-max"

    def __init__(self) -> None:
        """Initialize generator."""
        self._client: httpx.AsyncClient | None = None

    @property
    def client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=120.0)
        return self._client

    async def close(self) -> None:
        """Clean up resources."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def generate_stream(
        self,
        image_url: str,
        occasion: str,
        selected_item: str | None = None,
    ) -> AsyncGenerator[SSEEvent, None]:
        """Generate outfit recommendations with streaming SSE events.

        Args:
            image_url: URL of the user's garment photo
            occasion: Selected occasion (职场通勤, 约会, etc.)
            selected_item: Optional specific item to focus on

        Yields:
            SSEEvent objects for frontend consumption
        """
        ctx = StreamingContext()
        logger.info(f"[StreamGen] Starting generation for outfit_id={ctx.outfit_id}")

        try:
            # Step 1: Visual analysis
            yield SSEEvent(event="thinking", data={"message": "正在分析服装..."})
            ctx.visual_analysis = await self._analyze_image(image_url)

            if ctx.visual_analysis:
                # Send anchor points to frontend
                anchors = [
                    {
                        "x": ap.x,
                        "y": ap.y,
                        "category": ap.category,
                    }
                    for ap in ctx.visual_analysis.anchor_points
                ]
                yield SSEEvent(event="analysis_complete", data={"anchors": anchors})

            # Step 2: Build user message with context
            user_message = self._build_user_message(
                image_url=image_url,
                occasion=occasion,
                visual_analysis=ctx.visual_analysis,
                selected_item=selected_item,
            )

            # Step 3: Stream LLM response
            async for event in self._stream_llm_response(ctx, user_message):
                yield event

            # Step 4: Wait for image generation if started
            if ctx.image_task and not ctx.image_task.done():
                yield SSEEvent(event="image_generating", data={"message": "正在生成搭配效果图..."})
                try:
                    image_result = await asyncio.wait_for(ctx.image_task, timeout=60.0)
                    ctx.generated_image_url = image_result.image_url
                    yield SSEEvent(event="image_ready", data={"url": image_result.image_url})
                except TimeoutError:
                    logger.warning("[StreamGen] Image generation timed out")
                    yield SSEEvent(event="image_failed", data={"message": "图片生成超时"})
                except Exception as e:
                    logger.error(f"[StreamGen] Image generation failed: {e}")
                    yield SSEEvent(event="image_failed", data={"message": "图片生成失败"})

            # Step 5: Complete
            ctx.state = StreamState.COMPLETE
            yield SSEEvent(
                event="complete",
                data={
                    "outfit_id": ctx.outfit_id,
                    "generated_image_url": ctx.generated_image_url,
                },
            )

        except Exception as e:
            ctx.state = StreamState.ERROR
            ctx.error = str(e)
            logger.error(f"[StreamGen] Generation failed: {e}", exc_info=True)
            yield SSEEvent(event="error", data={"message": "生成失败，请重试", "code": "GENERATION_FAILED"})

    async def _analyze_image(self, image_url: str) -> VisualAnalysisResult | None:
        """Perform visual analysis using Qwen-VL-Max."""
        try:
            return await qwen_vl_client.analyze_image_one_shot(image_url)
        except QwenVLError as e:
            logger.warning(f"[StreamGen] Visual analysis failed: {e}")
            return None

    def _build_user_message(
        self,
        image_url: str,
        occasion: str,
        visual_analysis: VisualAnalysisResult | None,
        selected_item: str | None,
    ) -> str:
        """Build user message for LLM."""
        parts = [f"场景：{occasion}"]

        if visual_analysis:
            items = [f"- {ap.category}" for ap in visual_analysis.anchor_points]
            if items:
                parts.append("识别到的服装：\n" + "\n".join(items))
            if visual_analysis.color_palette:
                parts.append(f"主要配色：{', '.join(visual_analysis.color_palette)}")

        if selected_item:
            parts.append(f"用户选择的单品：{selected_item}")

        parts.append("请根据以上信息，提供搭配建议。")
        return "\n\n".join(parts)

    async def _stream_llm_response(
        self,
        ctx: StreamingContext,
        user_message: str,
    ) -> AsyncGenerator[SSEEvent, None]:
        """Stream LLM response and detect draw_prompt tags."""
        api_key = settings.DASHSCOPE_API_KEY or settings.TONGYI_API_KEY
        if not api_key:
            logger.warning("[StreamGen] No API key, using mock response")
            async for event in self._mock_stream_response(ctx):
                yield event
            return

        # Build request
        payload = {
            "model": self.MODEL_NAME,
            "input": {
                "messages": [
                    {"role": "system", "content": OUTFIT_SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ]
            },
            "parameters": {
                "result_format": "message",
                "incremental_output": True,  # Enable streaming
            },
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-DashScope-SSE": "enable",  # Enable SSE streaming
        }

        try:
            async with self.client.stream(
                "POST",
                self.TONGYI_API_URL,
                json=payload,
                headers=headers,
            ) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue

                    data_str = line[5:].strip()
                    if data_str == "[DONE]":
                        break

                    try:
                        import json
                        data = json.loads(data_str)
                        chunk = self._extract_chunk(data)
                        if chunk:
                            async for event in self._process_chunk(ctx, chunk):
                                yield event
                    except json.JSONDecodeError:
                        continue

        except httpx.HTTPStatusError as e:
            logger.error(f"[StreamGen] LLM API error: {e.response.status_code}")
            raise
        except Exception as e:
            logger.error(f"[StreamGen] LLM stream error: {e}")
            raise

    def _extract_chunk(self, data: dict[str, Any]) -> str:
        """Extract text chunk from DashScope streaming response."""
        try:
            output = data.get("output", {})
            choices = output.get("choices", [])
            if choices:
                message = choices[0].get("message", {})
                return message.get("content", "")
            return ""
        except Exception:
            return ""

    async def _process_chunk(
        self,
        ctx: StreamingContext,
        chunk: str,
    ) -> AsyncGenerator[SSEEvent, None]:
        """Process a text chunk, handling draw_prompt tag detection."""
        ctx.text_buffer += chunk

        # Check for draw_prompt tag start
        if ctx.state == StreamState.STREAMING_TEXT:
            if "<draw_prompt>" in ctx.text_buffer:
                # Found start of draw_prompt
                before, _, after = ctx.text_buffer.partition("<draw_prompt>")

                # Send text before the tag
                if before.strip():
                    yield SSEEvent(event="text_chunk", data={"content": before})

                ctx.text_buffer = after
                ctx.state = StreamState.BUFFERING_PROMPT
                yield SSEEvent(event="thinking", data={"message": "AI正在构思搭配理论..."})

            else:
                # Check if we might be in the middle of the tag
                if "<" in chunk and not ctx.text_buffer.endswith(">"):
                    # Might be partial tag, wait for more
                    pass
                else:
                    # Safe to send
                    to_send = ctx.text_buffer[:-10] if len(ctx.text_buffer) > 10 else ""
                    if to_send:
                        yield SSEEvent(event="text_chunk", data={"content": to_send})
                        ctx.text_buffer = ctx.text_buffer[-10:]

        elif ctx.state == StreamState.BUFFERING_PROMPT:
            # Buffering content until </draw_prompt>
            if "</draw_prompt>" in ctx.text_buffer:
                # Found end of draw_prompt
                prompt, _, after = ctx.text_buffer.partition("</draw_prompt>")
                ctx.draw_prompt_buffer = prompt.strip()
                ctx.text_buffer = after
                ctx.state = StreamState.TRIGGERING_IMAGE

                # Trigger async image generation
                logger.info(f"[StreamGen] Detected draw_prompt: {ctx.draw_prompt_buffer[:100]}...")
                ctx.image_task = asyncio.create_task(
                    self._generate_image(ctx.draw_prompt_buffer)
                )

                yield SSEEvent(event="image_generating", data={"prompt": ctx.draw_prompt_buffer[:50] + "..."})
                ctx.state = StreamState.STREAMING_TEXT

        # Continue streaming remaining text
        if ctx.state == StreamState.STREAMING_TEXT and ctx.text_buffer:
            # Send accumulated text periodically
            if len(ctx.text_buffer) > 50:
                yield SSEEvent(event="text_chunk", data={"content": ctx.text_buffer})
                ctx.text_buffer = ""

    async def _generate_image(self, prompt: str) -> Any:
        """Generate image using SiliconFlow (runs async)."""
        try:
            # For Img2Img we'd need the original image URL
            # For now, use text-to-image
            result = await siliconflow_client.generate_text2img(
                prompt=prompt,
                negative_prompt="blurry, low quality, distorted",
            )
            logger.info(f"[StreamGen] Image generated: {result.image_url[:80]}...")
            return result
        except SiliconFlowError as e:
            logger.error(f"[StreamGen] Image generation failed: {e}")
            raise

    async def _mock_stream_response(
        self,
        ctx: StreamingContext,
    ) -> AsyncGenerator[SSEEvent, None]:
        """Generate mock streaming response for development."""
        mock_response = """根据您的米色风衣，我为您推荐以下职场通勤搭配：

**推荐单品**：
- 内搭：白色真丝衬衫，优雅大方
- 下装：黑色阔腿西裤，显瘦修长
- 鞋子：裸色尖头高跟鞋
- 配饰：金色耳钉，精致点睛

<draw_prompt>a professional woman wearing beige trench coat, white silk blouse, black wide-leg pants, nude pointed heels, minimalist gold earrings, office background, fashion photography, elegant style</draw_prompt>

**搭配理论**：
采用**高对比度配色法则**，米色与黑色形成视觉冲击，白色内搭提亮肤色。阔腿裤拉长腿部线条，整体造型干练优雅，完美匹配职场通勤场景。

这套搭配遵循**三色原则**，主色米色占据60%，黑色作为辅助色占30%，白色和金色作为点缀色占10%，层次分明又不失协调。"""

        # Simulate streaming character by character
        for i, char in enumerate(mock_response):
            async for event in self._process_chunk(ctx, char):
                yield event
            if i % 10 == 0:
                await asyncio.sleep(0.05)

        # Flush remaining buffer
        if ctx.text_buffer:
            yield SSEEvent(event="text_chunk", data={"content": ctx.text_buffer})
            ctx.text_buffer = ""


# Singleton instance
streaming_generator = StreamingOutfitGenerator()
