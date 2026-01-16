import logging
import traceback
from typing import Any

from fastapi import APIRouter, status
from pydantic import BaseModel, HttpUrl

from app.integrations.alibaba_vision import vision_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vision")


class SegmentClothRequest(BaseModel):
    """Request model for clothing segmentation."""

    image_url: str


class SegmentClothResponse(BaseModel):
    """Response model for clothing segmentation."""

    origin_image_url: str
    mask_url: str  # The segmented image (cutout)


class DetectMainBodyRequest(BaseModel):
    """Request model for main body detection."""
    image_url: str


class Box(BaseModel):
    y: int
    x: int
    height: int
    width: int


class DetectMainBodyResponse(BaseModel):
    """Response model for main body detection."""
    box: Box


@router.post(
    "/segment/cloth",
    response_model=SegmentClothResponse,
    status_code=status.HTTP_200_OK,
    summary="Segment clothing from image",
    description="Uses Alibaba Cloud Clothing Segmentation API to extract clothing subject from background.",
)
async def segment_cloth(request: SegmentClothRequest) -> Any:
    """Segment cloth from image."""
    logger.info(f"[Vision] segment_cloth called with image_url: {request.image_url[:100]}...")
    try:
        segmentation_result = await vision_client.segment_cloth(request.image_url)
        logger.info(f"[Vision] segment_cloth success, detected categories: {segmentation_result.detected_categories}")
        return SegmentClothResponse(
            origin_image_url=request.image_url,
            mask_url=segmentation_result.mask_url,
        )
    except Exception as e:
        logger.error(f"[Vision] segment_cloth FAILED: {str(e)}")
        logger.error(f"[Vision] Full traceback: {traceback.format_exc()}")
        raise


@router.post(
    "/detect/main-body",
    response_model=DetectMainBodyResponse,
    status_code=status.HTTP_200_OK,
    summary="Detect main body in image",
    description="Uses Alibaba Cloud DetectMainBody API to find the subject's bounding box.",
)
async def detect_main_body(request: DetectMainBodyRequest) -> Any:
    """Detect main body from image."""
    logger.info(f"[Vision] detect_main_body called with image_url: {request.image_url[:100]}...")
    try:
        box_data = await vision_client.detect_main_body(request.image_url)
        logger.info(f"[Vision] detect_main_body success: {box_data}")
        return DetectMainBodyResponse(
            box=box_data # type: ignore
        )
    except Exception as e:
        logger.error(f"[Vision] detect_main_body FAILED: {str(e)}")
        logger.error(f"[Vision] Full traceback: {traceback.format_exc()}")
        raise
