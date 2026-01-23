"""SSE streaming endpoint for AI outfit generation.

Provides Server-Sent Events (SSE) streaming for real-time outfit generation:
- Real-time text streaming from LLM
- Thinking state notifications
- Image generation progress
- Error handling with graceful fallback
"""

import asyncio
import json
import logging
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.models.user import User
from app.services.streaming_generator import streaming_generator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/outfits", tags=["outfits-sse"])


class GenerateStreamRequest(BaseModel):
    """Request schema for streaming outfit generation."""

    selected_item_url: str = Field(..., description="URL of the selected segmented clothing item")
    selected_item_description: str = Field(..., description="Description of the selected item (e.g., '蓝色圆领短袖T恤')")
    selected_item_category: str = Field(..., description="Category of the selected item (e.g., '上衣', '裤子')")
    occasion: str = Field(..., description="Occasion for the outfit (职场通勤, 约会, etc.)")
    original_image_url: str | None = Field(None, description="Optional original uploaded image URL for context")


async def event_generator(
    selected_item_url: str,
    selected_item_description: str,
    selected_item_category: str,
    occasion: str,
    original_image_url: str | None,
    user_id: str,
) -> AsyncGenerator[str, None]:
    """Generate SSE events from streaming generator.

    Formats events in SSE wire protocol:
    event: <event_type>
    data: <json_data>

    """
    logger.info(f"[SSE] Starting stream for user={user_id}, occasion={occasion}")

    try:
        async for event in streaming_generator.generate_stream(
            selected_item_url=selected_item_url,
            selected_item_description=selected_item_description,
            selected_item_category=selected_item_category,
            occasion=occasion,
            original_image_url=original_image_url,
        ):
            # Format as SSE
            event_str = f"event: {event.event}\ndata: {json.dumps(event.data, ensure_ascii=False)}\n\n"
            yield event_str

            # Small delay to prevent overwhelming the client
            await asyncio.sleep(0.01)

    except asyncio.CancelledError:
        logger.info(f"[SSE] Stream cancelled for user={user_id}")
        yield f"event: cancelled\ndata: {json.dumps({'message': '连接已断开'})}\n\n"
    except Exception as e:
        logger.error(f"[SSE] Stream error for user={user_id}: {e}", exc_info=True)
        yield f"event: error\ndata: {json.dumps({'message': '生成失败', 'code': 'STREAM_ERROR'})}\n\n"

    # Send done signal
    yield "event: done\ndata: {}\n\n"
    logger.info(f"[SSE] Stream completed for user={user_id}")


@router.post("/generate-stream")
async def generate_outfit_stream(
    request: GenerateStreamRequest,
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    """Generate outfit recommendations with SSE streaming.

    Returns a Server-Sent Events stream with the following event types:

    - **thinking**: AI is processing (data: {message: string})
    - **analysis_complete**: Visual analysis done (data: {anchors: array})
    - **text_chunk**: Streaming text content (data: {content: string})
    - **image_generating**: Image generation started (data: {prompt: string})
    - **image_ready**: Generated image ready (data: {url: string})
    - **image_failed**: Image generation failed (data: {message: string})
    - **complete**: Generation complete (data: {outfit_id: string, generated_image_url: string|null})
    - **error**: Error occurred (data: {message: string, code: string})
    - **done**: Stream ended (data: {})

    The stream uses chunked transfer encoding and should be consumed with an EventSource client.

    Example frontend usage:
    ```javascript
    const eventSource = new EventSource('/api/v1/outfits/generate-stream', {
        method: 'POST',
        body: JSON.stringify({image_url: '...', occasion: '职场通勤'}),
    });
    eventSource.addEventListener('text_chunk', (e) => {
        const data = JSON.parse(e.data);
        appendText(data.content);
    });
    ```
    """
    logger.info(
        f"[SSE] Generate stream request: user={current_user.id}, "
        f"occasion={request.occasion}, image={request.image_url[:50]}..."
    )

    return StreamingResponse(
        event_generator(
            selected_item_url=request.selected_item_url,
            selected_item_description=request.selected_item_description,
            selected_item_category=request.selected_item_category,
            occasion=request.occasion,
            original_image_url=request.original_image_url,
            user_id=str(current_user.id),
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    )


@router.get("/generate-stream-test")
async def test_sse_stream() -> StreamingResponse:
    """Test SSE endpoint (no auth, for development only).

    Returns a simple SSE stream to verify client connectivity.
    """
    async def test_generator() -> AsyncGenerator[str, None]:
        yield "event: connected\ndata: {\"message\": \"SSE connection established\"}\n\n"
        await asyncio.sleep(1)

        for i in range(5):
            yield f"event: text_chunk\ndata: {{\"content\": \"测试文本 {i + 1}... \"}}\n\n"
            await asyncio.sleep(0.5)

        yield "event: thinking\ndata: {\"message\": \"AI正在思考...\"}\n\n"
        await asyncio.sleep(1)

        yield "event: complete\ndata: {\"outfit_id\": \"test-123\"}\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(
        test_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
