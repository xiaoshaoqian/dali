"""Authentication endpoints placeholder."""

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


# Placeholder for future implementation:
# POST /sms/send - Send SMS verification code
# POST /sms/verify - Verify SMS and get tokens
# POST /wechat/login - WeChat OAuth login
# POST /refresh - Refresh access token
# POST /logout - Invalidate tokens
