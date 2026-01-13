"""User schemas for profile and statistics."""

from datetime import datetime

from pydantic import BaseModel, Field


class UserProfileResponse(BaseModel):
    """Response schema for user profile."""

    id: str
    phone: str | None = None
    wechat_id: str | None = Field(None, serialization_alias="wechatId")
    nickname: str | None = None
    avatar: str | None = None
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    class Config:
        """Pydantic config."""

        from_attributes = True
        populate_by_name = True


class UpdateUserProfileRequest(BaseModel):
    """Request schema for updating user profile."""

    nickname: str | None = None
    avatar: str | None = None


class UserStatsResponse(BaseModel):
    """Response schema for user statistics."""

    total_outfits: int = Field(0, serialization_alias="totalOutfits")
    favorite_count: int = Field(0, serialization_alias="favoriteCount")
    share_count: int = Field(0, serialization_alias="shareCount")
    joined_days: int = Field(0, serialization_alias="joinedDays")
    ai_accuracy: float = Field(0.0, serialization_alias="aiAccuracy")

    class Config:
        """Pydantic config."""

        populate_by_name = True


class AvatarUploadUrlResponse(BaseModel):
    """Response schema for avatar upload URL."""

    signed_url: str = Field(serialization_alias="signedUrl")
    avatar_url: str = Field(serialization_alias="avatarUrl")

    class Config:
        """Pydantic config."""

        populate_by_name = True


# Legacy schemas
class UserResponse(BaseModel):
    """Response schema for user profile (legacy)."""

    id: str
    phone: str | None = None
    wechatId: str | None = None


class UserPreferenceUpdate(BaseModel):
    """Request schema for updating user preferences (legacy)."""

    bodyType: str | None = None
    stylePreference: str | None = None
    commonOccasions: list[str] | None = None
