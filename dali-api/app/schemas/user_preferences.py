"""User preferences schemas.

JSON response fields use camelCase per architecture spec.
"""

from typing import Literal

from pydantic import BaseModel, Field

# Type definitions
BodyType = Literal['pear', 'apple', 'hourglass', 'rectangle', 'inverted-triangle']
StylePreference = Literal['minimalist', 'trendy', 'sweet', 'intellectual', 'athletic']
Occasion = Literal['work', 'date', 'party', 'daily', 'sports']


class UserPreferencesRequest(BaseModel):
    """Request schema for updating user preferences."""

    bodyType: BodyType = Field(
        ...,
        description="User's body type",
        examples=["hourglass"],
    )
    styles: list[StylePreference] = Field(
        ...,
        min_length=1,
        max_length=3,
        description="User's style preferences (1-3)",
        examples=[["minimalist", "intellectual"]],
    )
    occasions: list[Occasion] = Field(
        ...,
        min_length=1,
        max_length=3,
        description="User's common occasions (1-3)",
        examples=[["work", "daily"]],
    )


class UserPreferencesResponse(BaseModel):
    """Response schema for user preferences."""

    id: str = Field(..., description="Preferences ID (UUID)")
    userId: str = Field(..., description="User ID (UUID)")
    bodyType: BodyType = Field(..., description="User's body type")
    styles: list[StylePreference] = Field(..., description="User's style preferences")
    occasions: list[Occasion] = Field(..., description="User's common occasions")
    createdAt: str = Field(..., description="Creation timestamp (ISO 8601)")
    updatedAt: str = Field(..., description="Last update timestamp (ISO 8601)")
