"""Outfit schemas for generation and management."""

from pydantic import BaseModel, Field


class OutfitItemSchema(BaseModel):
    """Schema for a single outfit item."""

    itemType: str = Field(..., description="Item type (上衣, 下装, 鞋子, 配饰)")
    name: str = Field(..., description="Item name in Chinese")
    color: str = Field(..., description="Color name in Chinese")
    colorHex: str = Field(..., description="Hex color code", pattern=r"^#[0-9A-Fa-f]{6}$")
    styleTip: str = Field(..., description="Styling tip for this item")
    imageUrl: str | None = Field(None, description="Optional image URL")


class TheorySchema(BaseModel):
    """Schema for outfit theory explanation."""

    colorPrinciple: str = Field(..., description="Color matching principle")
    styleAnalysis: str = Field(..., description="Style analysis text")
    bodyTypeAdvice: str = Field(..., description="Body type specific advice")
    occasionFit: str = Field(..., description="Occasion fit description")
    fullExplanation: str = Field(..., description="Full theory explanation (150-200 chars)")


class OutfitRecommendationSchema(BaseModel):
    """Schema for a complete outfit recommendation."""

    id: str = Field(..., description="Unique outfit ID")
    name: str = Field(..., description="Outfit name in Chinese")
    items: list[OutfitItemSchema] = Field(..., description="List of outfit items")
    theory: TheorySchema = Field(..., description="Theory explanation")
    styleTags: list[str] = Field(..., description="Style tags")
    confidence: float = Field(..., description="Recommendation confidence score", ge=0, le=1)


class GarmentDataSchema(BaseModel):
    """Schema for garment data from analysis."""

    garmentType: str = Field(..., description="Garment type")
    primaryColors: list[dict] = Field(..., description="Primary colors")
    styleTags: list[str] = Field(..., description="Style tags")


class GenerateOutfitRequest(BaseModel):
    """Request schema for generating outfit recommendations."""

    photoUrl: str = Field(..., description="URL of the garment photo in cloud storage")
    occasion: str = Field(..., description="Selected occasion type")
    garmentData: GarmentDataSchema = Field(..., description="Garment analysis data")


class GenerateOutfitResponse(BaseModel):
    """Response schema for outfit generation."""

    success: bool = Field(..., description="Whether generation was successful")
    recommendations: list[OutfitRecommendationSchema] = Field(
        ..., description="List of 3 outfit recommendations"
    )
    occasion: str = Field(..., description="The occasion used for generation")
    message: str | None = Field(None, description="Optional message")


class OutfitGenerateRequest(BaseModel):
    """Request schema for generating outfit recommendations."""

    imageUrl: str
    occasion: str | None = None


class OutfitResponse(BaseModel):
    """Response schema for outfit."""

    id: str
    occasion: str
    isLiked: bool
    createdAt: str


class OutfitDetailResponse(BaseModel):
    """Detailed response schema for outfit with generated content."""

    id: str = Field(..., description="Unique outfit ID")
    occasion: str = Field(..., description="Occasion for this outfit")
    sourceImageUrl: str | None = Field(None, description="Original garment image URL")
    generatedImageUrl: str | None = Field(None, description="AI-generated outfit image URL")
    theoryText: str | None = Field(None, description="AI-generated theory/explanation")
    selectedItem: str | None = Field(None, description="Selected garment category")
    isFavorited: bool = Field(False, description="Whether user favorited this outfit")
    createdAt: str = Field(..., description="Creation timestamp")
