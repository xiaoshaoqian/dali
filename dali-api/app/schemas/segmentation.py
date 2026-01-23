"""Schemas for clothing segmentation API."""

from pydantic import BaseModel


class SegmentedClothingItemSchema(BaseModel):
    """Individual segmented clothing item (without description)."""
    
    id: str  # Unique identifier
    category: str  # Alibaba category (e.g., "tops", "coat", "pants")
    garment_type: str  # Our mapped type (e.g., "上衣", "外套", "裤子")
    image_url: str  # URL of segmented image with transparent background


class SegmentClothingRequest(BaseModel):
    """Request to segment clothing items from a photo."""
    
    image_url: str  # URL of the uploaded photo


class SegmentClothingResponse(BaseModel):
    """Response containing all segmented clothing items."""
    
    items: list[SegmentedClothingItemSchema]  # List of segmented items
    total_count: int  # Total number of items detected
    original_image_url: str  # Original uploaded image URL


class DescribeClothingRequest(BaseModel):
    """Request to describe a single clothing item."""
    
    image_url: str  # URL of the segmented clothing image
    category_hint: str  # Category hint (e.g., "tops", "pants")


class DescribeClothingResponse(BaseModel):
    """Response with detailed clothing description."""
    
    color: str  # Main color in Chinese (e.g., "蓝色")
    style: str  # Style features (e.g., "圆领短袖")
    pattern: str  # Pattern (e.g., "纯色", "条纹")
    description: str  # Complete description (e.g., "蓝色圆领短袖T恤")

