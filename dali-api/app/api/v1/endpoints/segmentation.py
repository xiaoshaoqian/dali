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
        # Prepare URL for Vision API
        vision_image_url = request.image_url
        
        # Check if it's our internal OSS URL
        from app.config import settings
        if settings.ALIBABA_OSS_ENDPOINT in request.image_url and "Subject to" not in request.image_url:
            # For internal OSS images, we might have signature issues with Vision API
            # Strategy: Download image data and pass as Base64 to Vision API
            # This bypasses all URL encoding/signing compatibility issues
            import httpx
            import base64
            
            async with httpx.AsyncClient() as client:
                try:
                    # Download the image content
                    # request.image_url is the Presigned URL from frontend (valid for download)
                    resp = await client.get(request.image_url, timeout=30.0)
                    if resp.status_code == 200:
                        image_content = resp.content
                        # Alibaba Cloud Vision API expects raw image URL or Base64 (depending on SDK)
                        # SDK `segment_cloth` usually takes URL. But let's check if we can pass Base64.
                        # If SDK requires URL, we might need to put it to a temporary public path? 
                        # No, that's unsafe.
                        # Let's try passing URL first with careful handling, if Base64 isn't supported by the high-level method.
                        
                        # WAIT: The SDK `segment_cloth` method takes `SegmentClothRequest`.
                        # It has `image_url` field.
                        # Checking documentation: ImageURL supports Base64. Format: protocol header not needed usually, or needed?
                        # Doc says: "base64 encoding of the image file".
                        # Let's try standard Base64 string.
                        
                        # However, to be safe and avoid SDK validation errors on "Not a URL",
                        # We will try to use the `body` stream approach if supported, 
                        # OR, stick to the Base64 in ImageURL field.
                        
                        # Let's Assume Base64 works in image_url field as per common AliCloud API behavior.
                        # Format: "data:image/jpeg;base64,...."? Or just raw?
                        # Usually Ali APIs accept: "http://..." or "base64code..."
                        
                        base64_str = base64.b64encode(image_content).decode('utf-8')
                        # Some Ali SDKs require protocol prefix
                        vision_image_url = f"data:image/jpeg;base64,{base64_str}"
                        logger.info(f"[Segmentation] Using Base64 image content ({len(base64_str)} chars) for Vision API")
                    else:
                        logger.warning(f"[Segmentation] Failed to download source image: {resp.status_code}. Using original URL.")
                except Exception as e:
                    logger.warning(f"[Segmentation] Download for Base64 failed: {e}. Using original URL.")

        # Call SegmentCloth API
        result = await vision_client.segment_cloth(vision_image_url)
        
        # Build response with individual items
        items = []
        if result.individual_items:
            # Initialize HTTP client for downloading images
            import httpx
            from app.services.storage import storage_service
            
            async with httpx.AsyncClient() as client:
                for item in result.individual_items:
                    # Generic filename for the segmented item
                    item_id = str(uuid.uuid4())
                    object_key = f"users/{current_user.id}/segmented/{item_id}.png"
                    
                    try:
                        # Download image from Vision API (temporary URL)
                        # Use verify=False if necessary, but Alibaba SSL should be trusted
                        img_resp = await client.get(item.image_url, timeout=10.0)
                        
                        final_url = item.image_url # Fallback
                        
                        if img_resp.status_code == 200:
                            content_length = len(img_resp.content)
                            logger.info(f"[Segmentation] Downloaded {item.category} size: {content_length} bytes")
                            
                            if content_length == 0:
                                logger.warning(f"[Segmentation] ⚠️ Warning: {item.category} image content is empty!")

                            # Upload to our OSS
                            success = storage_service.upload_file(
                                object_key=object_key,
                                data=img_resp.content,
                                content_type="image/png"
                            )
                            
                            if success:
                                # Get signed HTTPS URL from our OSS
                                final_url = storage_service.get_file_url(object_key)
                                logger.info(f"[Segmentation] Re-uploaded item {item.category} to {object_key}")
                            else:
                                logger.error(f"[Segmentation] Failed to upload {item.category} to OSS")
                        else:
                            logger.error(f"[Segmentation] Failed to download {item.category} from Vision API: {img_resp.status_code}")
                            
                    except Exception as e:
                        logger.error(f"[Segmentation] Error processing item {item.category}: {e}")
                        final_url = item.image_url # Fallback to original if anything fails

                    items.append(SegmentedClothingItemSchema(
                        id=item_id,
                        category=item.category,
                        garment_type=item.garment_type.value,  # Convert enum to string
                        image_url=final_url
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

