"""SMS service using Alibaba Cloud SMS SDK.

This module provides SMS verification code functionality.
"""

import random
import string

from alibabacloud_dysmsapi20170525 import models as sms_models
from alibabacloud_dysmsapi20170525.client import Client
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_tea_util import models as util_models

from app.config import settings
from app.core.exceptions import RateLimitedError, SMSError
from app.services.verification_store import verification_store


class SMSService:
    """SMS service for sending verification codes via Alibaba Cloud."""

    def __init__(self) -> None:
        """Initialize SMS service with Alibaba Cloud credentials."""
        self._client: Client | None = None

    def _get_client(self) -> Client:
        """Get or create Alibaba Cloud SMS client.

        Returns:
            Configured SMS client
        """
        if self._client is None:
            config = open_api_models.Config(
                access_key_id=settings.SMS_ACCESS_KEY_ID,
                access_key_secret=settings.SMS_ACCESS_KEY_SECRET,
            )
            config.endpoint = "dysmsapi.aliyuncs.com"
            self._client = Client(config)
        return self._client

    @staticmethod
    def generate_code(length: int = 6) -> str:
        """Generate a random numeric verification code.

        Args:
            length: Length of the code (default: 6)

        Returns:
            Random numeric string
        """
        return "".join(random.choices(string.digits, k=length))

    async def send_verification_code(self, phone: str) -> None:
        """Send SMS verification code to phone number.

        Args:
            phone: Phone number to send code to (format: 1xxxxxxxxxx)

        Raises:
            RateLimitedError: If rate limit exceeded
            SMSError: If SMS sending fails
        """
        # Check rate limit
        can_send, retry_after = verification_store.can_send(phone)
        if not can_send:
            raise RateLimitedError(
                message="请等待后再发送验证码",
                retry_after=retry_after,
            )

        # Generate code
        code = self.generate_code()

        # In development mode, skip actual SMS sending
        if settings.APP_ENV == "development" or not settings.SMS_ACCESS_KEY_ID:
            # Store code without sending
            # Note: Code is stored but never logged for security
            verification_store.store_code(phone, code)
            return

        # Send SMS via Alibaba Cloud
        try:
            client = self._get_client()
            request = sms_models.SendSmsRequest(
                phone_numbers=phone,
                sign_name=settings.SMS_SIGN_NAME,
                template_code=settings.SMS_TEMPLATE_CODE,
                template_param=f'{{"code":"{code}"}}',
            )
            runtime = util_models.RuntimeOptions()
            response = client.send_sms_with_options(request, runtime)

            if response.body.code != "OK":
                raise SMSError(
                    message=response.body.message or "短信发送失败",
                    details={"alibaba_code": response.body.code},
                )

            # Store code on success
            verification_store.store_code(phone, code)

        except SMSError:
            raise
        except Exception as e:
            raise SMSError(
                message="短信服务暂时不可用",
                details={"error": str(e)},
            ) from e

    def verify_code(self, phone: str, code: str) -> tuple[bool, str | None]:
        """Verify SMS code for phone number.

        Args:
            phone: Phone number that received the code
            code: Code to verify

        Returns:
            Tuple of (success, error_message)
        """
        return verification_store.verify_code(phone, code)


# Global service instance
sms_service = SMSService()
