"""User schemas placeholder."""

from pydantic import BaseModel


class UserResponse(BaseModel):
    """Response schema for user profile."""

    id: str
    phone: str | None = None
    wechatId: str | None = None


class UserPreferenceUpdate(BaseModel):
    """Request schema for updating user preferences."""

    bodyType: str | None = None
    stylePreference: str | None = None
    commonOccasions: list[str] | None = None
