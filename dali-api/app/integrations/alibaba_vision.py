"""Alibaba Cloud Vision API integration for garment recognition.

This module provides a mock implementation of the Vision API.
In production, this would integrate with Alibaba Cloud Vision API
for actual garment type, color, and style detection.
"""

import random
from dataclasses import dataclass
from enum import Enum


class GarmentType(str, Enum):
    """Supported garment types for recognition."""

    TOP = "上衣"
    PANTS = "裤子"
    SKIRT = "裙子"
    JACKET = "外套"
    ACCESSORY = "配饰"


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


# Predefined color palette for mock responses
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
    """Client for Alibaba Cloud Vision API.

    Currently provides mock implementation for development.
    Production implementation would use actual Alibaba Cloud SDK.
    """

    def __init__(self) -> None:
        """Initialize Vision API client."""
        # In production, this would configure API credentials
        self.api_endpoint = "https://vision.cn-shanghai.aliyuncs.com"

    async def analyze_garment(self, image_url: str) -> GarmentAnalysisResult:
        """Analyze a garment image and extract attributes.

        Args:
            image_url: URL of the garment image in cloud storage

        Returns:
            GarmentAnalysisResult with type, colors, and style tags

        Raises:
            VisionAPIError: If analysis fails
        """
        # Mock implementation - returns realistic random results
        # In production, this would call Alibaba Cloud Vision API

        # Randomly select garment type (weighted towards common types)
        garment_weights = [
            (GarmentType.TOP, 0.35),
            (GarmentType.PANTS, 0.25),
            (GarmentType.SKIRT, 0.15),
            (GarmentType.JACKET, 0.15),
            (GarmentType.ACCESSORY, 0.10),
        ]
        garment_type = random.choices(
            [g[0] for g in garment_weights],
            weights=[g[1] for g in garment_weights],
        )[0]

        # Generate 2-4 colors
        num_colors = random.randint(2, 4)
        selected_colors = random.sample(COLOR_PALETTE, num_colors)

        # Calculate percentages that sum to 1.0
        percentages = self._generate_percentages(num_colors)

        primary_colors = [
            ColorInfo(hex=color[0], name=color[1], percentage=pct)
            for color, pct in zip(selected_colors, percentages, strict=True)
        ]

        # Generate 2-3 style tags
        num_styles = random.randint(2, 3)
        style_tags = random.sample(list(StyleTag), num_styles)

        # Generate confidence score (high for mock, 0.85-0.98)
        confidence = round(random.uniform(0.85, 0.98), 2)

        return GarmentAnalysisResult(
            garment_type=garment_type,
            primary_colors=primary_colors,
            style_tags=style_tags,
            confidence=confidence,
        )

    def _generate_percentages(self, count: int) -> list[float]:
        """Generate random percentages that sum to 1.0."""
        # Generate random values
        values = [random.random() for _ in range(count)]
        total = sum(values)
        # Normalize to sum to 1.0 and round
        return [round(v / total, 2) for v in values]


class VisionAPIError(Exception):
    """Exception raised when Vision API call fails."""

    def __init__(self, message: str, code: str | None = None) -> None:
        """Initialize Vision API error."""
        self.message = message
        self.code = code
        super().__init__(self.message)


# Singleton instance
vision_client = VisionAPIClient()
