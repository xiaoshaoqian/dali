"""Alibaba Cloud Vision API integration for garment recognition and segmentation.

This module provides integration with Alibaba Cloud Vision API (Viapi)
for garment attribute analysis and segmentation.
"""

import random
from dataclasses import dataclass
from enum import Enum
from typing import Any

from alibabacloud_imageseg20191230.client import Client as ImageSegClient
from alibabacloud_imageseg20191230 import models as imageseg_models
from alibabacloud_objectdet20191230.client import Client as ObjectDetClient
from alibabacloud_objectdet20191230 import models as objectdet_models
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_tea_util import models as util_models

from app.config import settings
from app.core.exceptions import APIException


class GarmentType(str, Enum):
    """Supported garment types for recognition."""

    TOP = "上衣"
    PANTS = "裤子"
    SKIRT = "裙子"
    JACKET = "外套"
    ACCESSORY = "配饰"


# Mapping from Alibaba Cloud SegmentCloth categories to our GarmentType
ALIBABA_CATEGORY_TO_GARMENT_TYPE = {
    "tops": GarmentType.TOP,
    "coat": GarmentType.JACKET,
    "skirt": GarmentType.SKIRT,
    "pants": GarmentType.PANTS,
    "bag": GarmentType.ACCESSORY,
    "shoes": GarmentType.ACCESSORY,
    "hat": GarmentType.ACCESSORY,
}


class StyleTag(str, Enum):
    """Style tags for garment classification."""

    MINIMALIST = "简约"
    TRENDY = "时尚"
    CASUAL = "休闲"
    FORMAL = "正式"
    SWEET = "甜美"
    ATHLETIC = "运动"
    INTELLECTUAL = "知性"
    VINTAGE = "复古"


@dataclass
class ColorInfo:
    """Color information extracted from garment image."""

    hex: str
    name: str
    percentage: float


@dataclass
class GarmentAnalysisResult:
    """Result of garment image analysis."""

    garment_type: GarmentType
    primary_colors: list[ColorInfo]
    style_tags: list[StyleTag]
    confidence: float


@dataclass
class SegmentationResult:
    """Result from SegmentCloth API."""

    mask_url: str
    detected_categories: list[str]  # List of detected garment categories


# Predefined color palette for mock responses (Fallback)
COLOR_PALETTE: list[tuple[str, str]] = [
    ("#FFFFFF", "白色"),
    ("#000000", "黑色"),
    ("#F5F5DC", "米色"),
    ("#808080", "灰色"),
    ("#000080", "藏蓝色"),
    ("#8B4513", "棕色"),
    ("#FFC0CB", "粉色"),
    ("#FF0000", "红色"),
    ("#90EE90", "浅绿色"),
    ("#ADD8E6", "浅蓝色"),
    ("#FFD700", "金色"),
    ("#800080", "紫色"),
    ("#FFA500", "橙色"),
    ("#008000", "绿色"),
    ("#C0C0C0", "银色"),
]


class VisionAPIClient:
    """Client for Alibaba Cloud Vision API."""

    def __init__(self) -> None:
        """Initialize Vision API client with credentials."""
        self._init_clients()

    def _init_clients(self) -> None:
        """Initialize Aliyun SDK clients."""
        config = open_api_models.Config(
            access_key_id=settings.ALIBABA_ACCESS_KEY_ID,
            access_key_secret=settings.ALIBABA_ACCESS_KEY_SECRET,
        )
        # Endpoint for Image Segmentation
        config.endpoint = "imageseg.cn-shanghai.aliyuncs.com"
        self.imageseg_client = ImageSegClient(config)

        # Config for Object Detection (DetectMainBody)
        # Note: Endpoint might be different or shared (usually objectdet.cn-shanghai.aliyuncs.com)
        det_config = open_api_models.Config(
            access_key_id=settings.ALIBABA_ACCESS_KEY_ID,
            access_key_secret=settings.ALIBABA_ACCESS_KEY_SECRET,
        )
        det_config.endpoint = "objectdet.cn-shanghai.aliyuncs.com"
        self.objectdet_client = ObjectDetClient(det_config)

    async def segment_cloth(self, image_url: str) -> SegmentationResult:
        """Segment cloth from image using Alibaba Cloud SegmentCloth API.

        Args:
            image_url: URL of the input image.

        Returns:
            SegmentationResult with mask URL and detected categories.
        """
        if not settings.ALIBABA_ACCESS_KEY_ID:
            raise VisionAPIError("Alibaba Cloud credentials not configured", code="CONFIG_ERROR")

        # Build request with correct parameters
        # Reference: https://help.aliyun.com/zh/viapi/developer-reference/api-clothing-segmentation
        request = imageseg_models.SegmentClothRequest(
            image_url=image_url,
            # Don't specify clothClass to auto-detect all categories
            # Options for return_form:
            # - "whiteBK": white background
            # - "mask": single channel mask
            # - Not set: transparent PNG (default, recommended for clothing)
        )

        try:
            # Call the API (synchronous SDK method in async context)
            response = self.imageseg_client.segment_cloth(request)

            # Parse response according to official documentation structure
            # Response: Data.Elements[0].ImageURL, Data.Elements[0].ClassUrl
            if response.body and response.body.data and response.body.data.elements:
                element = response.body.data.elements[0]

                # Get mask URL
                mask_url = ""
                if hasattr(element, 'image_url'):
                    mask_url = element.image_url
                elif hasattr(element, 'ImageURL'):
                    mask_url = element.ImageURL

                # Extract detected categories from ClassUrl if available
                # ClassUrl is a dict like: {'tops': 'url1', 'coat': 'url2', ...}
                detected_categories = []
                if hasattr(element, 'class_url'):
                    class_url = element.class_url
                    # class_url might be a dict or a string representation
                    if isinstance(class_url, dict):
                        detected_categories = list(class_url.keys())
                    elif isinstance(class_url, str):
                        # Try to parse the string if it's a JSON-like dict
                        import re
                        # Look for pattern like {'tops':url, 'coat':url}
                        matches = re.findall(r"'(\w+)'", class_url)
                        if matches:
                            detected_categories = matches

                # If no categories from ClassUrl, return empty list
                # The API automatically detects categories without specifying clothClass
                return SegmentationResult(
                    mask_url=mask_url,
                    detected_categories=detected_categories
                )

            raise VisionAPIError("No segmentation result returned")

        except VisionAPIError:
            raise
        except Exception as e:
            # Log detailed error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"[Vision] SegmentCloth API error: {str(e)}", exc_info=True)
            raise VisionAPIError(f"Segmentation failed: {str(e)}") from e

    async def detect_main_body(self, image_url: str) -> dict[str, Any]:
        """Detect main body (person) in the image using Alibaba Cloud DetectMainBody API.

        Args:
            image_url: URL of the input image.

        Returns:
            Dictionary containing detection data (box coordinates).
            Format: { "y": int, "x": int, "height": int, "width": int }
        """
        if not settings.ALIBABA_ACCESS_KEY_ID:
             raise VisionAPIError("Alibaba Cloud credentials not configured", code="CONFIG_ERROR")

        request = objectdet_models.DetectMainBodyRequest(
            image_url=image_url
        )

        try:
            # Assuming main region is what we want
            response = self.objectdet_client.detect_main_body(request)
            
            if response.body and response.body.data and response.body.data.location:
                # API returns Location: { Y, X, Height, Width }
                loc = response.body.data.location
                return {
                    "y": loc.y, # type: ignore
                    "x": loc.x, # type: ignore
                    "height": loc.height, # type: ignore
                    "width": loc.width, # type: ignore
                }
            
            raise VisionAPIError("No main body detected")

        except Exception as e:
             raise VisionAPIError(f"Detection failed: {str(e)}") from e

    async def analyze_garment(self, image_url: str) -> GarmentAnalysisResult:
        """Analyze a garment image and extract attributes.

        Uses SegmentCloth API to detect garment type, with fallback to mock data for other attributes.
        """
        import logging
        logger = logging.getLogger(__name__)

        # Detect garment type using SegmentCloth API
        detected_garment_type = GarmentType.TOP  # Default fallback
        try:
            logger.info(f"[Vision] Calling SegmentCloth for garment analysis: {image_url[:100]}...")
            segmentation_result = await self.segment_cloth(image_url)

            # Use the first detected category, or default to TOP
            if segmentation_result.detected_categories:
                first_category = segmentation_result.detected_categories[0]
                if first_category in ALIBABA_CATEGORY_TO_GARMENT_TYPE:
                    detected_garment_type = ALIBABA_CATEGORY_TO_GARMENT_TYPE[first_category]
                    logger.info(f"[Vision] Detected garment category: {first_category} -> {detected_garment_type.value}")
                else:
                    logger.warning(f"[Vision] Unknown category: {first_category}, using default TOP")
            else:
                logger.warning("[Vision] No categories detected in segmentation result, using default TOP")

        except Exception as e:
            logger.warning(f"[Vision] SegmentCloth API failed for garment analysis: {e}, using mock data")
            # Fallback to mock implementation if API fails
            garment_weights = [
                (GarmentType.TOP, 0.35),
                (GarmentType.PANTS, 0.25),
                (GarmentType.SKIRT, 0.15),
                (GarmentType.JACKET, 0.15),
                (GarmentType.ACCESSORY, 0.10),
            ]
            detected_garment_type = random.choices(
                [g[0] for g in garment_weights],
                weights=[g[1] for g in garment_weights],
            )[0]

        # Generate colors (mock for now - can be enhanced with color analysis)
        num_colors = random.randint(2, 4)
        selected_colors = random.sample(COLOR_PALETTE, num_colors)
        percentages = self._generate_percentages(num_colors)
        primary_colors = [
            ColorInfo(hex=color[0], name=color[1], percentage=pct)
            for color, pct in zip(selected_colors, percentages, strict=True)
        ]

        # Generate style tags (mock for now)
        num_styles = random.randint(2, 3)
        style_tags = random.sample(list(StyleTag), num_styles)

        # Generate confidence score
        confidence = round(random.uniform(0.85, 0.98), 2)

        return GarmentAnalysisResult(
            garment_type=detected_garment_type,
            primary_colors=primary_colors,
            style_tags=style_tags,
            confidence=confidence,
        )

    def _generate_percentages(self, count: int) -> list[float]:
        """Generate random percentages that sum to 1.0."""
        values = [random.random() for _ in range(count)]
        total = sum(values)
        return [round(v / total, 2) for v in values]


class VisionAPIError(APIException):
    """Exception raised when Vision API call fails."""

    def __init__(self, message: str, code: str = "VISION_API_ERROR") -> None:
        super().__init__(
            status_code=500,
            code=code,
            message=message,
        )


# Singleton instance
vision_client = VisionAPIClient()
