"""Authentication schemas for SMS login.

JSON response fields use camelCase per architecture spec.
"""

import re

from pydantic import BaseModel, Field, field_validator

# China phone number regex: starts with 1, followed by 3-9, then 9 more digits
CHINA_PHONE_REGEX = re.compile(r"^1[3-9]\d{9}$")


class SendSMSRequest(BaseModel):
    """Request schema for sending SMS verification code."""

    phone: str = Field(
        ...,
        description="Phone number (China mainland format: 1xxxxxxxxxx)",
        examples=["13800138000"],
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate phone number format."""
        if not CHINA_PHONE_REGEX.match(v):
            raise ValueError("请输入正确的手机号码")
        return v


class SendSMSResponse(BaseModel):
    """Response schema for SMS send success."""

    message: str = Field(default="验证码已发送")


class VerifySMSRequest(BaseModel):
    """Request schema for verifying SMS code."""

    phone: str = Field(
        ...,
        description="Phone number that received the code",
        examples=["13800138000"],
    )
    code: str = Field(
        ...,
        min_length=6,
        max_length=6,
        description="6-digit verification code",
        examples=["123456"],
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate phone number format."""
        if not CHINA_PHONE_REGEX.match(v):
            raise ValueError("请输入正确的手机号码")
        return v

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        """Validate verification code format."""
        if not v.isdigit():
            raise ValueError("验证码必须为6位数字")
        return v


class TokenResponse(BaseModel):
    """Response schema for authentication tokens."""

    userId: str = Field(..., description="User ID (UUID)")
    accessToken: str = Field(..., description="JWT access token (15min expiry)")
    refreshToken: str = Field(..., description="JWT refresh token (30 days expiry)")
    expiresIn: int = Field(
        default=900,
        description="Access token expiry time in seconds",
    )
    isNewUser: bool = Field(
        default=False,
        description="Whether this is a newly registered user",
    )


class RefreshTokenRequest(BaseModel):
    """Request schema for refreshing access token."""

    refreshToken: str = Field(
        ...,
        description="JWT refresh token",
    )


class RefreshTokenResponse(BaseModel):
    """Response schema for token refresh."""

    accessToken: str = Field(..., description="New JWT access token")
    refreshToken: str = Field(..., description="New JWT refresh token (rotated)")
    expiresIn: int = Field(
        default=900,
        description="Access token expiry time in seconds",
    )
