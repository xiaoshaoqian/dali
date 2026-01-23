"""SiliconFlow Img2Img integration for outfit visualization.

This module provides integration with SiliconFlow FLUX.1-schnell model
for generating outfit visualization images based on:
- Base garment image (for style reference)
- Text prompt describing the outfit

Includes fallback to OpenAI DALL-E 3 if SiliconFlow fails.
"""

import base64
import logging
import uuid
from dataclasses import dataclass

import httpx
import oss2

from app.config import settings
from app.core.exceptions import APIException
from app.integrations.alibaba_oss import encode_presigned_url

logger = logging.getLogger(__name__)


@dataclass
class ImageGenerationResult:
    """Result from image generation."""

    image_url: str  # OSS URL of the generated image
    object_key: str  # OSS object key for cleanup
    provider: str  # "siliconflow" or "dalle"
    generation_time_ms: int  # Time taken in milliseconds


class SiliconFlowClient:
    """Client for SiliconFlow Img2Img generation."""

    SILICONFLOW_API_URL = "https://api.siliconflow.cn/v1/images/generations"
    SILICONFLOW_IMG2IMG_URL = "https://api.siliconflow.cn/v1/images/edits"

    # DALL-E 3 fallback
    OPENAI_API_URL = "https://api.openai.com/v1/images/generations"

    def __init__(self) -> None:
        """Initialize SiliconFlow client."""
        self.api_key = settings.SILICONFLOW_API_KEY
        self.model = settings.SILICONFLOW_MODEL
        self.strength = settings.IMG2IMG_STRENGTH
        self.timeout = settings.IMG2IMG_TIMEOUT
        self._client: httpx.AsyncClient | None = None

        # OSS for storing generated images
        self._oss_bucket: oss2.Bucket | None = None

    @property
    def client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=float(self.timeout))
        return self._client

    @property
    def oss_bucket(self) -> oss2.Bucket:
        """Get or create OSS bucket."""
        if self._oss_bucket is None:
            auth = oss2.Auth(
                settings.ALIBABA_ACCESS_KEY_ID,
                settings.ALIBABA_ACCESS_KEY_SECRET,
            )
            endpoint = settings.ALIBABA_OSS_ENDPOINT
            if not endpoint.startswith("https://"):
                endpoint = f"https://{endpoint}"
            self._oss_bucket = oss2.Bucket(
                auth, endpoint, settings.ALIBABA_OSS_BUCKET
            )
        return self._oss_bucket

    async def close(self) -> None:
        """Close HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def generate_img2img(
        self,
        base_image_url: str,
        prompt: str,
        strength: float | None = None,
    ) -> ImageGenerationResult:
        """Generate an image based on a base image and prompt.

        Uses Img2Img to preserve original garment characteristics while
        generating a styled outfit visualization.

        Args:
            base_image_url: URL of the base garment image
            prompt: English text prompt for generation
            strength: How much to deviate from base image (0-1), default from config

        Returns:
            ImageGenerationResult with OSS URL

        Raises:
            SiliconFlowError: If generation fails after all retries
        """
        import time
        start_time = time.time()

        strength = strength or self.strength

        # Try SiliconFlow first
        try:
            result = await self._generate_siliconflow(base_image_url, prompt, strength)
            generation_time = int((time.time() - start_time) * 1000)
            return ImageGenerationResult(
                image_url=result["url"],
                object_key=result["object_key"],
                provider="siliconflow",
                generation_time_ms=generation_time,
            )
        except Exception as e:
            logger.warning(f"[SiliconFlow] Primary generation failed: {e}")

        # Fallback to DALL-E 3 (text-to-image only, no Img2Img)
        try:
            result = await self._generate_dalle(prompt)
            generation_time = int((time.time() - start_time) * 1000)
            return ImageGenerationResult(
                image_url=result["url"],
                object_key=result["object_key"],
                provider="dalle",
                generation_time_ms=generation_time,
            )
        except Exception as e:
            logger.error(f"[SiliconFlow] DALL-E fallback also failed: {e}")
            raise SiliconFlowError(
                "Image generation failed with all providers",
                code="IMG_GEN_FAILED",
            ) from e

    async def generate_text2img(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 1024,
        height: int = 1024,
    ) -> ImageGenerationResult:
        """Generate an image from text prompt only.

        Args:
            prompt: English text prompt for generation
            negative_prompt: What to avoid in the image
            width: Image width (default 1024)
            height: Image height (default 1024)

        Returns:
            ImageGenerationResult with OSS URL
        """
        import time
        start_time = time.time()

        if not self.api_key:
            logger.warning("[SiliconFlow] API key not configured, returning mock")
            return self._get_mock_result()

        payload = {
            "model": self.model,
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "image_size": f"{width}x{height}",
            "num_inference_steps": 20,
            "guidance_scale": 7.5,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            response = await self.client.post(
                self.SILICONFLOW_API_URL,
                json=payload,
                headers=headers,
            )
            response.raise_for_status()

            result = response.json()
            image_data = result.get("data", [{}])[0]

            # Handle base64 or URL response
            if "b64_json" in image_data:
                image_bytes = base64.b64decode(image_data["b64_json"])
                oss_result = await self._upload_to_oss(image_bytes)
            elif "url" in image_data:
                # Download and re-upload to OSS
                img_response = await self.client.get(image_data["url"])
                img_response.raise_for_status()
                oss_result = await self._upload_to_oss(img_response.content)
            else:
                raise SiliconFlowError("No image data in response")

            generation_time = int((time.time() - start_time) * 1000)
            return ImageGenerationResult(
                image_url=oss_result["url"],
                object_key=oss_result["object_key"],
                provider="siliconflow",
                generation_time_ms=generation_time,
            )

        except httpx.HTTPStatusError as e:
            logger.error(f"[SiliconFlow] HTTP error: {e.response.status_code}")
            raise SiliconFlowError(f"API request failed: {e.response.status_code}") from e
        except Exception as e:
            logger.error(f"[SiliconFlow] Generation error: {e}", exc_info=True)
            raise SiliconFlowError(f"Generation failed: {e}") from e

    async def _generate_siliconflow(
        self,
        base_image_url: str,
        prompt: str,
        strength: float,
    ) -> dict[str, str]:
        """Generate using SiliconFlow Img2Img API."""
        if not self.api_key:
            raise SiliconFlowError("SiliconFlow API key not configured")

        logger.info(f"[SiliconFlow] Generating with strength={strength}")

        # Download base image
        img_response = await self.client.get(base_image_url)
        img_response.raise_for_status()
        base_image_b64 = base64.b64encode(img_response.content).decode()

        payload = {
            "model": self.model,
            "prompt": prompt,
            "image": f"data:image/jpeg;base64,{base_image_b64}",
            "strength": strength,
            "num_inference_steps": 20,
            "guidance_scale": 7.5,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        response = await self.client.post(
            self.SILICONFLOW_IMG2IMG_URL,
            json=payload,
            headers=headers,
        )
        response.raise_for_status()

        result = response.json()
        image_data = result.get("data", [{}])[0]

        # Upload to OSS
        if "b64_json" in image_data:
            image_bytes = base64.b64decode(image_data["b64_json"])
        elif "url" in image_data:
            dl_response = await self.client.get(image_data["url"])
            dl_response.raise_for_status()
            image_bytes = dl_response.content
        else:
            raise SiliconFlowError("No image data in SiliconFlow response")

        return await self._upload_to_oss(image_bytes)

    async def _generate_dalle(self, prompt: str) -> dict[str, str]:
        """Generate using OpenAI DALL-E 3 as fallback."""
        openai_key = settings.OPENAI_API_KEY
        if not openai_key:
            raise SiliconFlowError("OpenAI API key not configured for fallback")

        logger.info("[SiliconFlow] Using DALL-E 3 fallback")

        payload = {
            "model": "dall-e-3",
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
            "quality": "standard",
        }

        headers = {
            "Authorization": f"Bearer {openai_key}",
            "Content-Type": "application/json",
        }

        response = await self.client.post(
            self.OPENAI_API_URL,
            json=payload,
            headers=headers,
        )
        response.raise_for_status()

        result = response.json()
        image_url = result.get("data", [{}])[0].get("url")
        if not image_url:
            raise SiliconFlowError("No image URL in DALL-E response")

        # Download and upload to OSS
        img_response = await self.client.get(image_url)
        img_response.raise_for_status()

        return await self._upload_to_oss(img_response.content)

    async def _upload_to_oss(self, image_bytes: bytes) -> dict[str, str]:
        """Upload generated image to OSS.

        Args:
            image_bytes: Raw image bytes

        Returns:
            Dict with 'url' and 'object_key'
        """
        # Generate unique object key
        object_key = f"generated/{uuid.uuid4()}.png"

        try:
            # Upload to OSS
            self.oss_bucket.put_object(object_key, image_bytes)

            # Generate presigned URL for access
            url = self.oss_bucket.sign_url("GET", object_key, 3600)
            url = encode_presigned_url(url)

            logger.info(f"[SiliconFlow] Uploaded to OSS: {object_key}")
            return {"url": url, "object_key": object_key}

        except Exception as e:
            logger.error(f"[SiliconFlow] OSS upload failed: {e}")
            raise SiliconFlowError(f"Failed to upload image: {e}") from e

    def _get_mock_result(self) -> ImageGenerationResult:
        """Return mock result for development."""
        return ImageGenerationResult(
            image_url="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
            object_key="mock/generated.png",
            provider="mock",
            generation_time_ms=1000,
        )


class SiliconFlowError(APIException):
    """Exception raised when SiliconFlow API call fails."""

    def __init__(self, message: str, code: str = "SILICONFLOW_ERROR") -> None:
        super().__init__(
            status_code=500,
            code=code,
            message=message,
        )


# Singleton instance
siliconflow_client = SiliconFlowClient()
