"""API endpoints for clothing segmentation."""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.integrations.alibaba_vision import vision_client, VisionAPIError
from app.integrations.qwen_vision import qwen_vision_client, QwenVisionError
from app.models.user import User
from app.schemas.segmentation import (
    DescribeClothingRequest,
    DescribeClothingResponse,
    SegmentClothingRequest,
    SegmentClothingResponse,
    SegmentedClothingItemSchema,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/segmentation", tags=["Segmentation"])


@router.post("/segment-clothing", response_model=SegmentClothingResponse)
async def segment_clothing(
    request: SegmentClothingRequest,
    current_user: User = Depends(get_current_user),
) -> SegmentClothingResponse:
    """Segment clothing items from an uploaded photo.
    
    Returns individual segmented items with transparent background,
    but WITHOUT detailed descriptions (descriptions are fetched separately
    after user selection to save API costs).
    
    Args:
        request: Contains the image URL to segment
        current_user: Authenticated user
        
    Returns:
        SegmentClothingResponse with list of segmented items
        
    Raises:
        HTTPException: If segmentation fails
    """
    logger.info(f"[Segmentation] User {current_user.id} requesting segmentation for: {request.image_url[:100]}...")
    
    try:
        # Call SegmentCloth API
        result = await vision_client.segment_cloth(request.image_url)
        
        # Build response with individual items
        items = []
        if result.individual_items:
            for item in result.individual_items:
                items.append(SegmentedClothingItemSchema(
                    id=str(uuid.uuid4()),
                    category=item.category,
                    garment_type=item.garment_type.value,  # Convert enum to string
                    image_url=item.image_url
                ))
        
        logger.info(f"[Segmentation] Successfully segmented {len(items)} items from {len(result.detected_categories)} categories")
        
        return SegmentClothingResponse(
            items=items,
            total_count=len(items),
            original_image_url=request.image_url
        )
        
    except VisionAPIError as e:
        logger.error(f"[Segmentation] Vision API error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"分割失败: {str(e)}"
        )
    except Exception as e:
        logger.error(f"[Segmentation] Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="分割失败，请重试"
        )


@router.post("/describe-clothing", response_model=DescribeClothingResponse)
async def describe_clothing(
    request: DescribeClothingRequest,
    current_user: User = Depends(get_current_user),
) -> DescribeClothingResponse:
    """Describe a single segmented clothing item in detail.
    
    This endpoint is called AFTER user selects a specific clothing item,
    to get detailed description only for the selected item (cost optimization).
    
    Args:
        request: Contains the segmented clothing image URL and category hint
        current_user: Authenticated user
        
    Returns:
        DescribeClothingResponse with color, style, pattern, and description
        
    Raises:
        HTTPException: If description generation fails
    """
    logger.info(f"[Segmentation] User {current_user.id} requesting description for category: {request.category_hint}")
    
    try:
        # Call Qwen-VL to describe the clothing item
        description_result = await qwen_vision_client.describe_single_clothing(
            image_url=request.image_url,
            category_hint=request.category_hint
        )
        
        logger.info(f"[Segmentation] Successfully described item: {description_result.get('description', 'N/A')}")
        
        return DescribeClothingResponse(
            color=description_result.get("color", "未知"),
            style=description_result.get("style", "未知"),
            pattern=description_result.get("pattern", "纯色"),
            description=description_result.get("description", f"{request.category_hint}单品")
        )
        
    except QwenVisionError as e:
        logger.error(f"[Segmentation] Qwen-VL error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"识别失败: {str(e)}"
        )
    except Exception as e:
        logger.error(f"[Segmentation] Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="识别失败，请重试"
        )

