from typing import Any

from fastapi import APIRouter, status
from pydantic import BaseModel, HttpUrl

from app.integrations.alibaba_vision import vision_client

router = APIRouter()


class SegmentClothRequest(BaseModel):
    """Request model for clothing segmentation."""

    image_url: str


class SegmentClothResponse(BaseModel):
    """Response model for clothing segmentation."""

    origin_image_url: str
    mask_url: str  # The segmented image (cutout)


@router.post(
    "/segment/cloth",
    response_model=SegmentClothResponse,
    status_code=status.HTTP_200_OK,
    summary="Segment clothing from image",
    description="Uses Alibaba Cloud Clothing Segmentation API to extract clothing subject from background.",
)
async def segment_cloth(request: SegmentClothRequest) -> Any:
    """Segment cloth from image."""
    mask_url = await vision_client.segment_cloth(request.image_url)
    
    return SegmentClothResponse(
        origin_image_url=request.image_url,
        mask_url=mask_url,
    )
