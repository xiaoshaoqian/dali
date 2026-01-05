"""Garment API routes for image analysis and garment management."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.integrations.alibaba_vision import VisionAPIError, vision_client
from app.models.user import User
from app.schemas.garment import (
    ColorInfoSchema,
    GarmentAnalysisRequest,
    GarmentAnalysisResponse,
)

router = APIRouter(prefix="/garments", tags=["Garments"])


@router.post("/analyze", response_model=GarmentAnalysisResponse)
async def analyze_garment(
    request: GarmentAnalysisRequest,
    current_user: User = Depends(get_current_user),
) -> GarmentAnalysisResponse:
    """Analyze a garment image using Vision API.

    Extracts garment type, colors, and style tags from the image.

    Args:
        request: Contains the image URL to analyze
        current_user: Authenticated user

    Returns:
        GarmentAnalysisResponse with detected attributes

    Raises:
        HTTPException: If analysis fails
    """
    try:
        # Call Vision API to analyze the garment
        result = await vision_client.analyze_garment(request.image_url)

        # Convert to response schema
        return GarmentAnalysisResponse(
            garmentType=result.garment_type.value,
            primaryColors=[
                ColorInfoSchema(
                    hex=color.hex,
                    name=color.name,
                    percentage=color.percentage,
                )
                for color in result.primary_colors
            ],
            styleTags=[tag.value for tag in result.style_tags],
            confidence=result.confidence,
        )

    except VisionAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "抱歉，我没看清这件衣服，能换个角度再拍一张吗？",
                "code": e.code or "ANALYSIS_FAILED",
            },
        ) from None
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "分析失败，请稍后重试",
                "code": "INTERNAL_ERROR",
            },
        ) from None
