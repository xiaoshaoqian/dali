"""Authentication API endpoints for SMS login.

Endpoints:
- POST /auth/sms/send - Send SMS verification code
- POST /auth/sms/verify - Verify SMS code and get tokens
- POST /auth/refresh - Refresh access token
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.exceptions import APIException
from app.schemas.auth import (
    RefreshTokenRequest,
    RefreshTokenResponse,
    SendSMSRequest,
    SendSMSResponse,
    TokenResponse,
    VerifySMSRequest,
)
from app.services.auth import auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/sms/send", response_model=SendSMSResponse)
async def send_sms(request: SendSMSRequest) -> SendSMSResponse:
    """Send SMS verification code to phone number.

    Args:
        request: Phone number to send code to

    Returns:
        Success message

    Raises:
        HTTPException: If rate limited or SMS service error
    """
    try:
        await auth_service.send_sms_code(request.phone)
        logger.info(f"SMS verification code sent to {request.phone[:3]}****{request.phone[-4:]}")
        return SendSMSResponse(message="验证码已发送")
    except APIException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={
                "code": e.code,
                "message": e.message,
                "details": e.details,
            },
        ) from e


@router.post("/sms/verify", response_model=TokenResponse)
async def verify_sms(
    request: VerifySMSRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Verify SMS code and authenticate user.

    Creates a new user if the phone number is not registered.

    Args:
        request: Phone number and verification code
        db: Database session

    Returns:
        JWT access and refresh tokens

    Raises:
        HTTPException: If code verification fails
    """
    try:
        token_response, is_new_user = await auth_service.verify_sms_and_login(
            phone=request.phone,
            code=request.code,
            db=db,
        )
        if is_new_user:
            logger.info(
                f"New user registered with phone {request.phone[:3]}****{request.phone[-4:]}"
            )
        else:
            logger.info(f"User logged in with phone {request.phone[:3]}****{request.phone[-4:]}")
        return token_response
    except APIException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={
                "code": e.code,
                "message": e.message,
                "details": e.details,
            },
        ) from e


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> RefreshTokenResponse:
    """Refresh access token using refresh token.

    Args:
        request: Refresh token
        db: Database session

    Returns:
        New access and refresh tokens

    Raises:
        HTTPException: If refresh token is invalid or expired
    """
    try:
        response = await auth_service.refresh_tokens(
            refresh_token=request.refreshToken,
            db=db,
        )
        logger.debug("Access token refreshed successfully")
        return response
    except APIException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={
                "code": e.code,
                "message": e.message,
                "details": e.details,
            },
        ) from e
