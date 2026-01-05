"""Wardrobe schemas placeholder."""

from pydantic import BaseModel


class WardrobeItemCreate(BaseModel):
    """Request schema for adding wardrobe item."""

    imageUrl: str
    garmentType: str | None = None


class WardrobeItemResponse(BaseModel):
    """Response schema for wardrobe item."""

    id: str
    imageUrl: str
    garmentType: str
    color: str | None = None
    pattern: str | None = None
