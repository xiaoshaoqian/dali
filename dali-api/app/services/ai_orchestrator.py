"""AI orchestration service for outfit recommendations.

This service coordinates:
1. Image recognition (Alibaba Vision API)
2. Style analysis and recommendation generation
3. Theory explanation generation (Tongyi Qianwen / GPT-4)

Currently provides mock implementation for development.
"""

import random
import uuid
from dataclasses import dataclass
from enum import Enum


class OccasionType(str, Enum):
    """Supported occasion types for outfit recommendations."""

    ROMANTIC_DATE = "浪漫约会"
    BUSINESS_MEETING = "商务会议"
    WORKPLACE = "职场通勤"
    FRIEND_GATHERING = "朋友聚会"
    DAILY_CASUAL = "日常出行"
    HOME_LEISURE = "居家休闲"


@dataclass
class OutfitItem:
    """A single item in an outfit recommendation."""

    item_type: str  # 上衣, 下装, 鞋子, 配饰
    name: str
    color: str
    color_hex: str
    style_tip: str
    image_url: str | None = None


@dataclass
class TheoryExplanation:
    """Theory explanation for an outfit recommendation."""

    color_principle: str  # 对比色搭配, 同色系搭配, etc.
    style_analysis: str
    body_type_advice: str
    occasion_fit: str
    full_explanation: str  # 150-200 characters


@dataclass
class OutfitRecommendation:
    """A complete outfit recommendation with items and theory."""

    id: str
    name: str
    items: list[OutfitItem]
    theory: TheoryExplanation
    style_tags: list[str]
    confidence: float


# Mock outfit templates per occasion
OUTFIT_TEMPLATES: dict[str, list[dict]] = {
    OccasionType.ROMANTIC_DATE: [
        {
            "name": "甜美约会风",
            "items": [
                {"type": "上衣", "name": "粉色针织开衫", "color": "粉色", "hex": "#FFB6C1"},
                {"type": "下装", "name": "白色A字裙", "color": "白色", "hex": "#FFFFFF"},
                {"type": "鞋子", "name": "裸色高跟鞋", "color": "裸色", "hex": "#E3BC9A"},
            ],
            "style_tags": ["甜美", "约会", "淑女"],
            "color_principle": "粉白配色",
            "theory": "粉色与白色的搭配温柔甜美，A字裙优雅修身，展现柔美气质。整体搭配浪漫又不失端庄，非常适合约会场合。",
        },
        {
            "name": "优雅知性风",
            "items": [
                {"type": "上衣", "name": "米色丝绸衬衫", "color": "米色", "hex": "#F5F5DC"},
                {"type": "下装", "name": "深蓝色阔腿裤", "color": "深蓝", "hex": "#000080"},
                {"type": "配饰", "name": "珍珠耳环", "color": "白色", "hex": "#FFFAF0"},
            ],
            "style_tags": ["知性", "优雅", "约会"],
            "color_principle": "中性色搭配",
            "theory": "米色与深蓝的搭配知性优雅，丝绸材质增添高级感，珍珠耳环点睛，展现成熟魅力。",
        },
        {
            "name": "浪漫法式风",
            "items": [
                {"type": "上衣", "name": "碎花泡泡袖上衣", "color": "碎花", "hex": "#FFE4E1"},
                {"type": "下装", "name": "牛仔半身裙", "color": "蓝色", "hex": "#4169E1"},
                {"type": "鞋子", "name": "草编凉鞋", "color": "棕色", "hex": "#8B4513"},
            ],
            "style_tags": ["法式", "浪漫", "休闲约会"],
            "color_principle": "碎花配牛仔",
            "theory": "碎花上衣搭配牛仔裙，法式浪漫与休闲完美结合。泡泡袖修饰肩部线条，整体清新活泼又不失浪漫感。",
        },
    ],
    OccasionType.BUSINESS_MEETING: [
        {
            "name": "干练精英风",
            "items": [
                {"type": "上衣", "name": "黑色西装外套", "color": "黑色", "hex": "#000000"},
                {"type": "内搭", "name": "白色真丝衬衫", "color": "白色", "hex": "#FFFFFF"},
                {"type": "下装", "name": "黑色西装裤", "color": "黑色", "hex": "#000000"},
            ],
            "style_tags": ["正式", "干练", "专业"],
            "color_principle": "黑白经典配色",
            "theory": "黑白搭配永恒经典，西装剪裁展现专业气场，真丝衬衫增添质感。整体大气端庄，适合重要商务场合。",
        },
        {
            "name": "温和领导风",
            "items": [
                {"type": "上衣", "name": "驼色西装外套", "color": "驼色", "hex": "#C19A6B"},
                {"type": "内搭", "name": "象牙白衬衫", "color": "象牙白", "hex": "#FFFFF0"},
                {"type": "下装", "name": "深灰色西裤", "color": "深灰", "hex": "#696969"},
            ],
            "style_tags": ["大气", "温和", "领导力"],
            "color_principle": "大地色系",
            "theory": "驼色与灰色的搭配温和不失气场，大地色系给人稳重可靠的印象，适合需要建立信任感的商务场合。",
        },
        {
            "name": "简约高级风",
            "items": [
                {"type": "上衣", "name": "藏蓝色针织衫", "color": "藏蓝", "hex": "#000080"},
                {"type": "下装", "name": "米白色九分裤", "color": "米白", "hex": "#FAF0E6"},
                {"type": "配饰", "name": "金色手表", "color": "金色", "hex": "#FFD700"},
            ],
            "style_tags": ["简约", "高级", "商务"],
            "color_principle": "深浅对比",
            "theory": "藏蓝与米白形成优雅对比，针织材质柔化商务感，金色手表提升品质，整体简约不简单。",
        },
    ],
    OccasionType.WORKPLACE: [
        {
            "name": "清爽通勤风",
            "items": [
                {"type": "上衣", "name": "浅蓝色条纹衬衫", "color": "浅蓝", "hex": "#ADD8E6"},
                {"type": "下装", "name": "白色九分裤", "color": "白色", "hex": "#FFFFFF"},
                {"type": "鞋子", "name": "裸色尖头鞋", "color": "裸色", "hex": "#E3BC9A"},
            ],
            "style_tags": ["通勤", "清爽", "简约"],
            "color_principle": "蓝白清爽配色",
            "theory": "浅蓝条纹衬衫清新专业，白色九分裤干净利落，整体搭配清爽宜人，非常适合日常办公环境。",
        },
        {
            "name": "知性OL风",
            "items": [
                {"type": "上衣", "name": "米色针织背心", "color": "米色", "hex": "#F5F5DC"},
                {"type": "内搭", "name": "白色衬衫", "color": "白色", "hex": "#FFFFFF"},
                {"type": "下装", "name": "黑色西装裙", "color": "黑色", "hex": "#000000"},
            ],
            "style_tags": ["知性", "OL", "通勤"],
            "color_principle": "经典中性色",
            "theory": "针织背心叠搭衬衫时髦又保暖，黑色西装裙修身显瘦，整体知性优雅，适合各种职场环境。",
        },
        {
            "name": "轻熟通勤风",
            "items": [
                {"type": "上衣", "name": "奶茶色西装", "color": "奶茶色", "hex": "#D2B48C"},
                {"type": "内搭", "name": "黑色打底衫", "color": "黑色", "hex": "#000000"},
                {"type": "下装", "name": "同色系西裤", "color": "奶茶色", "hex": "#D2B48C"},
            ],
            "style_tags": ["轻熟", "套装", "通勤"],
            "color_principle": "同色系搭配",
            "theory": "同色系套装高级感十足，奶茶色温柔减龄，黑色内搭增加层次感，适合追求品质感的职场女性。",
        },
    ],
    OccasionType.FRIEND_GATHERING: [
        {
            "name": "活力派对风",
            "items": [
                {"type": "上衣", "name": "红色短款卫衣", "color": "红色", "hex": "#FF0000"},
                {"type": "下装", "name": "黑色皮裤", "color": "黑色", "hex": "#000000"},
                {"type": "配饰", "name": "金属项链", "color": "银色", "hex": "#C0C0C0"},
            ],
            "style_tags": ["活力", "派对", "时尚"],
            "color_principle": "红黑撞色",
            "theory": "红黑搭配热情又酷酷的，短款卫衣显腿长，皮裤增添时髦感，非常适合和朋友聚会时穿搭。",
        },
        {
            "name": "慵懒时髦风",
            "items": [
                {"type": "上衣", "name": "oversized毛衣", "color": "燕麦色", "hex": "#DCDCDC"},
                {"type": "下装", "name": "阔腿牛仔裤", "color": "牛仔蓝", "hex": "#4169E1"},
                {"type": "鞋子", "name": "白色运动鞋", "color": "白色", "hex": "#FFFFFF"},
            ],
            "style_tags": ["慵懒", "时髦", "休闲"],
            "color_principle": "中性色搭配牛仔",
            "theory": "oversized毛衣慵懒舒适，阔腿牛仔裤修饰腿型，整体搭配既舒服又时髦，适合轻松的朋友聚会。",
        },
        {
            "name": "甜酷少女风",
            "items": [
                {"type": "上衣", "name": "黑色短款T恤", "color": "黑色", "hex": "#000000"},
                {"type": "下装", "name": "粉色百褶裙", "color": "粉色", "hex": "#FFB6C1"},
                {"type": "配饰", "name": "链条包", "color": "银色", "hex": "#C0C0C0"},
            ],
            "style_tags": ["甜酷", "少女", "聚会"],
            "color_principle": "黑粉撞色",
            "theory": "黑色T恤搭配粉色百褶裙，甜酷风格非常吸睛。链条包增添时尚度，适合和闺蜜的欢乐时光。",
        },
    ],
    OccasionType.DAILY_CASUAL: [
        {
            "name": "简约日常风",
            "items": [
                {"type": "上衣", "name": "白色棉质T恤", "color": "白色", "hex": "#FFFFFF"},
                {"type": "下装", "name": "浅蓝牛仔裤", "color": "浅蓝", "hex": "#87CEEB"},
                {"type": "鞋子", "name": "帆布鞋", "color": "白色", "hex": "#FFFFFF"},
            ],
            "style_tags": ["简约", "日常", "舒适"],
            "color_principle": "蓝白经典",
            "theory": "白T配牛仔永不过时，简单却高级。浅蓝色牛仔裤显肤色，帆布鞋轻便舒适，非常适合日常逛街约咖啡。",
        },
        {
            "name": "文艺休闲风",
            "items": [
                {"type": "上衣", "name": "条纹长袖T恤", "color": "蓝白条纹", "hex": "#000080"},
                {"type": "下装", "name": "卡其色阔腿裤", "color": "卡其", "hex": "#C3B091"},
                {"type": "配饰", "name": "草编包", "color": "棕色", "hex": "#8B4513"},
            ],
            "style_tags": ["文艺", "休闲", "日常"],
            "color_principle": "海军蓝配大地色",
            "theory": "海魂条纹T恤文艺又减龄，卡其色阔腿裤舒适显瘦，草编包增添度假感，非常适合周末的悠闲时光。",
        },
        {
            "name": "运动休闲风",
            "items": [
                {"type": "上衣", "name": "灰色连帽卫衣", "color": "灰色", "hex": "#808080"},
                {"type": "下装", "name": "黑色运动裤", "color": "黑色", "hex": "#000000"},
                {"type": "鞋子", "name": "老爹鞋", "color": "米白", "hex": "#FAF0E6"},
            ],
            "style_tags": ["运动", "休闲", "舒适"],
            "color_principle": "灰黑中性色",
            "theory": "卫衣配运动裤舒适又时髦，灰黑搭配显瘦百搭，老爹鞋增高显腿长，适合逛街、遛弯等日常活动。",
        },
    ],
    OccasionType.HOME_LEISURE: [
        {
            "name": "慵懒居家风",
            "items": [
                {"type": "上衣", "name": "针织开衫", "color": "燕麦色", "hex": "#F5DEB3"},
                {"type": "下装", "name": "棉质长裤", "color": "灰色", "hex": "#A9A9A9"},
                {"type": "配饰", "name": "毛绒拖鞋", "color": "粉色", "hex": "#FFB6C1"},
            ],
            "style_tags": ["慵懒", "舒适", "居家"],
            "color_principle": "暖色调搭配",
            "theory": "针织开衫柔软保暖，棉质长裤舒适自在，暖色调让人放松愉悦，非常适合在家休息或远程办公。",
        },
        {
            "name": "简约居家风",
            "items": [
                {"type": "上衣", "name": "纯棉睡衣套装", "color": "浅蓝", "hex": "#B0E0E6"},
                {"type": "下装", "name": "配套长裤", "color": "浅蓝", "hex": "#B0E0E6"},
                {"type": "配饰", "name": "软底拖鞋", "color": "白色", "hex": "#FFFFFF"},
            ],
            "style_tags": ["简约", "居家", "放松"],
            "color_principle": "同色系舒适",
            "theory": "同色系睡衣套装简洁大方，浅蓝色令人放松宁静，纯棉材质亲肤透气，适合在家看剧放松。",
        },
        {
            "name": "温馨家居风",
            "items": [
                {"type": "上衣", "name": "格纹法兰绒衬衫", "color": "红格纹", "hex": "#CD5C5C"},
                {"type": "下装", "name": "黑色打底裤", "color": "黑色", "hex": "#000000"},
                {"type": "配饰", "name": "厚底棉拖鞋", "color": "棕色", "hex": "#8B4513"},
            ],
            "style_tags": ["温馨", "休闲", "居家"],
            "color_principle": "暖色调格纹",
            "theory": "法兰绒衬衫温暖舒适，格纹图案增添活力，打底裤简单百搭，非常适合居家或简单外出。",
        },
    ],
}

# Body type advice templates
BODY_TYPE_ADVICE: dict[str, str] = {
    "梨形": "选择上宽下窄的款式，强调上半身，修饰臀胯",
    "苹果形": "选择收腰款式，V领显瘦，避免过于宽松",
    "沙漏形": "突出腰线，修身款式最佳，展现曲线美",
    "直筒形": "制造腰线，选择有层次感的搭配",
    "倒三角形": "选择下摆有设计感的下装，平衡肩宽",
}


class AIOrchestrator:
    """AI orchestration service for outfit recommendations.

    Currently provides mock implementation for development.
    Production implementation would use Tongyi Qianwen or GPT-4.
    """

    def __init__(self) -> None:
        """Initialize AI Orchestrator."""
        pass

    async def generate_outfit_recommendations(
        self,
        garment_type: str,
        colors: list[dict],
        style_tags: list[str],
        occasion: str,
        body_type: str | None = None,
        user_styles: list[str] | None = None,
    ) -> list[OutfitRecommendation]:
        """Generate 3 outfit recommendations based on garment and preferences.

        Args:
            garment_type: Type of garment (上衣, 裤子, etc.)
            colors: Primary colors from garment analysis
            style_tags: Style tags from garment analysis
            occasion: Selected occasion type
            body_type: User's body type for personalization
            user_styles: User's preferred styles

        Returns:
            List of 3 OutfitRecommendation objects
        """
        # Get templates for the occasion
        templates = OUTFIT_TEMPLATES.get(occasion, OUTFIT_TEMPLATES[OccasionType.DAILY_CASUAL])

        recommendations = []
        for template in templates:
            # Create outfit items
            items = []
            for item_data in template["items"]:
                item = OutfitItem(
                    item_type=item_data["type"],
                    name=item_data["name"],
                    color=item_data["color"],
                    color_hex=item_data["hex"],
                    style_tip=self._generate_style_tip(item_data["type"], item_data["name"]),
                )
                items.append(item)

            # Generate theory explanation
            body_advice = BODY_TYPE_ADVICE.get(body_type or "沙漏形", "根据你的身材特点，这套搭配很适合你")
            theory = TheoryExplanation(
                color_principle=template["color_principle"],
                style_analysis=f"这套搭配属于{'/'.join(template['style_tags'])}风格",
                body_type_advice=body_advice,
                occasion_fit=f"非常适合{occasion}场合",
                full_explanation=template["theory"],
            )

            # Generate confidence score
            confidence = round(random.uniform(0.85, 0.95), 2)

            recommendation = OutfitRecommendation(
                id=str(uuid.uuid4()),
                name=template["name"],
                items=items,
                theory=theory,
                style_tags=template["style_tags"],
                confidence=confidence,
            )
            recommendations.append(recommendation)

        return recommendations

    def _generate_style_tip(self, item_type: str, item_name: str) -> str:
        """Generate a style tip for an outfit item."""
        tips = {
            "上衣": "注意与下装的比例平衡",
            "内搭": "选择合适的领型搭配外套",
            "下装": "根据身形选择合适的版型",
            "鞋子": "鞋子颜色与整体协调",
            "配饰": "配饰点睛，不要过多",
        }
        return tips.get(item_type, "注意与整体风格协调")


# Singleton instance
ai_orchestrator = AIOrchestrator()
