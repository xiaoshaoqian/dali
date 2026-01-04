---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
  - ux-design/pages/README.md (17 HTML prototypes)
workflowStatus: complete
completedAt: 2026-01-04
validationResults:
  frCoverage: 65/65 (100%)
  epicCount: 9
  storyCount: 30
  architectureCompliance: passed
  htmlPrototypeReferences: complete
---

# 搭理app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for 搭理app (dali), decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories. All UI implementation MUST exactly replicate the HTML prototypes located in `_bmad-output/planning-artifacts/ux-design/pages/`.

## Requirements Inventory

### Functional Requirements

从PRD中提取的65个功能需求：

**用户账号与个性化设置 (FR1-8):**
- FR1: 用户可以通过手机号 + 验证码注册账号
- FR2: 用户可以通过微信快捷登录创建账号
- FR3: 新用户首次注册后可以填写身材类型信息（苹果型、梨型、沙漏型、矩形型、倒三角型）
- FR4: 新用户首次注册后可以选择喜欢的风格类型（通勤、休闲、约会、运动、文艺）
- FR5: 新用户首次注册后可以选择常见使用场合（上班、约会、聚会、日常、运动）
- FR6: 用户可以随时修改个人风格偏好设置
- FR7: 用户可以随时更新身材类型和常见场合信息
- FR8: 用户的个性化数据可以在多设备间同步

**单品拍摄与管理 (FR9-17):**
- FR9: 用户可以通过相机拍摄衣服照片
- FR10: 用户可以从手机相册选择衣服照片
- FR11: 用户可以对上传的照片进行裁剪
- FR12: 用户可以对上传的照片进行基础编辑（旋转、调整）
- FR13: 系统可以识别衣服照片中的服装类型（上衣、裤子、裙子、外套等）
- FR14: 系统可以提取衣服照片中的颜色信息
- FR15: 系统可以识别衣服照片中的图案和风格信息
- FR16: 用户可以查看已上传的所有单品列表
- FR17: 用户可以删除已上传的单品照片

**AI 搭配生成与推荐 (FR18-27):**
- FR18: 用户上传单品后，系统可以在 5 秒内生成 3 套搭配方案
- FR19: 每套搭配方案可以展示推荐单品的高清商品图组合
- FR20: 每套搭配方案可以展示精美排版设计的完整搭配效果
- FR21: 用户可以基于个人身材类型获得定制化搭配推荐
- FR22: 用户可以基于个人风格偏好获得定制化搭配推荐
- FR23: 用户可以基于选择的场合获得定制化搭配推荐
- FR24: 系统可以结合用户所在城市的天气数据提供搭配建议
- FR25: 用户可以对搭配方案进行点赞反馈
- FR26: 用户可以对搭配方案进行收藏标记
- FR27: 系统可以基于用户的点赞和收藏行为学习个人偏好

**理论知识与教育 (FR28-34):**
- FR28: 每套搭配方案可以展示配色原理解析
- FR29: 每套搭配方案可以展示风格分析说明
- FR30: 每套搭配方案可以展示搭配依据文字说明（为什么这样搭）
- FR31: 每套搭配方案可以展示场合适配建议
- FR32: 搭配方案可以展示配色原理可视化（色轮、配色卡片）
- FR33: 搭配方案可以展示风格标签卡片（通勤、休闲、约会等）
- FR34: 搭配方案可以展示场合适配图标

**个人穿搭知识库 (FR35-42):**
- FR35: 系统可以自动保存用户生成的所有搭配方案到本地
- FR36: 系统可以将用户的搭配方案同步到云端
- FR37: 用户可以按场合分类浏览历史搭配方案（约会、通勤、聚会、休闲、运动、其他）
- FR38: 用户可以按时间倒序查看历史方案（最近 7 天、最近 30 天、全部）
- FR39: 用户可以在离线状态下查看历史搭配方案
- FR40: 用户可以查看已点赞的搭配方案列表
- FR41: 用户可以查看已收藏的搭配方案列表
- FR42: 用户可以删除不需要的历史搭配方案

**分享与社交传播 (FR43-49):**
- FR43: 用户可以生成带 app 水印的精美分享图片
- FR44: 用户可以一键分享搭配方案到微信
- FR45: 用户可以一键分享搭配方案到微信朋友圈
- FR46: 用户可以一键分享搭配方案到小红书
- FR47: 用户可以一键分享搭配方案到抖音
- FR48: 系统可以追踪用户的分享行为数据
- FR49: 分享图片可以提供 3 种风格模板（简约、时尚、文艺）

**场合化与情境推荐 (FR50-57):**
- FR50: 用户可以为单品生成浪漫约会场合的搭配方案
- FR51: 用户可以为单品生成休闲约会场合的搭配方案
- FR52: 用户可以为单品生成商务会议场合的搭配方案
- FR53: 用户可以为单品生成职场通勤场合的搭配方案
- FR54: 用户可以为单品生成朋友聚会场合的搭配方案
- FR55: 用户可以为单品生成日常出行场合的搭配方案
- FR56: 系统可以基于用户位置获取城市级别的天气信息
- FR57: 系统可以结合天气数据（温度、降雨）调整搭配推荐

**系统支持能力 (FR58-65):**
- FR58: 系统可以请求和管理相机权限
- FR59: 系统可以请求和管理照片库权限
- FR60: 系统可以请求和管理位置权限（可选）
- FR61: 系统可以在搭配生成完成后发送推送通知
- FR62: 用户可以授权或拒绝推送通知权限
- FR63: 系统可以在权限被拒绝时提供备选方案
- FR64: 系统可以在离线状态下保持核心历史查看功能可用
- FR65: 系统可以在网络恢复后自动同步本地数据到云端

### Non-Functional Requirements

**Performance Requirements:**
- NFR-P1 (Critical): AI 搭配生成响应时间 < 5 秒（从用户上传照片到展示首个方案）
- NFR-P2: 图片上传时间 < 2 秒（500KB 照片，4G 网络环境）
- NFR-P3: 应用冷启动时间 < 3 秒（从点击图标到首屏可交互）
- NFR-P4: 应用热启动时间 < 1 秒（从后台恢复）
- NFR-P5: 相机响应时间 < 500ms（从点击拍照按钮到预览界面显示）
- NFR-P6: 搭配方案卡片渲染 < 300ms（5 套方案完整渲染）
- NFR-P7: 历史方案查询响应 < 200ms（本地 SQLite 查询）
- NFR-P8: 后端 API P95 响应时间 < 1 秒
- NFR-P9: 后端 API P99 响应时间 < 3 秒

**Security & Privacy:**
- NFR-S1: 所有网络通信使用 HTTPS/TLS 1.2+ 加密传输
- NFR-S2: 用户照片在存储时进行 AES-256 加密
- NFR-S3: 用户个人信息（身材、风格偏好）在数据库中加密存储
- NFR-S5: 符合《中华人民共和国个人信息保护法》要求
- NFR-S9: 位置数据仅获取城市级别（不精确到具体地址或经纬度）

**Reliability:**
- NFR-R1: 核心服务（AI 生成、用户认证、数据同步）可用性 > 99.5%
- NFR-R4: 用户数据（搭配历史、照片、偏好）每日自动备份
- NFR-R8: 应用崩溃率 < 0.1%（iOS 平台）
- NFR-R10: 网络请求失败时，自动重试 3 次（指数退避策略）

**Scalability:**
- NFR-SC1: MVP 阶段支持 10,000 DAU（日活跃用户）
- NFR-SC2: 增长阶段支持 100,000 DAU（不降低性能超过 10%）

**Usability:**
- NFR-U1: 支持 iOS 14+ 和 Android 8.0+（覆盖 95%+ 目标用户）
- NFR-U6: 用户可在离线状态下查看历史搭配方案（完整功能）
- NFR-U8: 网络恢复后 30 秒内自动同步本地数据
- NFR-U11: iOS VoiceOver 可正确朗读核心操作按钮

**AI Quality:**
- NFR-AI1: 图像识别准确率 > 90%（正确识别服装类型、颜色、风格）
- NFR-AI2: 搭配推荐准确率 > 75%（用户点赞或保存占比）
- NFR-AI3: 理论解析有用性 > 80%（用户反馈"有帮助"占比）
- NFR-AI4: AI 生成失败率 < 5%（需提供降级方案）

### Additional Requirements

**架构技术要求:**

1. **Starter Template (Critical)**:
   - Mobile: 使用 `npx create-expo-app@latest dali-mobile` (Expo Default Template)
   - Backend: Python FastAPI with SQLAlchemy 2.0+

2. **Technology Stack (Mandatory)**:
   - **Mobile**: React Native (Expo SDK 51+), TypeScript, Zustand (state), TanStack React Query (server state)
   - **Backend**: Python FastAPI, SQLAlchemy 2.0, PostgreSQL
   - **Mobile Local Storage**: Expo SQLite
   - **Cloud Storage**: Alibaba Cloud OSS
   - **AI Services**: Alibaba Cloud Vision API (图像识别), Tongyi Qianwen/GPT-4 (理论生成)
   - **Authentication**: Phone SMS + WeChat OAuth, JWT tokens

3. **Data Sync Strategy**: Last-Write-Wins + Soft Delete (SQLite ↔ PostgreSQL)

4. **Component Requirements**:
   - 7 个核心定制组件必须开发：OutfitCard, TheoryVisualization, StyleTagChip, SkeletonLoader, ProgressCircle, PreferenceCloud, ShareTemplate
   - 所有组件遵循 iOS Human Interface Guidelines
   - 使用 SF Pro 字体系统和 SF Symbols 图标

5. **Naming Conventions (Mandatory)**:
   - Database: snake_case (tables, columns)
   - API: plural nouns, kebab-case endpoints, camelCase params
   - Frontend: PascalCase (components), camelCase (hooks, stores, services)
   - Constants: UPPER_SNAKE_CASE

**UX 设计要求:**

1. **Design Direction**: Direction L4 - 精致层叠卡片设计
   - iPhone 15 Pro 精确尺寸 (393×852px)
   - 紫色渐变头部 + 白色内容卡片上浮布局
   - 毛玻璃 Tab Bar 效果

2. **Color System (Mandatory)**:
   - Primary Purple: `#6C63FF`
   - Secondary Purple: `#9D94FF`
   - Accent Pink: `#FF6B9D`
   - Background Gray: `#F2F2F7`
   - iOS 系统灰阶用于文本

3. **Typography**: SF Pro (iOS 原生字体)，支持 Dynamic Type

4. **Critical Experience Principles**:
   - "5 秒啊哈"原则: 首次生成方案必须在 5 秒内让用户感到"这就是我要的"
   - "零摩擦交互"原则: 核心流程 < 3 步完成
   - "懂你的 AI 闺蜜"原则: 友好语气，非机械化
   - "知识沉淀可见"原则: 成长轨迹可视化
   - "离线优先，智能降级"原则: 历史完全离线可用

5. **HTML Prototype Replication (CRITICAL)**:
   - **所有 UI 实现必须一比一复刻 HTML 原型文件**
   - 原型位置: `_bmad-output/planning-artifacts/ux-design/pages/`
   - 共 17 个 HTML 原型页面，包括：
     - 核心功能: 欢迎页、首页、搭配列表、个人页、首页空状态
     - 搭配生成流程: 场合选择、拍照+场合、AI生成中、搭配结果、方案详情、虚拟试穿
     - 设置中心: 设置首页、账号安全、隐私设置、帮助反馈、关于我们
     - 分享功能: 分享模板选择
   - MD 文档仅供参考，HTML 为最终实现标准

6. **Accessibility (WCAG 2.1 Level AA)**:
   - 文本对比度 ≥ 4.5:1
   - 支持 iOS Dynamic Type
   - VoiceOver 完整支持
   - 最小点击区域 44pt × 44pt

7. **Animation Specifications**:
   - 快速反馈: 100-150ms, ease-out
   - 标准过渡: 200-300ms, cubic-bezier(0.4, 0, 0.2, 1)
   - 强调动画: 300-500ms, spring
   - 骨架脉冲: 1500ms, ease-in-out

### FR Coverage Map

| Epic | Stories | Covers FRs | Covers NFRs | Architecture | UX Requirements |
|------|---------|------------|-------------|--------------|-----------------|
| Epic 0: Project Setup | 2 stories | - | NFR-P3, NFR-R8 | Starter template, folder structure, dependencies | Design system setup |
| Epic 1: Authentication & Onboarding | 4 stories | FR1-FR8 | NFR-S1, NFR-S3 | JWT auth, WeChat OAuth, SecureStore | 欢迎页、登录页、个性化问答 |
| Epic 2: Camera & Photo Management | 3 stories | FR9-FR17 | NFR-P2, NFR-P5, NFR-S2 | Expo Camera, Image Upload, OSS integration | 拍照页、相册选择、裁剪编辑 |
| Epic 3: AI Outfit Generation | 5 stories | FR18-FR27, FR50-FR57 | NFR-P1, NFR-AI1-AI4 | AI Orchestrator, Vision API, LLM integration | 场合选择、AI生成中、骨架屏等待体验 |
| Epic 4: Theory & Knowledge Display | 3 stories | FR28-FR34 | - | TheoryVisualization component | 配色理论可视化、风格标签、理论解析面板 |
| Epic 5: Outfit History & Search | 4 stories | FR35-FR42 | NFR-P7, NFR-U6, NFR-U8 | SQLite local storage, Sync service | 搭配列表页、筛选器、网格布局 |
| Epic 6: Sharing & Social | 3 stories | FR43-FR49 | - | ShareTemplate component, Social SDK | 分享模板选择、分享图片生成 |
| Epic 7: Profile & Growth Tracking | 3 stories | FR6-FR8 | - | ProgressCircle, PreferenceCloud components | 个人页、风格档案、成长可视化 |
| Epic 8: Permissions & Offline | 3 stories | FR58-FR65 | NFR-U6, NFR-R10 | Permission manager, Offline handler | 权限请求、离线提示、网络恢复 |

## Epic List

1. **Epic 0**: Project Setup & Foundation (2 stories)
2. **Epic 1**: Authentication & Onboarding (4 stories)
3. **Epic 2**: Camera & Photo Management (3 stories)
4. **Epic 3**: AI Outfit Generation Engine (5 stories)
5. **Epic 4**: Theory & Knowledge Display (3 stories)
6. **Epic 5**: Outfit History & Search (4 stories)
7. **Epic 6**: Sharing & Social Integration (3 stories)
8. **Epic 7**: Profile & Growth Tracking (3 stories)
9. **Epic 8**: Permissions & Offline Support (3 stories)

**Total**: 9 Epics, 30 Stories (estimated)

---

## Epic 0: Project Setup & Foundation

**Goal**: Initialize mobile and backend projects using the specified starter templates, establish folder structure, configure core dependencies, and set up the design system foundation to enable all subsequent development.

### Story 0.1: Initialize Mobile Project with Expo

As a **developer**,
I want to initialize the mobile project using Expo Default Template,
So that the project has the correct foundation and structure per architecture specifications.

**Acceptance Criteria:**

**Given** no existing mobile project
**When** I run `npx create-expo-app@latest dali-mobile`
**Then** the project is created with Expo Router, TypeScript, and default structure
**And** the project follows the architecture-defined folder structure:
  - `app/` for file-based routing
  - `src/components/` for UI components
  - `src/services/` for API and external services
  - `src/stores/` for Zustand state management
  - `src/hooks/` for custom React hooks
  - `src/utils/` for utility functions
  - `src/constants/` for app constants (colors, typography, spacing, API endpoints)

**Given** the Expo project is initialized
**When** I install required dependencies per architecture document
**Then** the following packages are installed:
  - expo-camera, expo-image-picker, expo-image-manipulator (FR9-17)
  - expo-sqlite (FR35-42)
  - expo-secure-store (NFR-S2, S3)
  - expo-location (FR56-57)
  - expo-notifications (FR61-62)
  - axios, @tanstack/react-query (API communication)
  - zustand (state management)
  - react-native-reanimated, react-native-svg (animations, visualizations)

**Given** dependencies are installed
**When** I configure the design system constants
**Then** `src/constants/colors.ts` defines:
  - Primary: `#6C63FF`, Secondary: `#9D94FF`, Accent: `#FF6B9D`
  - iOS gray scale: Gray1-5
  - Semantic colors: Success, Warning, Error, Info
**And** `src/constants/typography.ts` defines SF Pro font scales (Large Title 34pt → Caption 11pt)
**And** `src/constants/spacing.ts` defines 8px-based spacing system (XXS 2px → XXXL 48px)

### Story 0.2: Initialize Backend Project with FastAPI

As a **developer**,
I want to initialize the backend project with Python FastAPI and SQLAlchemy 2.0,
So that the backend has the correct architecture foundation for AI integration and data management.

**Acceptance Criteria:**

**Given** no existing backend project
**When** I create `dali-api` directory and run `poetry init`
**Then** the Poetry project is initialized with Python 3.10+

**Given** Poetry is initialized
**When** I add core dependencies: `poetry add fastapi uvicorn sqlalchemy alembic asyncpg`
**Then** all packages are installed and `pyproject.toml` is updated

**Given** dependencies are installed
**When** I create the architecture-defined folder structure
**Then** the project has:
  - `app/main.py` (FastAPI entry point)
  - `app/api/v1/` (route modules: auth, users, outfits, wardrobe, share, context)
  - `app/models/` (SQLAlchemy models: user, preference, outfit, outfit_item, theory, share_record)
  - `app/schemas/` (Pydantic schemas)
  - `app/services/` (business logic: auth, user, outfit, ai_orchestrator, storage, sms)
  - `app/integrations/` (external APIs: alibaba_vision, tongyi_qianwen, alibaba_oss, wechat, weather)
  - `app/core/` (utilities: security, exceptions, logging)
  - `app/db/` (database session management)
  - `alembic/` (database migrations)

**Given** folder structure is created
**When** I configure naming conventions in code templates
**Then** database tables use `snake_case` (e.g., `user_preferences`, `outfit_items`)
**And** API endpoints use plural nouns and kebab-case (e.g., `/api/v1/outfits`, `/wardrobe-items`)
**And** JSON fields use camelCase (e.g., `userId`, `createdAt`)

---

## Epic 1: Authentication & Onboarding

**Goal**: Implement user registration and login with Phone SMS + WeChat OAuth, collect 3-5 personalized questions (body type, style preferences, occasions) within 30 seconds, and achieve >60% registration conversion rate per PRD success criteria.

### Story 1.1: Phone SMS Registration & Verification

As a **new user**,
I want to register using my phone number with SMS verification,
So that I can create an account quickly and securely.

**Acceptance Criteria:**

**Given** I am on the welcome screen (HTML: `06-welcome-onboarding/welcome-onboarding-page.html`)
**When** I tap "手机号登录" button
**Then** I see the phone registration screen with:
  - Phone number input field (placeholder: "请输入手机号")
  - "获取验证码" button (disabled until valid 11-digit number entered)
  - 紫色渐变主题 per UX spec

**Given** I enter a valid 11-digit phone number
**When** I tap "获取验证码"
**Then** SMS is sent via backend SMS service
**And** button text changes to "60s 后重新发送" with countdown
**And** 6-digit verification code input field appears

**Given** I receive the SMS code
**When** I enter the 6-digit code
**Then** backend verifies the code via `/api/v1/auth/sms/verify`
**And** if valid, I receive JWT access token (15min expiry) + refresh token (30 days)
**And** tokens are stored in expo-secure-store (NFR-S3)
**And** I am navigated to onboarding questionnaire

**Given** SMS verification fails
**When** I enter an incorrect code
**Then** I see error message: "验证码错误，请重试"
**And** I can re-enter the code up to 3 times before requesting new SMS

### Story 1.2: WeChat Quick Login

As a **new user**,
I want to log in using my WeChat account,
So that I can register in one tap without entering phone number.

**Acceptance Criteria:**

**Given** I am on the welcome screen
**When** I tap "微信一键登录" button
**Then** WeChat SDK is invoked for OAuth authorization
**And** I see WeChat authorization UI (external)

**Given** I approve WeChat authorization
**When** WeChat returns authorization code
**Then** backend exchanges code for WeChat user info via `/api/v1/auth/wechat/login`
**And** if new user, account is created with WeChat openid
**And** I receive JWT tokens stored in expo-secure-store
**And** I am navigated to onboarding questionnaire

**Given** WeChat authorization is denied or fails
**When** error occurs
**Then** I see friendly error: "微信登录失败，请重试或使用手机号登录"
**And** I can return to registration options

### Story 1.3: Personalized Onboarding Questionnaire

As a **newly registered user**,
I want to answer 3-5 personalization questions in under 30 seconds,
So that AI can provide accurate outfit recommendations from the start.

**Acceptance Criteria:**

**Given** I just completed phone/WeChat registration
**When** onboarding flow starts
**Then** I see progress indicator "1/3" at the top
**And** I see friendly welcome text: "让 AI 更懂你，3 个问题即可开始"

**Step 1 - Body Type Selection:**
**Given** I am on step 1/3
**When** the screen loads
**Then** I see 5 illustrated body type cards (HTML spec):
  - 梨形 (Pear)
  - 苹果形 (Apple)
  - 沙漏形 (Hourglass)
  - 直筒形 (Rectangle)
  - 倒三角形 (Inverted Triangle)
**And** each card has an illustration + label
**When** I tap a body type card
**Then** it highlights with purple border `#6C63FF`
**And** "下一步" button becomes enabled

**Step 2 - Style Preferences (Multi-select):**
**Given** I tap "下一步" from step 1
**When** step 2/3 loads
**Then** I see style preference chips (multi-select):
  - 简约 (Minimalist)
  - 时尚 (Trendy)
  - 甜美 (Sweet)
  - 知性 (Intellectual)
  - 运动 (Athletic)
**And** I can select 1-3 styles
**When** I select at least 1 style
**Then** "下一步" button is enabled

**Step 3 - Common Occasions (Multi-select):**
**Given** I tap "下一步" from step 2
**When** step 3/3 loads
**Then** I see occasion chips with icons:
  - 上班 (Work) 🏢
  - 约会 (Date) 💕
  - 聚会 (Party) 🎉
  - 日常 (Daily) ☕
  - 运动 (Sports) 🏃
**And** I can select 1-3 occasions
**When** I select at least 1 occasion and tap "完成"
**Then** preferences are saved to backend `/api/v1/users/me/preferences`
**And** I am navigated to Home screen
**And** total onboarding time is logged (target: <30 seconds per NFR)

**Given** onboarding is complete
**When** I reach the Home screen
**Then** I see personalized greeting: "嗨，Xiaoshaoqian！" (using user name)
**And** subtitle hints at personalization: "AI 已为你定制专属风格档案"

### Story 1.4: Token Management & Session Persistence

As a **returning user**,
I want my login session to persist across app restarts,
So that I don't need to log in every time I open the app.

**Acceptance Criteria:**

**Given** I previously logged in and have valid tokens in expo-secure-store
**When** I open the app
**Then** authStore checks for stored access token
**And** if token is valid (not expired), I am navigated directly to Home screen
**And** if token is expired but refresh token is valid, access token is refreshed via `/api/v1/auth/refresh`

**Given** access token expires during app usage
**When** an API call returns 401 Unauthorized
**Then** axios interceptor attempts token refresh automatically
**And** if refresh succeeds, the original request is retried
**And** if refresh fails, I am logged out and navigated to welcome screen

**Given** I tap "退出登录" in Profile settings
**When** logout is confirmed
**Then** tokens are removed from expo-secure-store
**And** authStore state is cleared
**And** I am navigated to welcome screen

---

## Epic 2: Camera & Photo Management

**Goal**: Enable users to capture or select clothing photos with camera/album integration, support basic editing (crop, rotate), and upload to Alibaba Cloud OSS with <2 second upload time per NFR-P2.

### Story 2.1: Camera Integration for Photo Capture

As a **user**,
I want to use my phone's camera to photograph clothing items,
So that I can quickly generate outfit recommendations.

**Acceptance Criteria:**

**Given** I am on the Home screen (HTML: `01-home/home-page.html`)
**When** I tap the "拍照" button (purple gradient, prominent)
**Then** camera permission is requested if not yet granted (NFR: FR58)
**And** permission dialog shows: "搭理需要访问相机以拍摄衣服照片"

**Given** camera permission is granted
**When** the camera opens
**Then** I see real-time camera preview (expo-camera component)
**And** I see a capture button at the bottom center
**And** I see a cancel button at top left
**And** camera response time is <500ms per NFR-P5

**Given** camera preview is active
**When** I tap the capture button
**Then** photo is taken and preview screen appears
**And** I see the captured photo with options:
  - "重拍" (retake)
  - "使用照片" (use photo)

**Given** I tap "使用照片"
**When** photo is confirmed
**Then** I am navigated to occasion selector screen
**And** photo is temporarily stored in local cache

**Given** camera permission is denied
**When** I tap "拍照" again
**Then** I see friendly prompt: "需要相机权限才能拍照，请前往设置开启"
**And** "从相册选择" option is highlighted as alternative

### Story 2.2: Photo Album Selection & Editing

As a **user**,
I want to select existing photos from my album and crop them,
So that I can use previously taken photos of my clothing.

**Acceptance Criteria:**

**Given** I am on the Home screen
**When** I tap "从相册选择" button
**Then** photo library permission is requested if not granted (FR59)
**And** permission dialog shows: "搭理需要访问相册以选择衣服照片"

**Given** photo library permission is granted
**When** photo picker opens
**Then** I see my photo library (expo-image-picker component)
**And** I can browse and select a single photo

**Given** I select a photo from album
**When** the photo is selected
**Then** I see a crop/edit screen with:
  - Photo preview
  - Crop handles (adjustable rectangle)
  - Rotate button (90° clockwise rotation)
  - "完成" confirmation button

**Given** I adjust crop area and rotation
**When** I tap "完成"
**Then** photo is cropped/rotated using expo-image-manipulator (FR11, FR12)
**And** I am navigated to occasion selector screen
**And** edited photo is temporarily cached

**Given** photo library permission is denied
**When** I tap "从相册选择" again
**Then** I see prompt: "需要相册权限才能选择照片，请前往设置开启"
**And** "拍照" option remains available

### Story 2.3: Photo Upload to Cloud Storage

As a **developer**,
I want to upload user photos to Alibaba Cloud OSS with signed URLs,
So that photos are securely stored and accessible for AI processing.

**Acceptance Criteria:**

**Given** user has selected/captured a photo
**When** occasion is confirmed and "生成搭配" is tapped
**Then** mobile app requests signed upload URL from backend `/api/v1/upload/signed-url`
**And** backend returns OSS signed URL (expiry: 10 minutes)

**Given** signed URL is received
**When** photo upload starts
**Then** photo is compressed to max 500KB (maintain aspect ratio)
**And** upload to OSS begins with progress indicator
**And** upload completes in <2 seconds on 4G network per NFR-P2

**Given** upload succeeds
**When** OSS returns photo URL
**Then** photo URL is stored locally and sent to AI generation API
**And** user sees AI loading screen (skeleton + progress animation)

**Given** upload fails (network timeout, OSS error)
**When** error occurs
**Then** auto-retry mechanism attempts 3 times with exponential backoff (NFR-R10)
**And** if all retries fail, show friendly error: "上传失败，请检查网络后重试"
**And** provide "重试" button

**Given** photo is successfully uploaded
**When** AI processing is complete
**Then** photo is encrypted with AES-256 in OSS storage per NFR-S2

---

## Epic 3: AI Outfit Generation Engine

**Goal**: Integrate Alibaba Vision API for garment recognition, implement AI orchestrator to generate 3 outfit recommendations within 5 seconds (NFR-P1), display results with skeleton loading UX, and support 6 occasion types with >75% recommendation accuracy (NFR-AI2).

### Story 3.1: AI Image Recognition Integration

As a **system**,
I want to use Alibaba Cloud Vision API to identify garment type, color, and style,
So that outfit recommendations are based on accurate clothing attributes.

**Acceptance Criteria:**

**Given** user photo is uploaded to OSS
**When** backend receives photo URL
**Then** Vision API is called via `app/integrations/alibaba_vision.py`
**And** API request includes: image URL, detection types (garment classification, color extraction, style analysis)

**Given** Vision API responds successfully
**When** response is parsed
**Then** extracted attributes include:
  - Garment type: 上衣 | 裤子 | 裙子 | 外套 | 配饰 (FR13)
  - Primary colors: array of hex colors (FR14)
  - Style tags: 简约 | 时尚 | 休闲 | 正式 etc. (FR15)
**And** recognition accuracy is >90% per NFR-AI1

**Given** recognition succeeds
**When** attributes are stored
**Then** garment data is saved to `outfit_items` table with fields:
  - `garment_type`, `primary_colors` (JSON array), `style_tags` (JSON array)
  - `image_url` (OSS path)
  - `user_id` (foreign key)

**Given** recognition fails (unclear image, API error)
**When** error occurs
**Then** friendly error is returned to mobile: "抱歉，我没看清这件衣服，能换个角度再拍一张吗？"
**And** user can retake/reselect photo
**And** failure rate is <5% per NFR-AI4

### Story 3.2: Occasion-Based Recommendation Engine

As a **user**,
I want to select an occasion (e.g., romantic date, business meeting) and receive 3 tailored outfit recommendations,
So that the AI provides contextually appropriate styling suggestions.

**Acceptance Criteria:**

**Given** photo recognition is complete
**When** I see the occasion selector modal (HTML: `07-flow-pages/occasion-selector.html`)
**Then** I see 6 occasion options as icon cards:
  - 浪漫约会 💕 (Romantic Date)
  - 商务会议 💼 (Business Meeting)
  - 职场通勤 🏢 (Workplace Commute)
  - 朋友聚会 🎉 (Friend Gathering)
  - 日常出行 ☕ (Daily Casual)
  - 居家休闲 🏠 (Home Leisure)

**Given** occasion options are displayed
**When** backend analyzes context (time of day, weather via location)
**Then** a default occasion is suggested and highlighted (e.g., weekday morning → 职场通勤)
**And** I can override by tapping a different occasion

**Given** I select an occasion and tap "生成搭配"
**When** AI generation starts
**Then** backend calls `app/services/ai_orchestrator.py` with inputs:
  - Garment attributes (type, colors, style)
  - User preferences (body type, style preferences from onboarding)
  - Selected occasion
  - Weather data (temperature, conditions via FR56-57)

**Given** AI orchestrator processes the request
**When** recommendation logic runs
**Then** 3 outfit combinations are generated using:
  - Rule engine baseline (500 expert-annotated outfit examples)
  - GPT-4 / Tongyi Qianwen API for creative variations
  - Personalization layer based on user's past likes/saves (FR27)
**And** total generation time is <5 seconds per NFR-P1

### Story 3.3: AI Generation Loading Experience (Skeleton + Progress)

As a **user**,
I want to see an engaging loading animation during the 5-second AI generation,
So that the wait feels purposeful and doesn't cause anxiety.

**Acceptance Criteria:**

**Given** I tap "生成搭配" after selecting occasion
**When** AI generation starts
**Then** I am navigated to loading screen (HTML: `07-flow-pages/ai-loading.html`)
**And** I see:
  - 紫色极光渐变背景 (Purple mesh gradient per UX spec)
  - 3 outfit card skeletons with pulsing shimmer animation (1.5s cycle, opacity 0.3 → 0.7)
  - Progress bar or circular progress (0% → 100% over 5 seconds)
  - Rotating text messages every 1.5 seconds:
    1. "AI 正在为你挑选最佳搭配..."
    2. "分析配色原理中..."
    3. "匹配你的风格偏好..."
    4. "马上就好，请稍等~"

**Given** skeleton screen is showing
**When** first outfit completes generation (progressive loading)
**Then** first skeleton is replaced with actual outfit card
**And** other 2 skeletons continue pulsing

**Given** all 3 outfits are generated
**When** 5-second generation completes
**Then** loading screen transitions to results screen with slide-up animation
**And** skeleton loader completes (SkeletonLoader component)

**Given** AI generation fails or times out (>8 seconds)
**When** error occurs
**Then** fallback rule engine generates basic outfits
**And** message shows: "AI 正在学习你的风格，多点几次赞会更准确哦！"
**And** degraded experience still delivers 3 outfit options

### Story 3.4: Outfit Results Display with Theory Visualization

As a **user**,
I want to see 3 generated outfit recommendations with visual styling and professional theory explanations,
So that I understand why each outfit works and can learn styling principles.

**Acceptance Criteria:**

**Given** AI generation is complete
**When** results screen loads (HTML: `02-outfit-results/outfit-results-page.html`)
**Then** I see 3 outfit cards displayed vertically with:
  - High-resolution product images for each recommended item (top, bottom, accessory)
  - Outfit name (e.g., "职场优雅风")
  - Style tags (简约, 通勤) rendered as StyleTagChip components
  - Like count + heart icon for liking (FR25)
  - Save icon for favoriting (FR26)

**Given** I see the outfit cards
**When** I swipe left/right or tap a card
**Then** card enlarges slightly (scale 1.02) with subtle shadow
**And** I can navigate between the 3 outfits

**Given** I tap an outfit card
**When** detail view opens (HTML: `03-outfit-detail/outfit-detail-page.html`)
**Then** I see expanded view with:
  - **配色理论可视化** (TheoryVisualization component):
    - SVG color wheel highlighting complementary colors (FR32)
    - Color palette cards extracted from outfit (FR28)
  - **理论解析文案** (150-200 characters):
    - Example: "米色 + 黑白配色营造通勤专业感，阔腿裤拉长腿部线条" (FR30)
  - **风格分析标签** (FR29, FR33):
    - Style: 简约通勤
    - Occasion: 职场会议
    - Color principle: 对比色搭配
    - Body optimization: 拉长腿部线条 (personalized based on user body type FR21)

**Given** theory explanation is displayed
**When** I read it
**Then** text is friendly and approachable ("闺蜜的解释" style per UX spec)
**And** >80% of users find it "helpful" per NFR-AI3

### Story 3.5: Outfit Feedback (Like & Save)

As a **user**,
I want to like and save outfit recommendations,
So that AI learns my preferences and I can revisit favorite outfits later.

**Acceptance Criteria:**

**Given** I am viewing an outfit card
**When** I double-tap the card
**Then** heart icon animates (scale 1.3 + particles) per UX animation spec
**And** like is recorded in backend via `/api/v1/outfits/:id/like`
**And** Haptic feedback (light) is triggered
**And** outfit is auto-saved to my history with `is_liked: true` (FR35)

**Given** I long-press an outfit card
**When** long-press is detected
**Then** save icon fills with yellow color + rotation animation
**And** outfit is marked as favorited via `/api/v1/outfits/:id/save`
**And** Toast shows: "已收藏" (2-second auto-dismiss)
**And** Haptic feedback (medium) is triggered

**Given** I like or save an outfit
**When** feedback is recorded
**Then** AI learning service logs preference (garment type, colors, style tags, occasion)
**And** future recommendations incorporate this preference (FR27)
**And** recommendation accuracy improves >15% after 10 likes per NFR-AI5

**Given** I tap unlike/unsave
**When** action is confirmed
**Then** icon returns to outline state
**And** backend updates `is_liked: false` or `is_favorited: false`

---

## Epic 4: Theory & Knowledge Display

**Goal**: 为用户展示专业的配色理论、风格分析和搭配依据，帮助用户理解"为什么这样搭配好看"，实现知识赋能而非仅提供结果。

**FRs Covered**: FR28-FR34
**NFRs Relevant**: NFR-AI3 (理论解析有用性 > 80%)
**HTML Prototypes**: `03-outfit-detail/outfit-detail-page.html`

### Story 4.1: Color Theory Visualization Component

As a **用户**（查看搭配方案详情的用户），
I want 看到直观的配色原理可视化（色轮 + 配色卡片），
So that 我能理解这套搭配的配色逻辑，学习配色知识。

**Acceptance Criteria:**

**Given** 我在搭配方案详情页（HTML: `03-outfit-detail/outfit-detail-page.html`）
**When** 页面加载完成
**Then** 我看到 **TheoryVisualization** 组件渲染在方案图片下方
**And** 组件包含两个子区域：色轮可视化区域（SVG 色轮）和配色卡片区域（提取的颜色方块）

**Given** 色轮可视化区域已渲染
**When** 我查看色轮
**Then** 色轮使用 `react-native-svg` 绘制（Architecture 要求）
**And** 色轮显示 12 色相环（红、橙、黄、绿、青、蓝、紫及中间色）
**And** 当前搭配使用的颜色在色轮上高亮标注（圆点标记 + 连线）
**And** 如果使用补色配色，显示对角连线；如果是邻近色，显示相邻弧线

**Given** 配色卡片区域已渲染
**When** 我查看配色卡片
**Then** 显示 3-5 个颜色方块，按服装单品顺序排列（上衣、下装、配饰）
**And** 每个颜色方块显示：颜色色块（16×16pt 圆角矩形）、颜色名称（中文，如"米色"、"黑色"）、Hex 色值（可选显示，如 #F5F5DC）
**And** 配色卡片使用 iOS 系统灰阶背景（`#F2F2F7`）和白色卡片容器

**Given** TheoryVisualization 组件需要颜色数据
**When** 组件从 API 接收 outfit 数据
**Then** outfit 数据包含 `theory` 对象：
```json
{
  "theory": {
    "colors": [
      { "hex": "#F5F5DC", "name": "米色", "category": "上衣" },
      { "hex": "#000000", "name": "黑色", "category": "裤子" }
    ],
    "colorPrinciple": "对比色搭配"
  }
}
```
**And** 颜色数据来自后端 AI 生成（Epic 3 Story 3.1-3.2 已完成的 Vision API 识别）

**Given** 用户点击色轮或配色卡片
**When** 交互触发
**Then** 轻微放大动画（scale 1.05, 200ms ease-out）
**And** 显示配色原理 Tooltip（如"补色搭配：对比鲜明，视觉冲击强"）

**Given** 理论可视化组件已实现
**When** 产品经理/设计师审阅
**Then** 组件精确匹配 HTML 原型 `outfit-detail-page.html` 中的配色理论区域
**And** 所有颜色、字体、间距符合 UX Design Specification（SF Pro 字体，8px spacing system）

### Story 4.2: Style Tag and Occasion Icon Display

As a **用户**（查看搭配方案的用户），
I want 看到清晰的风格标签和场合图标，
So that 我能快速识别这套搭配的风格定位和适用场合。

**Acceptance Criteria:**

**Given** 我在搭配方案卡片或详情页
**When** 页面渲染搭配信息
**Then** 我看到 **StyleTagChip** 组件显示在搭配名称下方
**And** 我看到场合图标显示在风格标签旁边

**Given** StyleTagChip 组件已渲染
**When** 我查看风格标签
**Then** 风格标签以 Chip 形式展示（圆角胶囊状，HTML: `outfit-results-page.html` 中的设计）
**And** 每个 Chip 包含：背景色 `rgba(108, 99, 255, 0.1)`（淡紫色半透明）、文字颜色 `#6C63FF`（Primary Purple）、内边距 `4px 12px`、圆角 `12px`、字体 SF Pro Text, 13pt, Medium (500)
**And** 显示 1-3 个风格标签（如"简约"、"通勤"、"知性"）

**Given** 风格标签数据来自后端
**When** API 返回 outfit 数据
**Then** 数据包含 `theory.styleTags` 数组：
```json
{
  "theory": {
    "styleTags": ["简约", "通勤", "知性"]
  }
}
```
**And** 标签顺序按相关性排序（主要风格在前）

**Given** 场合图标需要显示
**When** 搭配数据包含 `occasion` 字段
**Then** 根据场合类型显示对应 SF Symbols 图标：浪漫约会 → `heart.fill` 💕、商务会议 → `briefcase.fill` 💼、职场通勤 → `building.2.fill` 🏢、朋友聚会 → `person.3.fill` 🎉、日常出行 → `cup.and.saucer.fill` ☕、居家休闲 → `house.fill` 🏠
**And** 图标大小：20pt × 20pt
**And** 图标颜色：`#6C63FF` (Primary Purple)

**Given** 场合图标在方案详情页
**When** 我查看详情页（HTML: `outfit-detail-page.html`）
**Then** 场合图标显示在"场合适配"区域
**And** 图标旁边显示场合文字标签（如"职场通勤"）
**And** 使用 iOS 系统字体 SF Pro, 15pt, Semibold (600)

**Given** 用户点击风格标签
**When** 点击事件触发
**Then** 标签轻微缩放（scale 0.95, 150ms ease-out）
**And** 可选：显示该风格的简短说明 Tooltip（如"简约：线条简洁，色彩克制"）

**Given** StyleTagChip 组件需要在多处复用
**When** 组件开发完成
**Then** 组件位于 `src/components/outfit/StyleTagChip.tsx`
**And** 接受 props: `tags: string[]`, `variant: 'default' | 'compact'`
**And** 遵循 Architecture naming conventions（PascalCase 组件名）

**Given** 所有标签和图标已实现
**When** 产品/设计审阅
**Then** 精确复刻 HTML 原型中的视觉效果
**And** 支持 Dynamic Type（iOS 辅助功能，字体大小自适应）
**And** VoiceOver 可正确朗读风格和场合信息（NFR-U11 要求）

### Story 4.3: Theory Explanation Text Generation and Display

As a **用户**（学习穿搭知识的用户），
I want 读到友好、专业的搭配理论文案，
So that 我能理解为什么这样搭配好看，学到可复用的搭配原则。

**Acceptance Criteria:**

**Given** 用户在搭配方案详情页（HTML: `outfit-detail-page.html`）
**When** 页面加载完成
**Then** 我看到"搭配解析"区域，包含 150-200 字的理论文案
**And** 文案使用友好的"闺蜜语气"（UX Spec 要求："懂你的 AI 闺蜜"原则）
**And** 文案包含以下要素：配色原理说明（为什么这些颜色搭在一起好看）、风格分析（这套搭配的风格定位）、身材优化建议（基于用户身材类型的个性化建议，FR21）、场合适配说明（为什么适合这个场合）

**Given** 后端需要生成理论文案
**When** AI 生成搭配方案时（Epic 3 Story 3.2）
**Then** 后端调用 Tongyi Qianwen 或 GPT-4 API（Architecture 要求）
**And** API 请求包含以下 context：识别的服装属性（颜色、类型、风格）、用户偏好数据（身材类型、风格偏好、选择的场合）、Prompt 模板要求生成"友好、专业、150-200字"的文案
**And** 生成的文案存储在 `theories` 表（Backend models/theory.py）

**Given** 理论文案已生成
**When** 移动端请求 outfit 详情 API `/api/v1/outfits/:id`
**Then** 响应包含 `theory` 对象：
```json
{
  "theory": {
    "explanation": "米色上衣搭配黑色阔腿裤，运用了经典的中性色对比配色原理。米色温柔知性，黑色利落干练，两者结合营造出职场专业感又不失亲和力。阔腿裤的版型能有效拉长腿部线条，特别适合梨形身材。这套搭配非常适合商务会议或职场通勤场合，既正式又舒适。",
    "colorPrinciple": "对比色搭配",
    "bodyTypeAdvice": "阔腿裤拉长腿部线条",
    "occasionFit": "职场会议、通勤"
  }
}
```

**Given** 理论文案需要在 UI 中展示
**When** 方案详情页加载
**Then** 文案显示在"搭配解析"卡片中
**And** 使用以下样式（精确匹配 HTML 原型）：字体 SF Pro Text, 15pt, Regular (400)、行高 1.5 (22.5pt)、文字颜色 `#1C1C1E` (iOS System Gray 1)、背景白色卡片，圆角 16px，阴影 `0 2px 8px rgba(0,0,0,0.06)`、内边距 20px

**Given** 理论文案可能包含关键词高亮
**When** 文案中包含配色原理或风格术语
**Then** 关键词用紫色高亮（`#6C63FF`，Medium 字重）
**And** 例如："**对比色搭配**"、"**梨形身材**"、"**职场通勤**"

**Given** 用户阅读理论文案
**When** 用户完整阅读后（停留时间 > 5 秒）
**Then** 后端记录 `theory_view_event`（用于 NFR-AI3 有用性分析）
**And** 可选：显示"这个解析有帮助吗？👍 / 👎" 反馈按钮

**Given** 理论文案质量需要符合 NFR-AI3
**When** 产品上线后收集用户反馈
**Then** 目标：>80% 用户反馈"有帮助"
**And** 如果低于目标，后端优化 AI prompt 模板

**Given** 理论文案需要离线可用
**When** outfit 数据同步到 SQLite（Epic 5 离线支持）
**Then** `theory.explanation` 字段存储在本地数据库
**And** 离线状态下用户仍可查看已生成方案的理论解析

**Given** 文案生成失败（AI API 超时或错误）
**When** 后端无法生成理论文案
**Then** 返回备用默认文案："这套搭配结合了你的风格偏好，色彩搭配和谐，适合你选择的场合。"
**And** 记录错误日志用于后续优化

---

## Epic 5: Outfit History & Search

**Goal**: 实现个人穿搭知识库，用户可以离线查看历史搭配，按场合/时间/收藏筛选，自动同步到云端，满足"知识沉淀可见"原则。

**FRs Covered**: FR35-FR42
**NFRs Relevant**: NFR-P7 (查询<200ms), NFR-U6 (离线可用), NFR-U8 (30s自动同步)
**HTML Prototypes**: `04-wardrobe/outfit-page.html`

### Story 5.1: SQLite Local Storage for Outfit History

As a **用户**（生成搭配方案的用户），
I want 我的搭配方案自动保存到手机本地，
So that 我可以在离线状态下查看历史，不依赖网络。

**Acceptance Criteria:**

**Given** 应用初次启动
**When** 应用加载完成
**Then** SQLite 数据库初始化（使用 `expo-sqlite`，Architecture 要求）
**And** 创建 `outfits` 表，schema 如下：
```sql
CREATE TABLE IF NOT EXISTS outfits (
  id TEXT PRIMARY KEY,              -- UUID
  user_id TEXT NOT NULL,            -- 用户 ID
  occasion TEXT NOT NULL,           -- 场合类型
  garment_image_url TEXT NOT NULL,  -- 原始服装照片 URL
  created_at INTEGER NOT NULL,      -- Unix timestamp
  updated_at INTEGER NOT NULL,
  is_liked INTEGER DEFAULT 0,       -- 0 or 1 (布尔值)
  is_favorited INTEGER DEFAULT 0,   -- 0 or 1
  is_deleted INTEGER DEFAULT 0,     -- 软删除标记
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'synced', 'conflict'
  outfit_data TEXT NOT NULL         -- JSON string (完整 outfit 对象)
);
```
**And** 创建索引提升查询性能（NFR-P7 < 200ms）：
```sql
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);
CREATE INDEX IF NOT EXISTS idx_outfits_liked ON outfits(is_liked);
```

**Given** 用户生成了新搭配（Epic 3 Story 3.4 完成）
**When** AI 生成结果返回到移动端
**Then** outfit 数据自动保存到 SQLite `outfits` 表
**And** `outfit_data` 字段存储完整 JSON（包含 items, theory, images）
**And** `sync_status` 初始值为 `'pending'`
**And** 保存操作在后台线程执行，不阻塞 UI

**Given** 用户点赞或收藏搭配（Epic 3 Story 3.5）
**When** 点赞/收藏操作完成
**Then** SQLite 更新对应记录的 `is_liked` 或 `is_favorited` 字段
**And** `sync_status` 更新为 `'pending'`（等待同步到云端）
**And** `updated_at` 字段更新为当前时间戳

**Given** SQLite 数据库需要被服务层访问
**When** 开发者实现数据访问
**Then** 创建 `src/utils/storage.ts` 工具文件
**And** 导出以下函数：`saveOutfit(outfit: Outfit): Promise<void>`, `getOutfits(filters?: OutfitFilters): Promise<Outfit[]>`, `updateOutfit(id: string, updates: Partial<Outfit>): Promise<void>`, `deleteOutfit(id: string): Promise<void>` (软删除，设置 `is_deleted = 1`)
**And** 所有函数使用 async/await，遵循 Architecture TypeScript 规范

**Given** 查询历史搭配需要满足性能要求
**When** 用户查询历史列表
**Then** SQLite 查询在 <200ms 内完成（NFR-P7）
**And** 默认查询限制为 50 条记录（分页加载）
**And** 使用索引优化查询（`idx_outfits_created_at`）

**Given** 用户离线时操作搭配
**When** 用户点赞、收藏或删除
**Then** 操作立即在 SQLite 中生效
**And** 离线队列记录操作（待网络恢复后同步）
**And** UI 立即反馈操作结果（无需等待网络）

**Given** 数据库需要升级（未来版本添加字段）
**When** 应用更新
**Then** 使用 `expo-sqlite` 的 migration 机制
**And** 版本号在 `storage.ts` 中管理（`const DB_VERSION = 1`）

**Given** 开发者需要测试 SQLite 功能
**When** 运行测试
**Then** 使用内存数据库（`:memory:`）进行单元测试
**And** 测试覆盖 CRUD 操作和索引查询

### Story 5.2: Outfit History Grid View

As a **用户**（查看历史搭配的用户），
I want 看到所有历史搭配以网格形式展示，
So that 我可以快速浏览和选择搭配。

**Acceptance Criteria:**

**Given** 用户打开"搭配"Tab（HTML: `04-wardrobe/outfit-page.html`）
**When** 页面加载
**Then** 我看到紫色渐变头部（与首页一致）
**And** 头部显示"我的搭配"标题（28pt, Semibold）
**And** 头部右上角显示搜索图标（`magnifyingglass` SF Symbol）

**Given** 历史搭配列表需要展示
**When** 从 SQLite 查询到搭配数据
**Then** 搭配以 **2 列网格布局**显示（精确匹配 HTML 原型）
**And** 每列宽度：`(screenWidth - 48px) / 2`（左右各 20px padding，中间 12px gap）
**And** 卡片纵向间距：12px

**Given** 单个搭配卡片需要渲染
**When** 卡片显示在网格中
**Then** 卡片包含以下元素（复刻 HTML `outfit-card` 样式）：搭配预览图（宽高比 3:4，圆角 12px，显示 3 个服装单品的组合缩略图或 AI 生成的完整搭配图）、搭配信息栏（预览图下方，10px padding，风格标签如"简约风" 13pt Medium + 日期标签如"今天" 11pt Regular 灰色）、操作图标（右上角浮动，点赞图标心形已点赞显示填充红色 `#FF6B9D` + 收藏图标星形已收藏显示填充黄色 `#FF9500`）

**Given** 搭配预览图需要优化加载
**When** 列表滚动
**Then** 使用懒加载（React Query 的 `useInfiniteQuery`）
**And** 首屏加载 20 条记录
**And** 滚动到底部时自动加载下 20 条
**And** 图片使用缓存（Expo Image 自动缓存）

**Given** 用户点击搭配卡片
**When** 点击事件触发
**Then** 导航到搭配详情页（`/outfit/[id]`，Epic 4 已实现）
**And** 使用 Expo Router 的 `push` 导航
**And** 卡片有 press 动画（scale 0.98, 150ms）

**Given** 历史列表为空（新用户）
**When** 查询结果为空
**Then** 显示空状态（参考首页空状态设计）：图标衣服图标（紫色圆形背景）、文案"还没有搭配记录"、副文案"去首页拍照生成你的第一套搭配吧"、按钮"开始搭配"（跳转到首页）

**Given** 列表需要下拉刷新
**When** 用户下拉列表
**Then** 触发 `RefreshControl` 刷新动画
**And** 从 SQLite 重新查询最新数据
**And** 刷新完成后隐藏加载指示器

**Given** 数据从 SQLite 查询
**When** `useOutfits` hook 调用
**Then** hook 定义在 `src/hooks/useOutfits.ts`：
```typescript
export function useOutfits(filters?: OutfitFilters) {
  return useQuery({
    queryKey: ['outfits', 'local', filters],
    queryFn: () => storage.getOutfits(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}
```
**And** 遵循 Architecture 的 React Query 模式

**Given** 网格布局需要响应式适配
**When** 屏幕尺寸变化（iPhone SE 到 Pro Max）
**Then** 始终保持 2 列布局
**And** 卡片宽度自动计算
**And** 最小卡片宽度：150px（防止过窄）

### Story 5.3: Filter by Occasion, Time, and Favorites

As a **用户**（管理大量搭配的用户），
I want 按场合、时间、收藏状态筛选搭配，
So that 我能快速找到特定场景的搭配方案。

**Acceptance Criteria:**

**Given** 用户在搭配列表页
**When** 页面头部下方显示筛选栏
**Then** 我看到 3 个筛选按钮（横向排列）：场合筛选（默认选中"全部"）、时间筛选（默认选中"全部时间"）、收藏筛选（仅收藏/仅点赞 toggle）
**And** 筛选栏背景白色，圆角 16px，顶部 margin 12px

**Given** 用户点击"场合筛选"按钮
**When** 点击触发
**Then** 从底部弹出 Bottom Sheet（iOS 原生样式）
**And** Bottom Sheet 显示 7 个场合选项（6 个场合 + "全部"）：全部（默认选中）、浪漫约会 💕、商务会议 💼、职场通勤 🏢、朋友聚会 🎉、日常出行 ☕、居家休闲 🏠
**And** 选中的场合高亮显示（紫色背景 `#6C63FF`，白色文字）

**Given** 用户选择某个场合
**When** 选择确认
**Then** Bottom Sheet 关闭
**And** 列表自动刷新，仅显示该场合的搭配
**And** SQLite 查询添加 `WHERE occasion = ?` 条件
**And** 查询响应时间 <200ms（NFR-P7，使用 `idx_outfits_occasion` 索引）

**Given** 用户点击"时间筛选"按钮
**When** 点击触发
**Then** 弹出时间选项 Bottom Sheet：全部时间（默认）、最近 7 天、最近 30 天、最近 3 个月
**And** 选中的时间范围高亮显示

**Given** 用户选择时间范围
**When** 选择"最近 7 天"
**Then** 列表刷新，仅显示 7 天内创建的搭配
**And** SQLite 查询添加 `WHERE created_at >= ?` 参数为 `Date.now() - 7 * 24 * 60 * 60 * 1000`
**And** 使用 `idx_outfits_created_at` 索引优化查询

**Given** 用户点击"收藏筛选"toggle
**When** toggle 切换到"仅收藏"
**Then** 列表仅显示 `is_favorited = 1` 的搭配
**And** 筛选按钮背景变为黄色 `#FF9500`（收藏高亮色）
**When** toggle 切换到"仅点赞"
**Then** 列表仅显示 `is_liked = 1` 的搭配
**And** 筛选按钮背景变为粉色 `#FF6B9D`（点赞高亮色）
**When** toggle 关闭
**Then** 显示所有搭配（移除 liked/favorited 筛选）

**Given** 多个筛选条件可以组合
**When** 用户选择"职场通勤" + "最近 7 天" + "仅收藏"
**Then** SQLite 查询组合所有条件：
```sql
SELECT * FROM outfits
WHERE user_id = ?
  AND occasion = '职场通勤'
  AND created_at >= ?
  AND is_favorited = 1
  AND is_deleted = 0
ORDER BY created_at DESC
LIMIT 50;
```
**And** 查询响应 <200ms

**Given** 筛选状态需要持久化
**When** 用户离开搭配列表页
**Then** 筛选条件保存在 Zustand store（`userStore.outfitFilters`）
**When** 用户返回搭配列表页
**Then** 自动应用之前的筛选条件

**Given** 当前筛选结果为空
**When** 查询无结果
**Then** 显示空状态提示："没有找到符合条件的搭配"、"试试调整筛选条件"、按钮"清除筛选"（重置所有筛选）

**Given** 用户长按搭配卡片
**When** 长按 > 500ms
**Then** 弹出操作菜单（iOS Action Sheet）：删除（红色，危险操作）、分享（跳转到 Epic 6 分享功能）、取消
**And** 选择"删除"后软删除（`is_deleted = 1`）
**And** UI 立即移除卡片，带淡出动画

### Story 5.4: Cloud Sync Service (Last-Write-Wins Strategy)

As a **用户**（使用多设备的用户），
I want 我的搭配自动同步到云端，
So that 我可以在其他设备上访问我的搭配历史。

**Acceptance Criteria:**

**Given** 应用启动时已登录
**When** 网络连接可用
**Then** 自动触发同步服务（`src/services/sync.ts`）
**And** 同步服务检查 SQLite 中 `sync_status = 'pending'` 的记录
**And** 批量上传到后端 `/api/v1/outfits/sync` 端点

**Given** 同步服务上传本地更改
**When** 调用 `/api/v1/outfits/sync` API
**Then** 请求 body 包含 `sync_status = 'pending'` 的所有 outfit 数据：
```json
{
  "outfits": [
    {
      "id": "uuid",
      "occasion": "职场通勤",
      "is_liked": 1,
      "updated_at": 1704326400000,
      "outfit_data": "{...}"
    }
  ]
}
```
**And** 后端使用 **Last-Write-Wins** 策略（Architecture 要求）
**And** 比较 `updated_at` 时间戳，最新的覆盖旧的

**Given** 后端同步成功
**When** API 返回 200 状态码
**Then** SQLite 更新对应记录的 `sync_status = 'synced'`
**And** 记录同步完成日志

**Given** 同步时发生冲突
**When** 服务器数据的 `updated_at` 比本地新
**Then** 服务器数据覆盖本地数据（Last-Write-Wins）
**And** SQLite 更新为服务器版本
**And** 记录冲突日志（可选：通知用户"部分数据已从云端更新"）

**Given** 用户从离线恢复到在线
**When** 网络状态从 offline 变为 online
**Then** 30 秒内自动触发同步（NFR-U8）
**And** 使用 `NetInfo` 监听网络状态变化（`@react-native-community/netinfo`）
**And** 同步完成后显示 Toast："已同步 N 条搭配"

**Given** 同步服务需要后台执行
**When** 用户在应用前台
**Then** 同步每隔 5 分钟自动触发（轮询）
**When** 用户切换到后台
**Then** 使用 Expo Background Fetch 在后台同步（iOS 限制）
**And** 后台同步频率：最多每 15 分钟一次

**Given** 同步失败（网络错误、API 超时）
**When** 同步请求失败
**Then** 使用指数退避重试策略（Architecture NFR-R10）：第 1 次重试 1 秒后、第 2 次重试 2 秒后、第 3 次重试 4 秒后
**And** 3 次重试后仍失败，则 `sync_status` 保持 `'pending'`
**And** 下次网络恢复或应用重启时重新尝试

**Given** 用户首次登录新设备
**When** 登录成功
**Then** 自动从后端下载所有历史搭配
**And** 调用 `/api/v1/outfits?user_id=xxx` 获取完整列表
**And** 批量插入到 SQLite（`sync_status = 'synced'`）
**And** 显示加载进度："正在同步搭配历史...N/M"

**Given** 后端 API `/api/v1/outfits/sync` 需要实现
**When** 后端开发此端点
**Then** 端点定义在 `app/api/v1/outfits.py`
**And** 使用 SQLAlchemy 批量 upsert（`ON CONFLICT DO UPDATE`）
**And** 返回同步成功的记录 ID 列表

**Given** 同步冲突记录需要审计
**When** Last-Write-Wins 覆盖数据
**Then** 后端记录冲突日志到 `sync_conflicts` 表（可选）：
```sql
CREATE TABLE sync_conflicts (
  id SERIAL PRIMARY KEY,
  outfit_id TEXT,
  user_id TEXT,
  conflict_time TIMESTAMP,
  local_version JSONB,
  server_version JSONB
);
```
**And** 用于未来分析和优化同步策略

**Given** 用户可以查看同步状态
**When** 用户进入设置页
**Then** 显示"上次同步时间"和"待同步数量"
**And** 提供"立即同步"按钮手动触发同步

**Given** 离线操作的数据完整性
**When** 用户删除搭配后离线
**Then** SQLite 软删除（`is_deleted = 1`）
**And** 同步时上传删除操作
**And** 后端对应记录也标记为 `is_deleted = true`（软删除）

---

## Epic 6: Sharing & Social Integration

**Goal**: 实现一键分享功能，用户可以生成精美的分享图片（3种模板风格），分享到微信等社交平台，并追踪分享行为以验证"啊哈时刻"（30% 7日分享率）。

**FRs Covered**: FR43-FR49
**Success Metrics**: 30% 用户在注册后 7 天内分享（PRD 啊哈时刻指标）
**HTML Prototypes**: `08-share/share-templates.html`

### Story 6.1: ShareTemplate Component (3 Styles)

As a **用户**（想分享搭配的用户），
I want 选择不同风格的分享图片模板，
So that 我可以生成符合个人审美的分享图片。

**Acceptance Criteria:**

**Given** 用户在搭配详情页
**When** 用户点击"分享"按钮
**Then** 从底部弹出分享模板选择器（Bottom Sheet，HTML: `08-share/share-templates.html`）
**And** Bottom Sheet 高度：屏幕高度的 75%
**And** 顶部显示标题"选择分享模板"（20pt, Semibold）

**Given** 分享模板选择器已打开
**When** 模板列表渲染
**Then** 我看到 **3 个模板预览卡片**（横向滑动）：简约模板（Minimalist）、时尚模板（Trendy）、文艺模板（Artistic）
**And** 每个卡片显示该模板的实时预览（使用当前搭配数据渲染）
**And** 卡片尺寸：320×480pt（9:16 竖版比例，适配社交平台）

**Given** 简约模板设计规范
**When** 简约模板渲染
**Then** 模板包含以下元素：背景纯白色 `#FFFFFF`、搭配图片居中显示宽度 90% 圆角 16px 轻微阴影、风格标签图片下方紫色 Chip（复用 StyleTagChip 组件）、搭配解析文案 1-2 句关键理论（不超过 50 字）、App 水印底部右下角"搭理 logo + 搭理 AI 穿搭顾问"文字（12pt 灰色）、二维码底部左下角 40×40pt（可选，链接到 app 下载页）
**And** 整体风格：简洁、留白充足、黑白灰配色

**Given** 时尚模板设计规范
**When** 时尚模板渲染
**Then** 模板包含以下元素：背景紫色渐变（`#6C63FF` → `#9D94FF`）、搭配图片稍微倾斜 3° 增加动感白色边框 8px、风格标签图片左上角浮动白色背景半透明、理论亮点图片下方白色文字大字号（18pt Bold）、装饰元素星星爱心等 SF Symbols 图标点缀、App 水印底部居中白色文字 + logo
**And** 整体风格：活泼、色彩鲜明、年轻化

**Given** 文艺模板设计规范
**When** 文艺模板渲染
**Then** 模板包含以下元素：背景米色纸张纹理（`#F5F5DC`）、搭配图片拍立得相框样式白色边框 20px 底部留白大（签名感）、手写字体标题搭配名称用手写风格字体（可用 custom font）、理论文案文艺语气的短句（如"简约是永恒的优雅"）、复古装饰纸张边缘磨损效果复古邮票图标、App 水印底部印章样式（圆形 logo + 文字）
**And** 整体风格：复古、文艺、有质感

**Given** 用户可以切换模板预览
**When** 用户左右滑动
**Then** 切换到不同模板的预览
**And** 当前选中的模板有紫色边框高亮（4px solid `#6C63FF`）
**And** 模板名称显示在预览卡片下方

**Given** ShareTemplate 组件需要实现
**When** 开发者创建组件
**Then** 组件位于 `src/components/share/ShareTemplate.tsx`
**And** 组件接受 props：
```typescript
interface ShareTemplateProps {
  outfit: Outfit;          // 完整搭配数据
  style: 'minimalist' | 'trendy' | 'artistic';
  size: { width: number; height: number };
}
```
**And** 组件使用 `react-native-view-shot` 库截图生成图片

**Given** 模板需要实时渲染当前搭配
**When** 用户选择不同搭配分享
**Then** 模板自动填充当前搭配的图片、文案、风格标签
**And** 渲染性能 <500ms（流畅体验）

**Given** 用户选择模板后
**When** 用户点击"生成分享图"按钮
**Then** Bottom Sheet 关闭
**And** 进入 Story 6.2（图片生成流程）

### Story 6.2: Share Image Generation with Watermark

As a **用户**（生成分享图片的用户），
I want 快速生成高质量的分享图片，
So that 我可以直接保存到相册或分享到社交平台。

**Acceptance Criteria:**

**Given** 用户在 Story 6.1 选择了模板
**When** 用户点击"生成分享图"
**Then** 显示生成中加载动画（紫色 spinner + "正在生成精美分享图..."）
**And** 加载时间目标 <2 秒

**Given** ShareTemplate 组件需要截图为图片
**When** 调用截图函数
**Then** 使用 `react-native-view-shot` 的 `captureRef` API：
```typescript
import { captureRef } from 'react-native-view-shot';

const uri = await captureRef(templateRef, {
  format: 'png',
  quality: 1.0,
  width: 1080,   // 高清分辨率（适配社交平台）
  height: 1920,  // 9:16 比例
});
```
**And** 生成的图片保存到临时目录（`FileSystem.cacheDirectory`）

**Given** 图片需要包含 App 水印
**When** 模板渲染时
**Then** 水印已内嵌在模板中（Story 6.1 设计）
**And** 水印包含：搭理 logo（24×24pt PNG 透明背景）、文案"搭理 AI 穿搭顾问"（12pt SF Pro 灰色 `#8E8E93`）、可选小程序码或 App 下载二维码（40×40pt）
**And** 水印不可被用户移除（防止品牌传播丢失）

**Given** 图片生成成功
**When** 截图完成
**Then** 显示分享预览屏幕
**And** 屏幕包含：预览图（生成的分享图片可缩放查看）、操作按钮（底部工具栏）"保存到相册"（下载图标）+"分享到..."（分享图标跳转 Story 6.3）+"重新生成"（刷新图标返回模板选择）
**And** 按钮使用毛玻璃背景（Glassmorphism，UX Spec）

**Given** 用户点击"保存到相册"
**When** 点击触发
**Then** 请求照片库写入权限（如果未授权）
**And** 使用 `expo-media-library` 保存图片：
```typescript
import * as MediaLibrary from 'expo-media-library';

const { status } = await MediaLibrary.requestPermissionsAsync();
if (status === 'granted') {
  await MediaLibrary.saveToLibraryAsync(uri);
}
```
**And** 保存成功后显示 Toast："已保存到相册"
**And** 触发 Haptic 反馈（medium）

**Given** 图片生成失败（内存不足、权限被拒）
**When** 截图或保存失败
**Then** 显示友好错误提示：权限被拒"需要相册权限才能保存，请前往设置开启"、截图失败"生成失败，请重试"
**And** 提供"重试"按钮

**Given** 图片质量需要优化
**When** 图片用于社交平台分享
**Then** 图片分辨率：1080×1920px（高清）
**And** 图片格式：PNG（支持透明度，质量最佳）
**And** 文件大小：<2MB（确保分享速度）

**Given** 后端需要追踪图片生成事件
**When** 图片生成成功
**Then** 调用 `/api/v1/share/track` 记录事件：
```json
{
  "event_type": "share_image_generated",
  "outfit_id": "uuid",
  "template_style": "minimalist",
  "timestamp": 1704326400000
}
```
**And** 用于分析用户最喜欢的模板风格

**Given** 分享图片可以重新编辑
**When** 用户点击"重新生成"
**Then** 返回模板选择器（Story 6.1）
**And** 之前选择的模板保持选中状态
**And** 用户可以切换到其他模板重新生成

### Story 6.3: One-Tap Social Platform Sharing and Tracking

As a **用户**（分享到社交平台的用户），
I want 一键分享到微信或其他平台，
So that 我可以快速传播我的搭配，获得朋友认可。

**Acceptance Criteria:**

**Given** 用户在分享预览屏幕（Story 6.2）
**When** 用户点击"分享到..."按钮
**Then** 弹出社交平台选择 Action Sheet（iOS 原生样式）
**And** 显示 3 个选项：微信好友（绿色 WeChat 图标）、微信朋友圈（绿色圆形图标）、更多...（系统分享图标）
**And** 底部显示"取消"按钮

**Given** 用户选择"微信好友"
**When** 点击选项
**Then** 调用微信 SDK 分享图片到好友：
```typescript
import * as WeChat from 'react-native-wechat-lib';

await WeChat.shareImage({
  imageUrl: shareImageUri,
  scene: WeChat.Scene.Session, // 好友会话
});
```
**And** 微信 app 自动打开到好友选择界面
**And** 分享图片附带文案："我用搭理 AI 生成了这套搭配，你觉得怎么样？"（可编辑）

**Given** 用户选择"微信朋友圈"
**When** 点击选项
**Then** 调用微信 SDK 分享到朋友圈：
```typescript
await WeChat.shareImage({
  imageUrl: shareImageUri,
  scene: WeChat.Scene.Timeline, // 朋友圈
});
```
**And** 微信自动打开到朋友圈发布界面
**And** 用户可以在微信中添加文字描述

**Given** 微信未安装
**When** 用户选择微信分享
**Then** 显示提示："您还未安装微信，是否前往下载？"
**And** 提供"前往下载"按钮（跳转到 App Store）
**And** 提供"取消"按钮

**Given** 用户选择"更多..."
**When** 点击选项
**Then** 调用 iOS 原生系统分享菜单：
```typescript
import { Share } from 'react-native';

await Share.share({
  url: shareImageUri,
  message: '我用搭理 AI 生成了这套搭配',
});
```
**And** 支持分享到邮件、信息、AirDrop、小红书、抖音等所有系统支持的应用
**And** 用户可以选择任意已安装的支持图片分享的 app

**Given** 分享行为需要追踪（FR48）
**When** 用户完成分享操作
**Then** 调用后端 `/api/v1/share/track` API：
```json
{
  "event_type": "share_completed",
  "outfit_id": "uuid",
  "platform": "wechat_timeline", // 或 "wechat_session", "system_share"
  "template_style": "minimalist",
  "user_id": "uuid",
  "timestamp": 1704326400000
}
```
**And** 后端存储到 `share_records` 表（Backend models/share_record.py）

**Given** 分享成功后
**When** 用户返回 app
**Then** 显示成功 Toast："分享成功！"
**And** 触发 Haptic 反馈（success）
**And** 可选：显示鼓励弹窗："你的品味真棒！分享给更多朋友吧 ✨"

**Given** 后端需要分析分享数据
**When** `share_records` 表有数据
**Then** 后端提供分析 API `/api/v1/analytics/share-stats`：各平台分享占比（微信好友 vs 朋友圈 vs 系统分享）、用户分享率（7 日内分享用户 / 总注册用户）、最受欢迎的模板风格
**And** 用于验证 PRD 啊哈时刻指标（30% 7日分享率）

**Given** WeChat SDK 需要配置
**When** 项目集成微信 SDK
**Then** 在 `app.json` 中配置 URL Scheme：
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": ["weixin", "weixinULAPI"],
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["wxYOUR_APP_ID"]
          }
        ]
      }
    }
  }
}
```
**And** 在微信开放平台注册应用获取 App ID
**And** 项目依赖安装：`npx expo install react-native-wechat-lib`

**Given** 分享图片包含水印
**When** 用户分享
**Then** 水印清晰可见（Story 6.2 已实现）
**And** 其他用户看到分享图可以识别"搭理 AI"品牌
**And** 水印位置不遮挡核心内容（衣服图片）

**Given** 用户通过系统分享到小红书/抖音
**When** 在系统分享菜单选择小红书或抖音
**Then** 图片和文案自动传递到对应 app
**And** 用户在该 app 中可以继续编辑和发布
**And** 分享追踪记录为 `platform: "system_share"`（无法精确识别最终平台）

---

## Epic 7: Profile & Growth Tracking

**Goal**: 实现个人页和成长追踪功能，用户可以查看风格档案、AI 学习进度、成长轨迹可视化，修改个人偏好设置，满足"知识沉淀可见"和"懂你的 AI 闺蜜"体验原则。

**FRs Covered**: FR6-FR8
**Additional Requirements**: ProgressCircle 组件展示 AI 学习进度、PreferenceCloud 组件展示风格偏好词云、成长轨迹可视化
**HTML Prototypes**: `05-profile/profile-page.html`, `05-profile/settings-page.html`

### Story 7.1: Profile Screen with User Stats

As a **用户**（查看个人信息的用户），
I want 看到我的个人资料和使用统计，
So that 我能了解自己的搭配习惯和成长轨迹。

**Acceptance Criteria:**

**Given** 用户打开"我的"Tab（HTML: `05-profile/profile-page.html`）
**When** 页面加载
**Then** 我看到紫色渐变头部（与首页一致）
**And** 头部显示用户头像（圆形 80pt 直径白色边框 4px）
**And** 头部显示用户昵称（24pt Semibold 白色）
**And** 头部右上角显示设置图标（`gearshape.fill` SF Symbol）

**Given** 用户资料卡片需要展示
**When** 页面渲染
**Then** 头部下方显示白色内容卡片（圆角 24px 上浮布局）
**And** 卡片包含 3 个统计数据（横向排列）：生成次数（图标 ✨ 数字 X 次）、收藏数量（图标 ⭐ 数字 X 个）、分享次数（图标 ↗️ 数字 X 次）
**And** 统计数字使用紫色（`#6C63FF`）大字号（28pt Bold）
**And** 标签文字灰色（`#8E8E93` 13pt Regular）

**Given** 统计数据从后端获取
**When** 调用 `/api/v1/users/me/stats` API
**Then** 响应包含：
```json
{
  "totalOutfits": 45,
  "favoriteCount": 12,
  "shareCount": 8,
  "joinedDays": 15,
  "aiAccuracy": 0.82
}
```
**And** 移动端使用 React Query 缓存数据（staleTime: 5 分钟）

**Given** 快捷功能入口需要展示
**When** 内容卡片下方显示功能列表
**Then** 我看到以下入口（每个入口一行带右箭头 `chevron.right`）：我的收藏（图标星形跳转到收藏列表）、分享记录（图标分享查看分享历史）、风格档案（图标调色板跳转到 Story 7.3）、设置（图标齿轮跳转到设置页）
**And** 每个入口点击有轻微背景色变化（`#F2F2F7` hover 效果）

**Given** 用户点击"设置"
**When** 点击触发
**Then** 导航到设置页（HTML: `05-profile/settings-page.html`）
**And** 设置页包含以下选项：账号安全（修改手机号绑定微信）、隐私设置（数据管理权限管理）、帮助反馈（常见问题问题反馈）、关于我们（版本信息用户协议）、退出登录（红色文字底部）

**Given** 用户点击头像
**When** 点击触发
**Then** 弹出头像编辑选项：从相册选择、拍照、取消
**And** 选择后调用 `/api/v1/users/me/avatar` 上传新头像
**And** 上传成功后更新显示

**Given** 用户昵称可以编辑
**When** 用户点击昵称
**Then** 弹出昵称编辑 Modal
**And** 输入框预填充当前昵称
**And** 限制长度：2-12 个字符
**And** 保存后调用 `/api/v1/users/me` 更新昵称

**Given** 页面需要下拉刷新
**When** 用户下拉
**Then** 触发 `RefreshControl` 刷新统计数据
**And** 重新获取最新 stats 和用户信息

**Given** Profile 页面组件结构
**When** 开发者实现
**Then** 页面位于 `app/(tabs)/profile.tsx`
**And** 使用 `useAuth` hook 获取用户信息
**And** 使用 `useQuery` 获取统计数据

### Story 7.2: ProgressCircle Component (AI Learning Visualization)

As a **用户**（关注 AI 学习进度的用户），
I want 看到 AI 对我风格的理解程度，
So that 我知道 AI 是否越来越"懂我"。

**Acceptance Criteria:**

**Given** 用户在个人页
**When** 页面滚动到"AI 学习进度"区域
**Then** 我看到 **ProgressCircle** 组件（圆环进度条）
**And** 组件位于白色卡片中标题"AI 对你的了解"（18pt Semibold）

**Given** ProgressCircle 组件渲染
**When** 组件加载
**Then** 显示圆环进度可视化：圆环尺寸直径 120pt、圆环粗细 12pt、背景色淡灰色（`#E5E5EA`）、进度色紫色渐变（`#6C63FF` → `#9D94FF`）、进度值中心显示百分比（如 "82%" 32pt Bold 紫色）
**And** 圆环进度从 0% 动画到实际进度（500ms ease-out）

**Given** AI 学习进度计算逻辑
**When** 后端计算进度
**Then** 进度基于以下因素：用户生成搭配次数（权重 30%）、用户点赞/收藏行为数（权重 40% 反馈越多越准）、AI 推荐被接受率（权重 30% 点赞/总生成）
**And** 计算公式：
```
progress = min(100,
  (outfitCount / 20) * 30 +
  (likeCount / 10) * 40 +
  (acceptRate * 100) * 30
)
```
**And** 后端在 `/api/v1/users/me/stats` 中返回 `aiAccuracy` 字段（0-1 范围）

**Given** 进度不同阶段显示不同文案
**When** 进度值在不同区间
**Then** 圆环下方显示对应文案：0-20% "AI 正在学习你的风格..."、21-50% "AI 开始了解你的喜好了"、51-80% "AI 越来越懂你啦"、81-100% "AI 已经很懂你的风格了！"
**And** 文案使用友好语气（"懂你的 AI 闺蜜"原则）

**Given** 用户点击 ProgressCircle
**When** 点击触发
**Then** 弹出详细说明 Modal："如何提升 AI 准确度？"、提示 1"多生成搭配AI 学习更多案例"、提示 2"点赞你喜欢的方案AI 会记住你的偏好"、提示 3"收藏最爱的搭配AI 优先推荐类似风格"
**And** Modal 底部显示"知道了"按钮

**Given** ProgressCircle 组件需要复用
**When** 开发者实现
**Then** 组件位于 `src/components/ui/ProgressCircle.tsx`
**And** 组件接受 props：
```typescript
interface ProgressCircleProps {
  progress: number;        // 0-100
  size: number;            // 圆环直径
  strokeWidth: number;     // 圆环粗细
  color?: string;          // 进度颜色（可选，默认紫色）
  label?: string;          // 中心文字（可选）
}
```
**And** 使用 `react-native-svg` 绘制圆环
**And** 使用 `react-native-reanimated` 实现动画

**Given** 进度数据实时更新
**When** 用户完成新的搭配生成或点赞
**Then** 下次打开个人页时进度自动更新
**And** 如果进度提升 ≥5% 显示庆祝 Toast："你的风格档案更完善了 🎉"

### Story 7.3: PreferenceCloud Component and Edit Preferences

As a **用户**（想修改偏好的用户），
I want 看到我的风格偏好词云并随时修改，
So that AI 推荐能始终符合我当前的审美。

**Acceptance Criteria:**

**Given** 用户在个人页点击"风格档案"
**When** 导航到风格档案页
**Then** 我看到 **PreferenceCloud** 组件（风格偏好词云）
**And** 页面标题"我的风格档案"（28pt Semibold）
**And** 页面右上角显示"编辑"按钮

**Given** PreferenceCloud 组件渲染
**When** 组件加载
**Then** 显示用户的风格偏好标签词云：当前偏好（用户主动选择的大字号 18pt Bold 紫色例如"简约""通勤""知性"）、AI 推断偏好（基于用户点赞行为推断中等字号 14pt Regular 灰色例如"黑白配色""阔腿裤""经典款"）
**And** 标签以词云形式分布（高频标签居中字号更大）
**And** 标签可点击点击后高亮并显示相关搭配

**Given** 词云数据从后端获取
**When** 调用 `/api/v1/users/me/preferences` API
**Then** 响应包含：
```json
{
  "bodyType": "梨形",
  "stylePreferences": ["简约", "通勤", "知性"],
  "occasions": ["上班", "约会"],
  "inferredTags": [
    { "tag": "黑白配色", "weight": 0.8 },
    { "tag": "阔腿裤", "weight": 0.6 }
  ]
}
```
**And** `weight` 决定标签字号和位置（高权重标签更大更居中）

**Given** 用户点击"编辑"按钮
**When** 点击触发
**Then** 进入偏好编辑模式
**And** 显示 3 个编辑区域（复刻 Onboarding 问卷样式）：身材类型（单选梨形/苹果形/沙漏形/直筒形/倒三角形）、风格偏好（多选简约/时尚/甜美/知性/运动最多选 3 个）、常见场合（多选上班/约会/聚会/日常/运动最多选 3 个）
**And** 当前选项预先选中（紫色边框高亮）

**Given** 用户修改偏好后
**When** 用户点击"保存"按钮
**Then** 调用 `/api/v1/users/me/preferences` PUT 请求更新偏好
**And** 更新成功后显示 Toast："偏好已更新AI 会更懂你"
**And** 返回风格档案页词云自动刷新
**And** 偏好数据同步到 SQLite（FR8 多设备同步）

**Given** 偏好修改影响 AI 推荐
**When** 用户修改偏好后生成新搭配
**Then** AI 推荐优先基于新偏好
**And** 后端 AI Orchestrator 读取最新 `user_preferences` 表数据

**Given** PreferenceCloud 组件需要实现
**When** 开发者创建组件
**Then** 组件位于 `src/components/ui/PreferenceCloud.tsx`
**And** 组件接受 props：
```typescript
interface PreferenceCloudProps {
  preferences: {
    tag: string;
    weight: number;
    type: 'user' | 'inferred';
  }[];
  onTagPress?: (tag: string) => void;
}
```
**And** 使用算法计算标签位置（避免重叠）
**And** 标签字号范围：12pt（最小） - 24pt（最大）

**Given** 用户可以查看标签相关搭配
**When** 用户点击词云中的某个标签（如"简约"）
**Then** 导航到搭配列表页自动筛选包含该标签的历史搭配
**And** 使用 Epic 5 Story 5.3 的筛选功能

**Given** 偏好数据多设备同步（FR8）
**When** 用户在设备 A 修改偏好
**Then** 数据上传到后端 PostgreSQL
**And** 用户在设备 B 登录时自动下载最新偏好
**And** SQLite 本地缓存更新
**And** 同步使用 Epic 5 Story 5.4 的同步服务

**Given** 用户长期未更新偏好
**When** 距离上次编辑 > 30 天
**Then** 个人页显示提示："你的偏好可能改变了去更新风格档案吧"
**And** 点击提示直接跳转到偏好编辑页

---

## Epic 8: Permissions & Offline Support

**Goal**: 实现权限管理系统和离线支持优雅处理相机/相册/位置/通知权限请求提供完整的离线功能降级方案网络恢复后自动同步确保"离线优先智能降级"体验原则。

**FRs Covered**: FR58-FR65
**NFRs Relevant**: NFR-U6 (离线可用), NFR-U8 (30s自动同步), NFR-R10 (指数退避重试)

### Story 8.1: Permission Manager with Friendly Prompts

As a **用户**（首次使用 app 的用户），
I want 看到清晰友好的权限请求说明，
So that 我理解为什么需要这些权限并愿意授权。

**Acceptance Criteria:**

**Given** 用户首次打开 app 完成注册
**When** 进入首页
**Then** 不立即请求所有权限（避免权限疲劳）
**And** 仅在用户触发相关功能时才请求对应权限（Just-in-time 模式）

**Given** 用户点击"拍照"按钮（Epic 2 Story 2.1）
**When** 相机权限未授权
**Then** 显示友好的权限说明弹窗（在系统权限对话框**之前**）：标题"需要访问相机"、图标相机图标（紫色）、说明"搭理需要使用相机拍摄你的衣服照片以便 AI 为你生成搭配建议"、按钮"好的允许"（紫色主按钮）+ "暂不"（灰色次按钮）
**And** 点击"好的允许"后调用系统权限请求

**Given** 相机权限系统对话框显示
**When** iOS 显示系统权限请求
**Then** 使用 `expo-camera` 请求权限：
```typescript
import { Camera } from 'expo-camera';

const { status } = await Camera.requestCameraPermissionsAsync();
```
**And** 系统对话框显示 `Info.plist` 中配置的说明文案：
```xml
<key>NSCameraUsageDescription</key>
<string>搭理需要访问相机以拍摄衣服照片为您生成个性化搭配建议</string>
```

**Given** 用户拒绝相机权限
**When** 用户点击"不允许"
**Then** 显示备选方案提示（FR63）："没关系你可以从相册选择照片"、高亮显示"从相册选择"按钮
**And** 不再重复请求相机权限（避免骚扰）
**And** 在设置页提供"开启相机权限"引导（跳转到系统设置）

**Given** 用户点击"从相册选择"按钮
**When** 照片库权限未授权
**Then** 显示友好权限说明弹窗：标题"需要访问相册"、说明"搭理需要访问相册以选择你的衣服照片"、按钮"好的允许"+ "取消"
**And** 点击后调用系统权限请求：
```typescript
import * as ImagePicker from 'expo-image-picker';

const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
```

**Given** 用户拒绝照片库权限
**When** 权限被拒绝
**Then** 显示提示："需要相册权限才能选择照片请前往设置开启"
**And** 提供"前往设置"按钮（跳转到系统设置）：
```typescript
import * as Linking from 'expo-linking';

await Linking.openSettings();
```
**And** 用户从设置返回后自动检测权限状态

**Given** app 需要位置权限获取天气（FR60可选功能）
**When** 用户首次生成搭配时
**Then** 显示位置权限说明弹窗：标题"想获取当地天气吗（可选）"、说明"我们会根据天气为你推荐更合适的搭配只获取城市级别位置"、按钮"允许"（主按钮）+ "暂不需要"（次按钮）
**And** 强调"可选"不强制要求

**Given** 用户允许位置权限
**When** 权限授予
**Then** 使用 `expo-location` 获取粗略位置（城市级别）：
```typescript
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
if (status === 'granted') {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Low, // 城市级别
  });
}
```
**And** 后端根据经纬度获取城市天气（NFR-S9：不精确到具体地址）

**Given** 用户拒绝位置权限
**When** 权限被拒绝
**Then** app 仍可正常使用（位置是可选功能）
**And** AI 推荐不包含天气因素
**And** 不再反复请求位置权限

**Given** app 需要推送通知权限（FR61-FR62）
**When** 用户首次生成搭配
**Then** 在搭配生成完成后显示推送权限请求：时机用户首次体验"啊哈时刻"（看到搭配结果）后、标题"想第一时间收到搭配建议吗"、说明"当 AI 完成分析后我们会通知你不会发送营销信息"、按钮"开启通知"+ "暂不"
**And** 时机选择在用户高兴时（刚看到搭配结果）提升授权率

**Given** 用户允许推送通知
**When** 权限授予
**Then** 使用 `expo-notifications` 请求权限：
```typescript
import * as Notifications from 'expo-notifications';

const { status } = await Notifications.requestPermissionsAsync();
if (status === 'granted') {
  const token = await Notifications.getExpoPushTokenAsync();
  // 上传 token 到后端
}
```
**And** 将 push token 上传到后端 `/api/v1/users/me/push-token`

**Given** Permission Manager 工具需要实现
**When** 开发者创建权限管理器
**Then** 创建 `src/hooks/usePermissions.ts` hook：
```typescript
export function usePermissions() {
  const requestCamera = async () => { /* ... */ };
  const requestPhotoLibrary = async () => { /* ... */ };
  const requestLocation = async () => { /* ... */ };
  const requestNotifications = async () => { /* ... */ };
  const checkPermission = async (type: PermissionType) => { /* ... */ };
  const openSettings = () => Linking.openSettings();

  return {
    requestCamera,
    requestPhotoLibrary,
    requestLocation,
    requestNotifications,
    checkPermission,
    openSettings,
  };
}
```
**And** hook 封装所有权限请求逻辑

**Given** 权限状态需要持久化
**When** 用户授权或拒绝权限
**Then** 将权限状态存储到 Zustand store（`userStore.permissions`）
**And** 避免重复请求已拒绝的权限（最多请求 2 次）

**Given** 权限请求遵循最佳实践
**When** 设计权限流程
**Then** 遵循以下原则：✅ Just-in-time需要时才请求不预先请求所有权限、✅ 说明原因清晰告知为什么需要权限、✅ 提供备选被拒绝后提供其他功能路径、✅ 不骚扰用户最多请求 2 次不反复弹窗、✅ 可选功能明确标注"可选"

### Story 8.2: Offline Mode Handler with Graceful Degradation

As a **用户**（网络不稳定的用户），
I want 在离线时仍能使用核心功能，
So that 我不会因为网络问题而无法使用 app。

**Acceptance Criteria:**

**Given** app 需要检测网络状态
**When** app 启动或网络状态变化
**Then** 使用 `@react-native-community/netinfo` 监听网络：
```typescript
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  const isOffline = !state.isConnected;
  offlineStore.setOfflineMode(isOffline);
});
```
**And** 网络状态存储到 Zustand `offlineStore`

**Given** 用户进入离线状态
**When** 网络断开
**Then** 顶部显示离线提示条（黄色背景）：图标 ⚠️、文案"当前离线部分功能不可用"
**And** 提示条不阻挡内容可向上滑动隐藏
**And** 3 秒后自动收起仅显示小图标

**Given** 用户离线时查看历史搭配（FR64）
**When** 用户打开搭配列表页（Epic 5）
**Then** 从 SQLite 读取本地数据完全可用（NFR-U6）
**And** 所有历史搭配可正常查看筛选点击详情
**And** 响应时间 <200ms（NFR-P7）
**And** 界面无任何功能限制或灰化

**Given** 用户离线时尝试生成新搭配
**When** 用户点击"拍照"或"从相册选择"
**Then** 显示友好提示："当前离线无法生成新搭配"、"你可以查看历史搭配或等待网络恢复"
**And** 拍照/相册按钮置灰（视觉上不可点击）
**And** 不允许用户进入生成流程

**Given** 用户离线时尝试分享
**When** 用户点击"分享"按钮
**Then** 允许生成分享图片（本地操作不需要网络）
**And** 允许保存到相册
**And** 但"分享到微信"等网络操作显示提示："当前离线分享功能不可用"

**Given** 用户离线时进行点赞/收藏操作
**When** 用户点赞或收藏搭配
**Then** 操作立即在本地 SQLite 生效
**And** UI 立即更新（心形变红星形变黄）
**And** 操作加入离线队列（`offlineStore.addPendingAction`）
**And** 显示微小提示："已离线保存稍后同步"（1秒后消失）

**Given** 离线队列需要管理
**When** 用户离线操作
**Then** 操作存储到 `offlineStore.pendingActions` 数组：
```typescript
interface PendingAction {
  id: string;
  type: 'like' | 'favorite' | 'delete';
  outfitId: string;
  timestamp: number;
  payload: any;
}
```
**And** 队列持久化到 AsyncStorage（防止 app 关闭丢失）

**Given** 用户离线时修改偏好设置
**When** 用户编辑风格偏好（Epic 7 Story 7.3）
**Then** 设置立即保存到 SQLite
**And** 加入离线队列等待同步到云端
**And** 显示提示："设置已保存稍后同步到云端"

**Given** Offline Handler 需要实现
**When** 开发者创建离线处理器
**Then** 创建 `src/stores/offlineStore.ts` Zustand store：
```typescript
interface OfflineState {
  isOffline: boolean;
  pendingActions: PendingAction[];
  setOfflineMode: (isOffline: boolean) => void;
  addPendingAction: (action: PendingAction) => void;
  clearPendingActions: () => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOffline: false,
  pendingActions: [],
  setOfflineMode: (isOffline) => set({ isOffline }),
  addPendingAction: (action) => set(state => ({
    pendingActions: [...state.pendingActions, action]
  })),
  clearPendingActions: () => set({ pendingActions: [] }),
}));
```

**Given** 离线提示条组件需要实现
**When** 开发者创建组件
**Then** 组件位于 `src/components/ui/OfflineBanner.tsx`
**And** 组件监听 `offlineStore.isOffline` 状态
**And** 离线时显示在线时自动隐藏（淡出动画）

**Given** API 请求需要离线容错
**When** 离线时发起 API 请求
**Then** Axios 拦截器捕获网络错误
**And** 返回友好错误信息而非原始错误
**And** React Query 自动使用缓存数据（staleTime 设置）

**Given** 用户体验需要优雅降级
**When** 离线状态
**Then** 遵循降级原则：✅ 核心功能可用（查看历史）、✅ 在线功能禁用但不隐藏（提示原因）、✅ 本地操作立即生效（点赞/收藏）、✅ 操作队列化网络恢复后自动同步、✅ 清晰提示当前状态（离线横幅）

### Story 8.3: Network Reconnection and Auto-Sync within 30s

As a **用户**（网络恢复的用户），
I want 网络恢复后自动同步数据，
So that 我不需要手动操作数据自动保持最新。

**Acceptance Criteria:**

**Given** 用户从离线恢复到在线
**When** NetInfo 检测到网络状态变为 `isConnected: true`
**Then** 30 秒内自动触发同步（NFR-U8）
**And** 同步服务在后台执行不阻塞 UI
**And** 离线横幅自动隐藏（淡出动画）

**Given** 自动同步服务触发
**When** 网络恢复
**Then** 调用 `src/services/sync.ts` 的 `syncPendingActions` 函数：
```typescript
export async function syncPendingActions() {
  const { pendingActions } = useOfflineStore.getState();

  for (const action of pendingActions) {
    try {
      await syncAction(action);
      // 成功后从队列移除
    } catch (error) {
      // 失败保留在队列下次重试
    }
  }
}
```
**And** 逐个处理离线队列中的操作

**Given** 同步点赞/收藏操作
**When** 处理 `type: 'like'` 或 `'favorite'` 操作
**Then** 调用 `/api/v1/outfits/:id/like` 或 `/save` API
**And** 更新 SQLite 的 `sync_status = 'synced'`
**And** 从离线队列移除该操作

**Given** 同步删除操作
**When** 处理 `type: 'delete'` 操作
**Then** 调用 `/api/v1/outfits/:id` DELETE API
**And** 后端标记为软删除（`is_deleted = true`）
**And** 从离线队列移除

**Given** 同步新生成的搭配数据
**When** SQLite 中有 `sync_status = 'pending'` 的 outfit
**Then** 调用 `/api/v1/outfits/sync` 批量上传（复用 Epic 5 Story 5.4）
**And** 使用 Last-Write-Wins 策略解决冲突
**And** 更新 `sync_status = 'synced'`

**Given** 同步用户偏好设置
**When** 用户在离线时修改了偏好
**Then** 调用 `/api/v1/users/me/preferences` PUT 更新云端数据
**And** 同步成功后更新本地状态

**Given** 同步进度需要反馈
**When** 同步开始
**Then** 底部显示小型 Toast："正在同步数据..."
**And** Toast 包含进度指示器（转圈动画）
**When** 同步完成
**Then** Toast 更新为："已同步 N 条数据 ✓"
**And** 2 秒后自动消失

**Given** 同步失败处理
**When** 某个操作同步失败（API 错误超时）
**Then** 保留在离线队列中
**And** 使用指数退避重试（1s → 2s → 4s最多 3 次NFR-R10）
**And** 3 次失败后停止重试等待下次网络变化或 app 重启

**Given** 同步冲突解决
**When** 服务器数据比本地新（`updated_at` 更晚）
**Then** 使用 Last-Write-Wins 策略服务器数据覆盖本地
**And** 更新 SQLite 为服务器版本
**And** 可选：记录冲突日志到 `sync_conflicts` 表（后端）

**Given** 后台同步定时任务
**When** 用户在线且 app 在前台
**Then** 每 5 分钟自动检查并同步一次
**And** 使用轮询机制：
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    if (!offlineStore.isOffline) {
      syncPendingActions();
    }
  }, 5 * 60 * 1000); // 5 分钟

  return () => clearInterval(interval);
}, []);
```

**Given** 后台同步（app 在后台时）
**When** 用户切换到后台
**Then** 使用 Expo Background Fetch 定期同步（iOS 限制）：
```typescript
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

TaskManager.defineTask('BACKGROUND_SYNC', async () => {
  await syncPendingActions();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

await BackgroundFetch.registerTaskAsync('BACKGROUND_SYNC', {
  minimumInterval: 15 * 60, // 最少 15 分钟（iOS 限制）
});
```

**Given** 用户可以查看同步状态
**When** 用户进入设置页
**Then** 显示同步状态区域："上次同步时间"显示相对时间（如"2 分钟前"）、"待同步数量"显示 `pendingActions.length`、"立即同步"按钮手动触发同步
**And** 同步中时按钮显示加载指示器

**Given** 同步日志需要记录
**When** 同步成功或失败
**Then** 记录到本地日志（可选开发调试用）：
```typescript
console.log('[Sync] Success:', {
  actionId: action.id,
  type: action.type,
  timestamp: Date.now(),
});
```
**And** 生产环境可以上报到 Sentry（错误追踪）

**Given** 网络恢复体验需要流畅
**When** 从离线到在线转换
**Then** 用户体验遵循以下原则：✅ 30 秒内自动同步（NFR-U8）、✅ 后台静默同步不打断用户、✅ 同步进度简洁提示（Toast）、✅ 失败自动重试不骚扰用户、✅ 冲突自动解决（Last-Write-Wins）、✅ 支持手动同步（设置页）

---

## 🎉 Epic & Story Creation Complete

### Final Statistics

**9 Epics, 30 Stories - All with Detailed Acceptance Criteria**

| Epic | Stories | FRs | Status |
|------|---------|-----|--------|
| Epic 0: Project Setup | 2 | - | ✅ Complete |
| Epic 1: Authentication | 4 | FR1-8 | ✅ Complete |
| Epic 2: Camera & Photo | 3 | FR9-17 | ✅ Complete |
| Epic 3: AI Generation | 5 | FR18-27, FR50-57 | ✅ Complete |
| Epic 4: Theory Display | 3 | FR28-34 | ✅ Complete |
| Epic 5: History & Search | 4 | FR35-42 | ✅ Complete |
| Epic 6: Sharing & Social | 3 | FR43-49 | ✅ Complete |
| Epic 7: Profile & Growth | 3 | FR6-8 | ✅ Complete |
| Epic 8: Permissions & Offline | 3 | FR58-65 | ✅ Complete |

### Coverage Validation

- ✅ All 65 FRs covered
- ✅ All NFRs mapped to stories
- ✅ All 17 HTML prototypes referenced
- ✅ Architecture requirements included
- ✅ 7 custom components specified

---

**Document Status**: Epic and story breakdown complete with full Given/When/Then acceptance criteria. Ready for final validation and implementation.
