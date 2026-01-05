"""Authentication schemas placeholder."""

from pydantic import BaseModel


class SMSSendRequest(BaseModel):
    """Request schema for sending SMS verification code."""

    phone: str


class SMSVerifyRequest(BaseModel):
    """Request schema for verifying SMS code."""

    phone: str
    code: str


class TokenResponse(BaseModel):
    """Response schema for authentication tokens."""

    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
