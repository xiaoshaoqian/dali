"""Garment analysis schemas for Vision API integration."""

from pydantic import BaseModel, Field


class ColorInfoSchema(BaseModel):
    """Color information from garment analysis."""

    hex: str = Field(..., description="Hex color code", pattern=r"^#[0-9A-Fa-f]{6}$")
    name: str = Field(..., description="Chinese color name")
    percentage: float = Field(..., description="Percentage of this color in the garment", ge=0, le=1)


class GarmentAnalysisRequest(BaseModel):
    """Request schema for garment analysis."""

    image_url: str = Field(..., description="URL of the garment image in cloud storage")


class GarmentAnalysisResponse(BaseModel):
    """Response schema for garment analysis."""

    garmentType: str = Field(..., description="Detected garment type in Chinese")
    primaryColors: list[ColorInfoSchema] = Field(
        ..., description="List of primary colors detected", min_length=1, max_length=5
    )
    styleTags: list[str] = Field(..., description="Style tags in Chinese", min_length=1, max_length=5)
    confidence: float = Field(..., description="Confidence score of the analysis", ge=0, le=1)


class GarmentAnalysisError(BaseModel):
    """Error response for garment analysis."""

    error: str = Field(..., description="Error message in Chinese")
    code: str = Field(..., description="Error code")
