"""Outfit generation and management endpoints."""

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.outfit import (
    GenerateOutfitRequest,
    GenerateOutfitResponse,
    OutfitItemSchema,
    OutfitRecommendationSchema,
    TheorySchema,
)
from app.services.ai_orchestrator import ai_orchestrator

router = APIRouter(prefix="/outfits", tags=["outfits"])


@router.post("/generate", response_model=GenerateOutfitResponse)
async def generate_outfit_recommendations(
    request: GenerateOutfitRequest,
    current_user: User = Depends(get_current_user),
) -> GenerateOutfitResponse:
    """Generate 3 AI outfit recommendations based on garment and occasion.

    Args:
        request: Generation request with photo URL, occasion, and garment data
        current_user: Authenticated user

    Returns:
        GenerateOutfitResponse with 3 outfit recommendations
    """
    try:
        # Get user preferences (optional)
        body_type = None
        user_styles = None

        # Get user preferences if available
        if current_user.preferences:
            body_type = current_user.preferences.body_type
            user_styles = current_user.preferences.style_preferences

        # Generate outfit recommendations
        recommendations = await ai_orchestrator.generate_outfit_recommendations(
            garment_type=request.garmentData.garmentType,
            colors=request.garmentData.primaryColors,
            style_tags=request.garmentData.styleTags,
            occasion=request.occasion,
            body_type=body_type,
            user_styles=user_styles,
        )

        # Convert to response schema
        recommendation_schemas = []
        for rec in recommendations:
            items = [
                OutfitItemSchema(
                    itemType=item.item_type,
                    name=item.name,
                    color=item.color,
                    colorHex=item.color_hex,
                    styleTip=item.style_tip,
                    imageUrl=item.image_url,
                )
                for item in rec.items
            ]

            theory = TheorySchema(
                colorPrinciple=rec.theory.color_principle,
                styleAnalysis=rec.theory.style_analysis,
                bodyTypeAdvice=rec.theory.body_type_advice,
                occasionFit=rec.theory.occasion_fit,
                fullExplanation=rec.theory.full_explanation,
            )

            recommendation_schemas.append(
                OutfitRecommendationSchema(
                    id=rec.id,
                    name=rec.name,
                    items=items,
                    theory=theory,
                    styleTags=rec.style_tags,
                    confidence=rec.confidence,
                )
            )

        return GenerateOutfitResponse(
            success=True,
            recommendations=recommendation_schemas,
            occasion=request.occasion,
            message="成功生成3套搭配方案",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"生成搭配方案失败: {e!s}",
        ) from None


# Placeholder for future implementation:
# GET / - List user's outfit history
# GET /:id - Get outfit details
# POST /:id/like - Like/save an outfit
# DELETE /:id - Delete from history
