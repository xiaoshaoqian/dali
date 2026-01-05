"""Outfit schemas placeholder."""

from pydantic import BaseModel


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
