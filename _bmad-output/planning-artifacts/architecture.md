---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - product-brief-dali-2025-12-27.md
  - prd.md
  - ux-design-specification.md
  - research/market-ai-fashion-styling-china-research-2025-12-27.md
workflowType: 'architecture'
project_name: 'dali'
user_name: 'Xiaoshaoqian'
date: '2025-12-31'
lastStep: 8
status: 'complete'
completedAt: '2026-01-03'
---

# Architecture Decision Document - 搭理app

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

**Project:** dali (搭理app)
**Author:** Xiaoshaoqian
**Date:** 2025-12-31

---

## Document Purpose

This architecture document serves as the **single source of truth** for all architectural decisions in the dali project. It is designed to:

1. **Prevent AI agent conflicts** - Clear, unambiguous decisions that all implementation agents must follow
2. **Enable consistent implementation** - Every developer (human or AI) knows exactly what to build
3. **Document trade-offs** - Capture why decisions were made for future reference
4. **Guide evolution** - Provide context for future architectural changes

---

## Project Context

**搭理app** is an AI-driven personalized fashion styling iOS mobile application targeting 18-38 year old Chinese women who struggle with outfit coordination. The app uses AI to generate personalized styling recommendations with professional theory explanations (color theory, style analysis, matching principles), helping users truly understand "why this works" and build their own styling confidence and system.

**Core Differentiators:**
- **Knowledge Empowerment vs. Product Sales**: Focus on teaching styling knowledge rather than e-commerce
- **Progressive Personalization**: Onboarding collects 3-5 key questions (body type, style preferences, common occasions), continuously learning through likes/saves
- **Personal Styling Knowledge Base**: Auto-saves all recommendations for future review and learning

**Product Vision:**
Transform users from "can't style" to "confident stylers with systematic knowledge" - ultimately "everyone can be their own stylist"

---

## Input Documents Summary

### 1. Product Brief
- **Core Problem**: Users buy clothes but don't know how to style them, leading to 40-50% wardrobe idle rate
- **Target Users**: 18-38 year old Chinese women lacking professional styling knowledge
- **Key Scenarios**: Purchase decisions, new clothes styling, daily outfit selection, special occasions

### 2. PRD (Product Requirements Document)
- **MVP Timeline**: 6 months, iOS only
- **Tech Stack**: React Native (Expo), Python FastAPI, PostgreSQL
- **Success Criteria**:
  - 30% share rate within 7 days (aha moment)
  - 30-day retention > 15%
  - 40% new users from referrals
- **Key Features**: Photo upload, AI recommendation (3 outfits in 5 seconds), theory visualization, history management, sharing

### 3. UX Design Specification
- **Design Direction**: L4 - Refined layered cards with iPhone 15 Pro precision
- **Color System**: Modern purple (`#6C63FF`) + Accent pink (`#FF6B9D`)
- **Core Components**: OutfitCard, TheoryVisualization, StyleTagChip, SkeletonLoader, ProgressCircle, ShareTemplate
- **Accessibility**: WCAG 2.1 Level AA compliance

### 4. Market Research
- **Market Opportunity**: AI fashion tech market growing rapidly, 82% of 18-35 women willing to try AI styling tools
- **Competitive Gap**: No dedicated "AI styling decision assistant" - competitors are either social platforms (Xiaohongshu) or e-commerce (Mogujie)
- **Key Insight**: Virtual try-on proven pseudo-demand in China; focus on "styling recommendations" not "virtual fitting"

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements Analysis:**

The project encompasses **65 functional requirements** organized into 8 major categories:

1. **User Account & Personalization (FR1-8)**: Progressive onboarding collects 3-5 key attributes (body type, style preferences, common occasions) during registration, with continuous learning through user interactions (likes/saves). Multi-device sync support required.

2. **Item Photography & Management (FR9-17)**: Camera integration for clothing photography, album selection, basic editing (crop/rotate), AI-powered garment recognition (type, color, pattern, style), and user wardrobe management with deletion capability.

3. **AI Recommendation Engine (FR18-27)**: Core value delivery - generate 3 outfit recommendations within 5 seconds based on personalized profile (body type, style, occasion). Includes high-quality product image composition, learns from user feedback (likes/saves), and weather-aware suggestions.

4. **Knowledge Education (FR28-34)**: Professional theory visualization including color theory wheels, style analysis tags, outfit rationale text, and occasion-appropriate guidance. Emphasis on teaching "why this works" not just "what to wear".

5. **Personal Styling Knowledge Base (FR35-42)**: Auto-save all generated recommendations to local SQLite storage with cloud sync, browsable by occasion/time/favorites, fully offline-capable, with deletion support.

6. **Sharing & Social Propagation (FR43-49)**: Generate beautiful share images with app watermark, one-click sharing to WeChat/Xiaohongshu/Douyin, 3 template styles (minimal/fashion/artistic), behavior tracking for aha moment validation.

7. **Occasion-Based Recommendations (FR50-57)**: Context-aware styling for 6 occasions (romantic date, business meeting, workplace commute, casual gathering, daily errands, athleisure), city-level weather integration via location services.

8. **System Capabilities (FR58-65)**: Permission management (camera/photos/location/notifications), offline mode with graceful degradation, network reconnection handling, and accessibility support.

**Non-Functional Requirements (Architecture-Driving):**

**Performance Requirements:**
- **NFR-P1 (Critical)**: AI recommendation generation < 5 seconds (from photo upload to first result display)
- **NFR-P2**: Image upload < 2 seconds (500KB photo, 4G network)
- **NFR-P3**: App cold start < 3 seconds, hot start < 1 second
- **NFR-P5**: Camera response < 500ms (button tap to preview)
- **NFR-P7**: History query < 200ms (local SQLite)
- **NFR-P8**: Backend API P95 response < 1 second

**Security & Privacy Requirements:**
- **NFR-S1**: HTTPS/TLS 1.2+ for all network communication
- **NFR-S2**: AES-256 encryption for user photos in storage
- **NFR-S3**: Encrypted storage for personal information (body type, preferences)
- **NFR-S5**: Compliance with China's Personal Information Protection Law (PIPL)
- **NFR-S6**: User photos used only for AI analysis, no commercial use without consent
- **NFR-S9**: Location data limited to city-level (not precise coordinates)

**Reliability Requirements:**
- **NFR-R1**: Core services (AI generation, auth, sync) > 99.5% availability
- **NFR-R4**: Daily automatic backup of user data and outfit history
- **NFR-R8**: App crash rate < 0.1% (iOS platform)
- **NFR-R10**: Network request auto-retry (3 attempts, exponential backoff)

**Scalability Requirements:**
- **NFR-SC1**: MVP phase support 10,000 DAU
- **NFR-SC2**: Growth phase support 100,000 DAU without >10% performance degradation
- **NFR-SC3**: Horizontal scaling capability (add server nodes)

**Usability Requirements:**
- **NFR-U1**: Support iOS 14+ and Android 8.0+ (95%+ target user coverage)
- **NFR-U6**: Full offline functionality for viewing outfit history
- **NFR-U8**: Auto-sync within 30 seconds after network recovery
- **NFR-U11**: VoiceOver screen reader support for core operations

**AI Quality Requirements:**
- **NFR-AI1**: Image recognition accuracy > 90% (correct garment type/color/style)
- **NFR-AI2**: Recommendation accuracy > 75% (user like/save rate)
- **NFR-AI3**: Theory explanation usefulness > 80% (user feedback "helpful")
- **NFR-AI4**: AI generation failure rate < 5% (with fallback to rule engine)

### Scale & Complexity Assessment

**Project Complexity: Medium**

**Complexity Indicators:**
- ✅ **AI Integration Complexity**: Third-party AI APIs (Alibaba Cloud Vision, Tongyi Qianwen/GPT-4) require timeout handling and graceful degradation
- ✅ **Offline-First Architecture**: Dual storage (SQLite local + PostgreSQL cloud) with complex sync mechanisms
- ✅ **Cross-Platform Future**: React Native foundation supports Android expansion (MVP focuses iOS only)
- ✅ **Real-Time Performance Requirements**: <5s AI response is core UX, requires optimized API pipeline
- ✅ **Multi-Integration Dependencies**: Alibaba Cloud OSS/Vision API, Tencent Cloud, WeChat OAuth, Push Notifications
- ⚠️ No multi-tenancy requirements (simplifies architecture)
- ⚠️ No real-time collaboration needs (simplifies architecture)

**Primary Technical Domain: Mobile-First Full-Stack Application**
- **Frontend**: React Native (Expo SDK 51+) iOS application
- **Backend**: Python FastAPI RESTful API services
- **Data Layer**: PostgreSQL (cloud) + SQLite (mobile offline) + Alibaba Cloud OSS (images)
- **AI Layer**: Third-party API integration (Alibaba Cloud, Tongyi Qianwen, GPT-4)

**Estimated Architectural Components:**
- **Mobile App**: 3 main screens + 7 custom components + 5 service layers + state management
- **Backend API**: 8-10 API endpoints + 4 core services + 2 integration layers (AI, storage)
- **Data Models**: 5-7 primary entities (User, Outfit, Item, Preference, History, ShareTemplate)

### Technical Constraints & Dependencies

**Platform Constraints:**
- iOS 14+ minimum support (98% user coverage per PRD)
- Android support deferred to post-MVP (6-12 months)
- Screen sizes: 4.7" - 6.7" (iPhone SE to iPhone 15 Pro Max)
- Device features: Camera, Photo Library, Location (optional), Push Notifications

**Technology Stack Constraints (PRD-Specified):**
- **Mobile**: React Native with Expo SDK 51+
- **Backend**: Python FastAPI framework
- **Database**: PostgreSQL (backend), SQLite (mobile offline)
- **Image Storage**: Alibaba Cloud OSS or Tencent Cloud COS
- **AI Services**: Alibaba Cloud Vision API, Tongyi Qianwen or GPT-4 API

**Critical External Dependencies:**
- **Third-Party AI APIs**:
  - Alibaba Cloud / Tencent Cloud Vision API (garment recognition)
  - Tongyi Qianwen / GPT-4 API (theory explanation generation)
  - Dependency risk: Availability, response speed, cost scaling
- **Expo Ecosystem Maturity**: Camera, SQLite, SecureStore, Notifications APIs
- **China Network Environment**: Potential latency/reliability issues with international APIs (GPT-4)

**Compliance & Regulatory Requirements:**
- iOS App Store review guidelines (Human Interface Guidelines compliance)
- China Personal Information Protection Law (PIPL) - data encryption, user consent, deletion rights
- WCAG 2.1 Level AA accessibility compliance (UX requirement)
- App Privacy Nutrition Label disclosure requirements

### Cross-Cutting Concerns Identified

**1. Authentication & Session Management**
- Impacts: All mobile screens + all backend endpoints
- Requirements: Phone+SMS verification or WeChat OAuth, JWT tokens (30-day expiry), multi-device session sync
- Architecture consideration: Unified auth middleware pattern

**2. Data Synchronization Strategy**
- Impacts: Outfit history, user preferences, wardrobe items
- Challenge: SQLite offline ↔ PostgreSQL cloud consistency
- Requirements: Conflict resolution, optimistic sync, queue failed operations
- Architecture consideration: Sync service with retry logic

**3. Error Handling & Graceful Degradation**
- Impacts: AI recommendation engine, image recognition, network operations
- Requirements: Rule-based fallback when AI fails (NFR-AI4 < 5% failure rate)
- Architecture consideration: Layered fallback strategy (AI → rules → cached)

**4. Performance Monitoring & Observability**
- Impacts: All system components
- Critical metrics: <5s AI response (NFR-P1), <0.1% crash rate (NFR-R8), 99.5% uptime (NFR-R1)
- Architecture consideration: Distributed tracing, error tracking (Sentry), custom analytics

**5. Localization & Internationalization (Future-Ready)**
- Current: Chinese language primary
- Future: Multi-language support (English, Japanese, Korean per vision)
- Architecture consideration: i18n-ready code structure, separated content strings

**6. Privacy & Data Encryption (End-to-End)**
- Impacts: User photos, personal information, outfit history
- Requirements: AES-256 storage encryption (NFR-S2), HTTPS transport (NFR-S1), PIPL compliance (NFR-S5)
- Architecture consideration: Encryption-at-rest + encryption-in-transit patterns

**7. Offline-First User Experience**
- Impacts: History browsing, knowledge base access
- Requirements: Full offline functionality for past outfits (NFR-U6), <200ms query (NFR-P7)
- Architecture consideration: Local-first data architecture with background sync

**8. AI Response Time Optimization**
- Impacts: Core user experience (aha moment)
- Requirements: <5 seconds total (NFR-P1) including network, API processing, result rendering
- Architecture consideration: Parallel API calls, progressive loading, skeleton screens

### Requirements-to-Architecture Mapping Preview

**High-Level Component Mapping:**

| Requirement Category | Primary Architectural Components |
|---------------------|----------------------------------|
| User Account (FR1-8) | Auth Service, User Profile Service, Onboarding Flow |
| Photography (FR9-17) | Camera Service, Image Upload Service, Wardrobe Manager |
| AI Recommendations (FR18-27) | AI Orchestration Service, Recommendation Engine, Rule Fallback |
| Knowledge Education (FR28-34) | Theory Visualization Components, Content Service |
| History Management (FR35-42) | SQLite Local DB, Sync Service, History Screen |
| Sharing (FR43-49) | Share Template Generator, Social Integration Service |
| Occasion-Based (FR50-57) | Context Service (weather/time), Occasion Selector |
| System Support (FR58-65) | Permission Manager, Offline Handler, Analytics |

**Key Integration Points:**
- Mobile App ↔ Backend API: RESTful over HTTPS (Axios + React Query)
- Backend ↔ AI Services: HTTP API calls with timeout/retry
- Mobile App ↔ SQLite: Expo SQLite direct access
- Backend ↔ PostgreSQL: Prisma ORM
- Mobile App ↔ Cloud Storage: Signed URL uploads (Alibaba OSS)

---

## Starter Template Evaluation

### Primary Technology Domain

**Mobile-First Full-Stack Application** - iOS mobile application (MVP phase) using React Native with Expo SDK 51+, with Python FastAPI backend and PostgreSQL/SQLite data layer.

### Starter Options Considered

**1. Expo Default Template** (`npx create-expo-app@latest`)
- **Included**: Expo Router library, TypeScript, Expo CLI tools
- **Purpose**: Designed for multi-screen applications with file-based routing
- **Maintenance**: Official Expo team, excellent long-term support
- **Compatibility**: Expo SDK 51+ fully supported
- **Flexibility**: Minimal UI assumptions, allows full custom design implementation

**2. Expo Tabs Template** (`npx create-expo-app@latest --template tabs`)
- **Included**: Pre-configured tab navigation, Expo Router, TypeScript
- **Purpose**: Quick start for tab-based applications
- **Trade-off**: Includes example tab UI that would need removal to match UX specification
- **Maintenance**: Official Expo team

**3. Community Production Templates** (Obytes Starter, NativeWind Template, React Native Boilerplate)
- **Included**: Extended toolchains (NativeWind/Tailwind CSS, Zustand, TanStack Query, comprehensive linting)
- **Purpose**: Production-ready with opinionated tech stack
- **Trade-offs**:
  - May include unnecessary dependencies (e.g., NativeWind when UX spec specifies custom styling)
  - Third-party maintenance introduces upgrade coordination risk
  - Heavier initial footprint

### Selected Starter: Expo Default Template

**Rationale for Selection:**

1. **Official Expo Support**: Maintained by Expo team, ensures long-term compatibility and security updates
2. **SDK 51+ Compatibility**: Guaranteed support for Expo SDK 51+ as specified in PRD technical requirements
3. **Multi-Screen Architecture**: Designed for applications with multiple screens (Home, History, Profile as per UX spec)
4. **Expo Router Included**: Modern file-based routing pre-configured, reducing initial setup complexity
5. **TypeScript by Default**: Type safety from day one, critical for medium-complexity project with 65 functional requirements
6. **Design Flexibility**: No opinionated UI library (unlike NativeWind templates), allowing full implementation of UX Design Specification (purple/pink color system, custom OutfitCard, TheoryVisualization components)
7. **Minimal Bloat**: Only essential dependencies included, avoiding removal of unused libraries
8. **Proven Foundation**: Recommended approach per official Expo documentation for 2025

**Initialization Command:**

```bash
npx create-expo-app@latest dali-mobile
```

Alternative package managers:
```bash
# Using Yarn
yarn create expo-app dali-mobile

# Using pnpm
pnpm create expo-app dali-mobile

# Using Bun
bun create expo dali-mobile
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- **TypeScript 5.x**: Full type safety with tsconfig.json pre-configured
- **React Native**: Latest stable version compatible with Expo SDK 51+
- **Node.js 18+**: Required runtime environment

**Routing & Navigation:**
- **Expo Router 3.x**: File-based routing system (app directory structure)
- **React Navigation 6.x**: Underlying navigation library (managed by Expo Router)
- **Deep Linking**: Pre-configured with expo-linking for external app navigation

**Build Tooling:**
- **Metro Bundler**: React Native's JavaScript bundler with optimized configuration
- **Babel**: Pre-configured with babel-preset-expo for modern JavaScript features
- **EAS Build**: Integration ready for Expo Application Services cloud builds

**Development Experience:**
- **Fast Refresh**: Hot module reloading for instant development feedback
- **Expo Go App**: Quick testing on physical devices without builds
- **Expo Dev Client**: Custom development builds with native code support
- **TypeScript IntelliSense**: Full IDE support for type checking

**Code Organization:**
- **app/ directory**: File-based routing structure (app/index.tsx for home screen)
- **assets/**: Static resources (images, fonts, icons)
- **package.json**: Dependency management with Expo scripts
- **app.json**: Expo configuration for app metadata, permissions, build settings

**Essential Libraries Included:**
- **expo**: Core Expo SDK (~51.0.0)
- **expo-status-bar**: Status bar styling
- **react**: React library
- **react-native**: React Native core
- **expo-router**: File-based routing

**Additional Packages Required for Project (Not in Starter):**

Based on PRD functional requirements, these must be added during implementation:

**Camera & Media** (FR9-17: Photography & Management):
- `expo-camera` - Camera integration
- `expo-image-picker` - Photo album selection
- `expo-image-manipulator` - Crop/rotate functionality

**Offline Storage** (FR35-42: Personal Styling Knowledge Base):
- `expo-sqlite` - Local SQLite database for offline outfit history

**Security** (NFR-S2, NFR-S3: Encryption):
- `expo-secure-store` - Encrypted storage for personal information

**Location Services** (FR56-57: Weather Integration):
- `expo-location` - City-level location for weather data

**Notifications** (FR58-65: System Capabilities):
- `expo-notifications` - Push notification support

**HTTP & State Management**:
- `axios` - HTTP client for backend API communication
- `@tanstack/react-query` - Server state management and caching
- `zustand` - Lightweight client state management

**UI & Styling**:
- `react-native-reanimated` - Smooth animations for theory visualizations
- `react-native-svg` - SVG support for color theory wheels (FR28-34)
- Custom component library per UX specification

**Note:** Project initialization using this command should be the **first implementation story** in Epic 0 (Project Setup). This establishes the architectural foundation that all subsequent development builds upon.

---

## Core Architectural Decisions

_Decisions made collaboratively with Xiaoshaoqian on 2026-01-01._

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Backend ORM selection (SQLAlchemy 2.0)
- Mobile state management (Zustand)
- Authentication strategy (Phone SMS + WeChat OAuth)
- Cloud storage provider (Alibaba Cloud OSS)

**Important Decisions (Shape Architecture):**
- Data synchronization strategy (Last-Write-Wins)
- API design pattern (RESTful)
- Build strategy (EAS + Local dual support)
- Animation library (Reanimated 3)

**Deferred Decisions (Post-MVP):**
- CDN optimization strategy
- Advanced caching layers
- Multi-region deployment
- A/B testing infrastructure

---

### Data Architecture

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| **Backend ORM** | SQLAlchemy | 2.0+ | Mature, async support, type-safe, FastAPI ecosystem first choice |
| **Mobile Local Storage** | Expo SQLite | Latest | PRD specified, Expo native integration, meets <200ms query performance |
| **Data Sync Strategy** | Last-Write-Wins + Soft Delete | - | Simple and effective for outfit data with low conflict rate, can iterate later |
| **Cloud Storage** | Alibaba Cloud OSS | - | Same platform as Vision API, internal network interop, unified billing |

**Data Model Overview:**

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │────▶│   Preference    │     │     Outfit      │
│  (id, phone,    │     │ (body_type,     │     │ (id, user_id,   │
│   wechat_id)    │     │  style, etc.)   │     │  occasion, etc.)│
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                              ┌──────────────────────────┼──────────────────────────┐
                              ▼                          ▼                          ▼
                    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
                    │   OutfitItem    │       │     Theory      │       │   ShareRecord   │
                    │ (garment info)  │       │ (color, style)  │       │ (platform, time)│
                    └─────────────────┘       └─────────────────┘       └─────────────────┘
```

**Sync Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile App                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   Zustand   │◀──▶│   SQLite    │◀──▶│ Sync Queue  │          │
│  │   (State)   │    │  (Offline)  │    │  (Pending)  │          │
│  └─────────────┘    └─────────────┘    └──────┬──────┘          │
└─────────────────────────────────────────────────┼────────────────┘
                                                  │ HTTPS
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend API                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   FastAPI   │◀──▶│ SQLAlchemy  │◀──▶│ PostgreSQL  │          │
│  │  (Routes)   │    │   (ORM)     │    │  (Cloud)    │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Primary Auth** | Phone + SMS Verification | PIPL compliant, phone number as unique identifier more reliable |
| **Secondary Auth** | WeChat OAuth | Quick login for WeChat users, common in China market |
| **Token Strategy** | JWT (Access + Refresh) | Access token 15min, Refresh token 30 days, security and UX balance |
| **Token Storage** | expo-secure-store | iOS Keychain integration, encrypted storage |
| **Transport Security** | HTTPS/TLS 1.2+ | All API communication encrypted (NFR-S1) |
| **Storage Encryption** | OSS SSE (Server-Side) | Alibaba Cloud built-in AES-256 encryption (NFR-S2) |
| **Sensitive Data** | expo-secure-store | Personal info (body type, preferences) encrypted locally (NFR-S3) |

**Authentication Flow:**

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │     │   App   │     │ Backend │     │ SMS/WX  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │  Enter Phone  │               │               │
     │──────────────▶│  Request OTP  │               │
     │               │──────────────▶│  Send SMS     │
     │               │               │──────────────▶│
     │               │               │               │
     │  Enter OTP    │               │               │
     │──────────────▶│  Verify OTP   │               │
     │               │──────────────▶│               │
     │               │  Access+Refresh Token         │
     │               │◀──────────────│               │
     │               │               │               │
     │               │  Store in SecureStore         │
     │               │───────────────────────────────│
```

---

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **API Style** | RESTful | Medium project scale, simple and intuitive, FastAPI native support |
| **API Documentation** | FastAPI Auto-generated | Swagger UI + ReDoc out of box, code is documentation |
| **HTTP Client** | Axios | Mature, interceptors for token refresh, wide ecosystem |
| **Server State** | TanStack React Query | Caching, retry, offline support, background sync |
| **Error Format** | Standardized JSON | `{code, message, details}` structure across all endpoints |
| **Retry Strategy** | Exponential Backoff | 3 attempts, 1s→2s→4s delays (NFR-R10) |

**API Endpoint Structure:**

```
/api/v1/
├── /auth
│   ├── POST /sms/send          # Send SMS verification code
│   ├── POST /sms/verify        # Verify SMS and get tokens
│   ├── POST /wechat/login      # WeChat OAuth login
│   ├── POST /refresh           # Refresh access token
│   └── POST /logout            # Invalidate tokens
│
├── /users
│   ├── GET  /me                # Get current user profile
│   ├── PUT  /me                # Update profile
│   └── PUT  /me/preferences    # Update style preferences
│
├── /outfits
│   ├── POST /generate          # Generate AI outfit recommendations
│   ├── GET  /                  # List user's outfit history
│   ├── GET  /:id               # Get outfit details
│   ├── POST /:id/like          # Like/save an outfit
│   └── DELETE /:id             # Delete from history
│
├── /wardrobe
│   ├── POST /items             # Add clothing item
│   ├── GET  /items             # List wardrobe items
│   └── DELETE /items/:id       # Remove item
│
├── /share
│   ├── POST /generate          # Generate share image
│   └── POST /track             # Track share event
│
└── /context
    ├── GET  /weather           # Get weather by location
    └── GET  /occasions         # Get occasion options
```

---

### Frontend Architecture

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| **State Management** | Zustand | 4.x | Lightweight ~2KB, simple API, works well with React Query |
| **Server State** | TanStack React Query | 5.x | Caching, background sync, offline support |
| **Styling** | StyleSheet (Native) | - | Best performance, no extra dependencies, matches UX design system |
| **Animation** | React Native Reanimated | 3.x | UI thread execution, complex animation support (card flip, theory viz) |
| **SVG Support** | react-native-svg | Latest | Color theory wheel visualization (FR28-34) |

**Component Architecture:**

```
src/
├── app/                        # Expo Router file-based routing
│   ├── (tabs)/                 # Tab navigation group
│   │   ├── index.tsx           # Home screen
│   │   ├── history.tsx         # Outfit history
│   │   └── profile.tsx         # User profile
│   ├── outfit/[id].tsx         # Outfit detail screen
│   ├── onboarding/             # Onboarding flow
│   └── _layout.tsx             # Root layout
│
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── SkeletonLoader.tsx
│   ├── outfit/                 # Outfit-specific components
│   │   ├── OutfitCard.tsx
│   │   ├── TheoryVisualization.tsx
│   │   └── StyleTagChip.tsx
│   └── share/                  # Share-related components
│       └── ShareTemplate.tsx
│
├── services/                   # API and external services
│   ├── api.ts                  # Axios instance configuration
│   ├── auth.ts                 # Authentication service
│   ├── outfit.ts               # Outfit API calls
│   └── sync.ts                 # Offline sync service
│
├── stores/                     # Zustand stores
│   ├── authStore.ts            # Auth state
│   ├── userStore.ts            # User preferences
│   └── offlineStore.ts         # Offline queue
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useOutfits.ts
│   └── useOfflineSync.ts
│
├── utils/                      # Utility functions
│   ├── storage.ts              # SQLite helpers
│   ├── encryption.ts           # Secure store helpers
│   └── validation.ts           # Input validation
│
└── constants/                  # App constants
    ├── colors.ts               # UX color system (#6C63FF, #FF6B9D)
    ├── typography.ts           # Font styles
    └── api.ts                  # API endpoints
```

---

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Mobile Build** | EAS Build + Local Build | Flexibility: local for dev iteration, EAS for releases |
| **Backend Hosting** | Self-managed Cloud Server (ECS/Lightweight) | Cost-effective, full control, sufficient for MVP |
| **Database Hosting** | Self-hosted PostgreSQL (Docker) | Same server as backend, saves cloud DB costs |
| **CI/CD Pipeline** | GitHub Actions | Free, good Expo/EAS integration, rich community resources |
| **Error Tracking** | Sentry | Free tier sufficient for MVP, official Expo support |
| **Logging** | Self-hosted (Docker) | Simple file-based or Loki stack, can upgrade later |
| **Scaling Strategy** | Vertical first, then migrate | MVP validation first, optimize when needed |

**Deployment Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     Alibaba Cloud / Self-hosted                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Cloud Server (ECS)                    │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │   Nginx     │  │   FastAPI   │  │ PostgreSQL  │      │    │
│  │  │  (Reverse   │─▶│  (Docker)   │─▶│  (Docker)   │      │    │
│  │  │   Proxy)    │  │             │  │             │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Alibaba OSS   │  │  Alibaba Vision │  │ Tongyi Qianwen  │  │
│  │  (Images)      │  │  (Recognition)  │  │  (AI Text)      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        External Services                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Sentry    │  │   GitHub    │  │  App Store  │              │
│  │  (Errors)   │  │  Actions    │  │  Connect    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

**Estimated MVP Cloud Costs (Annual):**

| Service | Estimated Cost |
|---------|---------------|
| Cloud Server (2C4G) | ¥199-500/year |
| Alibaba OSS (50GB) | ~¥100/year |
| Alibaba Vision API | Free tier + pay-per-use |
| Tongyi Qianwen API | Pay-per-token |
| Domain + SSL | ~¥100/year |
| **Total (excl. AI calls)** | **~¥500-800/year** |

---

### Decision Impact Analysis

**Implementation Sequence:**

1. **Project Setup** - Expo init, folder structure, base dependencies
2. **Authentication** - Phone/WeChat login, token management
3. **Core Data Layer** - SQLite setup, API client, sync foundation
4. **Camera & Upload** - Photo capture, OSS upload with signed URLs
5. **AI Integration** - Vision API + LLM for recommendations
6. **UI Components** - OutfitCard, TheoryVisualization per UX spec
7. **Offline Support** - Full offline history browsing
8. **Sharing** - Template generation, social platform integration

**Cross-Component Dependencies:**

```
Authentication ──────┬──────▶ All API Calls
                     │
SQLite + Sync ───────┼──────▶ History, Wardrobe, Preferences
                     │
Zustand Stores ──────┼──────▶ All UI Components
                     │
React Query ─────────┴──────▶ Server State Management
```

---

## Implementation Patterns & Consistency Rules

_These patterns ensure all AI agents and developers write consistent, compatible code._

### Naming Patterns

#### Database Naming (PostgreSQL/SQLAlchemy)

| Element | Convention | Example |
|---------|------------|---------|
| Table names | snake_case, plural | `users`, `outfit_items`, `user_preferences` |
| Column names | snake_case | `user_id`, `created_at`, `is_deleted` |
| Foreign keys | `{referenced_table_singular}_id` | `user_id`, `outfit_id` |
| Indexes | `idx_{table}_{column}` | `idx_users_email`, `idx_outfits_user_id` |
| Primary keys | `id` (UUID or auto-increment) | `id` |

#### API Naming

| Element | Convention | Example |
|---------|------------|---------|
| Endpoints | plural nouns, kebab-case | `/api/v1/outfits`, `/api/v1/wardrobe-items` |
| Path params | camelCase | `/outfits/:outfitId` |
| Query params | camelCase | `?userId=1&pageSize=10&sortBy=createdAt` |
| Headers | Title-Case | `Authorization`, `Content-Type` |

#### Frontend Code (TypeScript/React)

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase file & export | `OutfitCard.tsx`, `export function OutfitCard` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useOutfits.ts` |
| Stores | camelCase with `Store` suffix | `authStore.ts`, `userStore.ts` |
| Services | camelCase | `auth.ts`, `outfit.ts` |
| Utils | camelCase | `formatDate.ts`, `validation.ts` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `OutfitData`, `UserPreference`, `ApiResponse` |
| Enums | PascalCase name, UPPER_SNAKE values | `enum Occasion { ROMANTIC_DATE, BUSINESS }` |

---

### API Response Patterns

#### Success Response Format

Direct data return (no wrapper):

```json
// Single resource
{ "id": "uuid", "name": "Summer Outfit", "items": [...] }

// Collection with pagination
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

#### Error Response Format

Standardized structure for all errors:

```json
{
  "code": "AUTH_INVALID_TOKEN",
  "message": "Token 已过期，请重新登录",
  "details": {
    "expiredAt": "2026-01-01T00:00:00Z"
  }
}
```

**Error Code Conventions:**
- Format: `{DOMAIN}_{ERROR_TYPE}`
- Examples: `AUTH_INVALID_TOKEN`, `OUTFIT_NOT_FOUND`, `VALIDATION_FAILED`, `AI_SERVICE_TIMEOUT`

#### JSON Field Naming

All JSON fields use **camelCase**:

```json
{
  "userId": "uuid",
  "createdAt": "2026-01-01T00:00:00Z",
  "outfitItems": [...],
  "isLiked": true
}
```

**Date/Time Format:** ISO 8601 strings (`2026-01-01T00:00:00Z`)

---

### State Management Patterns

#### Zustand Store Structure

```typescript
// stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  login: (tokens: TokenPair) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Action implementations
  setUser: (user) => set({ user, isAuthenticated: true }),
  login: async (tokens) => { /* ... */ },
  logout: () => set({ user: null, isAuthenticated: false }),
  refreshToken: async () => { /* ... */ },
}));
```

**Rules:**
- One store per domain (auth, user, offline)
- State and actions in same interface
- Export as `use{Domain}Store`
- Use `immer` middleware only if nested state updates are frequent

#### React Query Patterns

```typescript
// hooks/useOutfits.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys as constants
export const outfitKeys = {
  all: ['outfits'] as const,
  lists: () => [...outfitKeys.all, 'list'] as const,
  list: (filters: OutfitFilters) => [...outfitKeys.lists(), filters] as const,
  details: () => [...outfitKeys.all, 'detail'] as const,
  detail: (id: string) => [...outfitKeys.details(), id] as const,
};

// Query hook
export function useOutfits(filters: OutfitFilters) {
  return useQuery({
    queryKey: outfitKeys.list(filters),
    queryFn: () => outfitService.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation hook
export function useLikeOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: outfitService.like,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outfitKeys.all });
    },
  });
}
```

---

### Error Handling Patterns

#### Layered Error Handling

| Layer | Responsibility | Implementation |
|-------|---------------|----------------|
| **API Layer** | Network errors, 401/403/500 | Axios interceptors |
| **Service Layer** | Business logic errors | Throw typed errors |
| **Hook Layer** | Query/mutation errors | React Query `onError` |
| **Component Layer** | UI error display | ErrorBoundary + Toast |
| **Global Layer** | Uncaught exceptions | Root ErrorBoundary |

#### Axios Interceptor Pattern

```typescript
// services/api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await useAuthStore.getState().refreshToken();
      if (refreshed) {
        return api.request(error.config);
      }
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

#### User-Facing Error Display

```typescript
// Use Toast for recoverable errors
showToast({ type: 'error', message: error.message });

// Use ErrorBoundary for fatal errors
throw new FatalError('Critical failure', error);
```

---

### File Organization Patterns

#### Test Files: Co-located

```
components/
├── outfit/
│   ├── OutfitCard.tsx
│   ├── OutfitCard.test.tsx      # Unit tests next to component
│   ├── OutfitCard.styles.ts     # Styles (if extracted)
│   └── index.ts                 # Barrel export
```

#### Type Definitions

```
types/
├── api.ts          # API request/response types
├── models.ts       # Domain models (User, Outfit, etc.)
├── navigation.ts   # Navigation params
└── index.ts        # Re-exports
```

#### Environment Configuration

```
.env.development    # Dev environment
.env.staging        # Staging environment
.env.production     # Production environment
app.config.ts       # Expo config (reads from env)
```

---

### Code Style Enforcement

#### All AI Agents MUST:

1. **Follow naming conventions** exactly as specified above
2. **Use TypeScript strict mode** - no `any` types without explicit reason
3. **Write tests** for new components and services (co-located)
4. **Use existing patterns** - check similar files before creating new patterns
5. **Document deviations** - if breaking a pattern, add comment explaining why

#### Linting & Formatting

- **ESLint**: Expo default + React hooks rules
- **Prettier**: Default config, 100 char line width
- **TypeScript**: Strict mode enabled

#### Import Order

```typescript
// 1. React/React Native
import React from 'react';
import { View, Text } from 'react-native';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal: absolute imports
import { useAuthStore } from '@/stores/authStore';
import { OutfitCard } from '@/components/outfit';

// 4. Internal: relative imports
import { styles } from './styles';
import type { Props } from './types';
```

---

### Anti-Patterns to Avoid

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| `any` type everywhere | Define proper types or use `unknown` |
| Inline styles in components | Use StyleSheet or extracted styles file |
| Direct API calls in components | Use services + React Query hooks |
| Console.log in production | Use proper logging service |
| Hardcoded strings | Use constants or i18n |
| Nested ternaries | Extract to helper function or early returns |
| Giant components (>300 lines) | Split into smaller focused components |

---

## Project Structure & Boundaries

### Requirements to Structure Mapping

| PRD Category | Primary Directories |
|--------------|---------------------|
| User Account (FR1-8) | `app/(auth)/`, `stores/authStore.ts`, `services/auth.ts` |
| Photography (FR9-17) | `components/camera/`, `services/upload.ts`, `app/camera.tsx` |
| AI Recommendations (FR18-27) | `services/outfit.ts`, `components/outfit/`, `app/generating.tsx` |
| Knowledge Education (FR28-34) | `components/theory/` |
| History Management (FR35-42) | `app/(tabs)/history.tsx`, `utils/storage.ts`, `services/sync.ts` |
| Sharing (FR43-49) | `components/share/`, `services/share.ts` |
| Occasion-Based (FR50-57) | `components/occasion/`, `services/context.ts`, `app/occasion-select.tsx` |
| System Capabilities (FR58-65) | `hooks/usePermissions.ts`, `stores/offlineStore.ts` |

---

### Mobile Project Structure (dali-mobile)

```
dali-mobile/
├── README.md
├── package.json
├── tsconfig.json
├── app.json                          # Expo configuration
├── app.config.ts                     # Dynamic Expo config
├── babel.config.js
├── metro.config.js
├── .env.development
├── .env.staging
├── .env.production
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # PR checks
│       └── eas-build.yml             # EAS build triggers
│
├── app/                              # Expo Router (file-based routing)
│   ├── _layout.tsx                   # Root layout with providers
│   ├── index.tsx                     # Entry redirect
│   │
│   ├── (auth)/                       # Unauthenticated routes
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx               # Welcome screen
│   │   ├── login.tsx                 # Phone/WeChat login
│   │   └── onboarding/               # Onboarding questionnaire
│   │       ├── body-type.tsx
│   │       ├── style-preference.tsx
│   │       └── occasions.tsx
│   │
│   ├── (tabs)/                       # Main tab navigation
│   │   ├── _layout.tsx               # Tab bar configuration
│   │   ├── index.tsx                 # Home (camera entry)
│   │   ├── history.tsx               # Outfit history
│   │   └── profile.tsx               # User profile & settings
│   │
│   ├── outfit/
│   │   └── [id].tsx                  # Outfit detail screen
│   │
│   ├── camera.tsx                    # Camera capture
│   ├── occasion-select.tsx           # Occasion selection
│   └── generating.tsx                # AI generation loading
│
├── src/
│   ├── components/
│   │   ├── ui/                       # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── ProgressCircle.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── outfit/                   # Outfit-related components
│   │   │   ├── OutfitCard.tsx
│   │   │   ├── OutfitCard.test.tsx
│   │   │   ├── OutfitGrid.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── theory/                   # Theory visualization
│   │   │   ├── ColorWheel.tsx
│   │   │   ├── StyleTagChip.tsx
│   │   │   ├── TheoryVisualization.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── share/                    # Share functionality
│   │   │   ├── ShareTemplate.tsx
│   │   │   ├── SharePreview.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── camera/                   # Camera components
│   │   │   ├── CameraView.tsx
│   │   │   ├── PhotoPreview.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── occasion/                 # Occasion selection
│   │       ├── OccasionCard.tsx
│   │       ├── OccasionGrid.tsx
│   │       └── index.ts
│   │
│   ├── services/                     # API & external services
│   │   ├── api.ts                    # Axios instance + interceptors
│   │   ├── auth.ts                   # Authentication API
│   │   ├── outfit.ts                 # Outfit generation API
│   │   ├── upload.ts                 # OSS image upload
│   │   ├── share.ts                  # Share tracking API
│   │   ├── context.ts                # Weather/occasion API
│   │   └── sync.ts                   # Offline sync service
│   │
│   ├── stores/                       # Zustand state management
│   │   ├── authStore.ts              # Auth state + tokens
│   │   ├── userStore.ts              # User preferences
│   │   ├── offlineStore.ts           # Offline queue
│   │   └── index.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                # Auth logic
│   │   ├── useOutfits.ts             # Outfit queries/mutations
│   │   ├── useOfflineSync.ts         # Sync management
│   │   ├── usePermissions.ts         # Camera/location permissions
│   │   ├── useCamera.ts              # Camera control
│   │   └── index.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── storage.ts                # SQLite helpers
│   │   ├── secureStorage.ts          # SecureStore helpers
│   │   ├── validation.ts             # Input validation
│   │   ├── formatters.ts             # Date/number formatting
│   │   └── index.ts
│   │
│   ├── types/                        # TypeScript definitions
│   │   ├── api.ts                    # API request/response types
│   │   ├── models.ts                 # Domain models
│   │   ├── navigation.ts             # Navigation params
│   │   └── index.ts
│   │
│   └── constants/                    # App constants
│       ├── colors.ts                 # #6C63FF, #FF6B9D
│       ├── typography.ts             # Font styles
│       ├── spacing.ts                # Spacing system
│       ├── api.ts                    # API endpoints
│       └── index.ts
│
├── assets/                           # Static assets
│   ├── images/
│   │   ├── logo.png
│   │   ├── onboarding/
│   │   └── occasions/
│   ├── fonts/
│   └── icons/
│
└── __mocks__/                        # Jest mocks
    ├── expo-camera.ts
    ├── expo-secure-store.ts
    └── expo-sqlite.ts
```

---

### Backend Project Structure (dali-api)

```
dali-api/
├── README.md
├── pyproject.toml                    # Poetry config
├── poetry.lock
├── requirements.txt                  # Fallback deps
├── .env
├── .env.example
├── .gitignore
├── .pre-commit-config.yaml
├── Dockerfile
├── docker-compose.yml
├── docker-compose.dev.yml
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Tests + linting
│       └── deploy.yml                # Deployment
│
├── alembic/                          # Database migrations
│   ├── alembic.ini
│   ├── env.py
│   └── versions/
│       └── 001_initial.py
│
├── app/
│   ├── __init__.py
│   ├── main.py                       # FastAPI entry point
│   ├── config.py                     # Settings management
│   │
│   ├── api/                          # API routes
│   │   ├── __init__.py
│   │   ├── deps.py                   # Dependency injection
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py             # Route aggregation
│   │       ├── auth.py               # /auth endpoints
│   │       ├── users.py              # /users endpoints
│   │       ├── outfits.py            # /outfits endpoints
│   │       ├── wardrobe.py           # /wardrobe endpoints
│   │       ├── share.py              # /share endpoints
│   │       └── context.py            # /context endpoints
│   │
│   ├── models/                       # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── base.py                   # Base model class
│   │   ├── user.py                   # users table
│   │   ├── preference.py             # user_preferences table
│   │   ├── outfit.py                 # outfits table
│   │   ├── outfit_item.py            # outfit_items table
│   │   ├── theory.py                 # theories table
│   │   └── share_record.py           # share_records table
│   │
│   ├── schemas/                      # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py                   # Auth request/response
│   │   ├── user.py                   # User schemas
│   │   ├── outfit.py                 # Outfit schemas
│   │   ├── wardrobe.py               # Wardrobe schemas
│   │   └── common.py                 # Shared schemas
│   │
│   ├── services/                     # Business logic
│   │   ├── __init__.py
│   │   ├── auth.py                   # Auth service
│   │   ├── user.py                   # User service
│   │   ├── outfit.py                 # Outfit generation
│   │   ├── ai_orchestrator.py        # AI pipeline orchestration
│   │   ├── storage.py                # OSS operations
│   │   └── sms.py                    # SMS sending
│   │
│   ├── integrations/                 # External APIs
│   │   ├── __init__.py
│   │   ├── alibaba_vision.py         # Alibaba Vision API
│   │   ├── tongyi_qianwen.py         # Tongyi Qianwen API
│   │   ├── alibaba_oss.py            # Alibaba OSS
│   │   ├── wechat.py                 # WeChat OAuth
│   │   └── weather.py                # Weather API
│   │
│   ├── core/                         # Core utilities
│   │   ├── __init__.py
│   │   ├── security.py               # JWT + encryption
│   │   ├── exceptions.py             # Custom exceptions
│   │   └── logging.py                # Logging config
│   │
│   └── db/                           # Database
│       ├── __init__.py
│       ├── session.py                # Session management
│       └── init_db.py                # DB initialization
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                   # pytest fixtures
│   ├── unit/
│   │   ├── services/
│   │   └── models/
│   ├── integration/
│   │   ├── api/
│   │   └── db/
│   └── e2e/
│
└── scripts/
    ├── init_db.py                    # Database setup
    ├── seed_data.py                  # Test data
    └── backup.sh                     # Backup script
```

---

### Architectural Boundaries

#### API Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                      Mobile App (dali-mobile)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Screens   │──│   Hooks     │──│  Services   │              │
│  │  (app/)     │  │  (hooks/)   │  │ (services/) │              │
│  └─────────────┘  └─────────────┘  └──────┬──────┘              │
└────────────────────────────────────────────┼─────────────────────┘
                                             │ HTTPS/REST
                                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API (dali-api)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Routes    │──│  Services   │──│   Models    │              │
│  │  (api/v1/)  │  │ (services/) │  │  (models/)  │              │
│  └─────────────┘  └─────────────┘  └──────┬──────┘              │
└────────────────────────────────────────────┼─────────────────────┘
                                             │ SQL
                                             ▼
                                    ┌─────────────────┐
                                    │   PostgreSQL    │
                                    └─────────────────┘
```

#### Data Flow

```
User Action → Screen → Hook → Service → API → Backend Service → DB
                                  ↓
                             SQLite (offline cache)
```

#### Integration Points

| Integration | Mobile Location | Backend Location |
|-------------|-----------------|------------------|
| Alibaba OSS | `services/upload.ts` | `integrations/alibaba_oss.py` |
| Vision API | - | `integrations/alibaba_vision.py` |
| Tongyi Qianwen | - | `integrations/tongyi_qianwen.py` |
| WeChat OAuth | `services/auth.ts` | `integrations/wechat.py` |
| SMS | - | `services/sms.py` |
| Weather | - | `integrations/weather.py` |

---

### Cross-Cutting Concerns Location

| Concern | Mobile | Backend |
|---------|--------|---------|
| Authentication | `stores/authStore.ts`, `services/api.ts` (interceptor) | `core/security.py`, `api/deps.py` |
| Error Handling | `services/api.ts`, Root `ErrorBoundary` | `core/exceptions.py`, middleware |
| Logging | Sentry SDK | `core/logging.py` |
| Offline Support | `stores/offlineStore.ts`, `utils/storage.ts` | N/A |
| Validation | `utils/validation.ts` | `schemas/*.py` (Pydantic) |

---

### Development Workflow

**Mobile Development:**
```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Build for testing (local)
npx expo run:ios --configuration Release

# Build for release (EAS)
eas build --platform ios --profile production
```

**Backend Development:**
```bash
# Start with Docker
docker-compose -f docker-compose.dev.yml up

# Run locally
poetry run uvicorn app.main:app --reload

# Run migrations
poetry run alembic upgrade head

# Run tests
poetry run pytest
```

---

## Architecture Validation Results

_Validation completed on 2026-01-03._

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts:
- Expo SDK 51+ + React Native: Official support, stable
- FastAPI + SQLAlchemy 2.0: Async compatibility, mature ecosystem
- Zustand + React Query: Complementary (client vs server state), no overlap
- Expo SQLite + PostgreSQL: Clear offline/cloud separation
- Axios + JWT: Interceptor support for token refresh

**Pattern Consistency:**
- Naming conventions are consistent across frontend (camelCase) and backend (snake_case for DB, camelCase for API)
- Error handling patterns unified with standardized error structure
- State management patterns clearly separated (Zustand for client, React Query for server)

**Structure Alignment:**
- Project structure directly maps to technology decisions
- Component boundaries respect the chosen patterns
- Integration points are clearly defined in specific directories

### Requirements Coverage Validation ✅

**Functional Requirements Coverage (65/65):**

| Category | FR Count | Coverage | Key Components |
|----------|----------|----------|----------------|
| User Account (FR1-8) | 8 | ✅ 100% | authStore, auth.ts, onboarding/ |
| Photography (FR9-17) | 9 | ✅ 100% | expo-camera, upload.ts, CameraView |
| AI Recommendations (FR18-27) | 10 | ✅ 100% | ai_orchestrator.py, alibaba_vision.py |
| Knowledge Education (FR28-34) | 7 | ✅ 100% | TheoryVisualization, ColorWheel |
| History Management (FR35-42) | 8 | ✅ 100% | expo-sqlite, sync.ts, offlineStore |
| Sharing (FR43-49) | 7 | ✅ 100% | ShareTemplate, share.ts |
| Occasion-Based (FR50-57) | 8 | ✅ 100% | context.ts, weather.py, OccasionCard |
| System Capabilities (FR58-65) | 8 | ✅ 100% | usePermissions, ErrorBoundary |

**Non-Functional Requirements Coverage:**

| NFR | Requirement | Architectural Support |
|-----|-------------|----------------------|
| NFR-P1 | AI generation < 5s | ✅ Parallel API calls + skeleton screens + progressive loading |
| NFR-P7 | History query < 200ms | ✅ SQLite local storage |
| NFR-S1 | HTTPS/TLS 1.2+ | ✅ All API communication encrypted |
| NFR-S2 | AES-256 encryption | ✅ OSS SSE + SecureStore |
| NFR-R1 | 99.5% availability | ✅ Graceful degradation + retry mechanisms |
| NFR-R10 | Auto-retry | ✅ Exponential backoff (3 attempts) |
| NFR-U6 | Offline browsing | ✅ SQLite local storage + sync queue |
| NFR-AI4 | Failure rate < 5% | ✅ AI → Rule engine → Cache fallback chain |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ All critical technology decisions documented with versions
- ✅ Implementation patterns include concrete code examples
- ✅ Naming conventions cover all layers (DB, API, Frontend)
- ✅ Error handling patterns are comprehensive

**Structure Completeness:**
- ✅ Mobile project: ~50 files/directories defined
- ✅ Backend project: ~40 files/directories defined
- ✅ Requirements-to-directory mapping is explicit
- ✅ Integration points are clearly specified

**Pattern Completeness:**
- ✅ All major conflict points addressed (naming, structure, communication)
- ✅ Anti-patterns documented with correct alternatives
- ✅ Code style enforcement rules are clear

### Gap Analysis Results

**Critical Gaps:** None identified

**Future Enhancements (Non-blocking):**
- 📌 Detailed database schema definitions (to be refined in Epics phase)
- 📌 Specific AI prompt templates (to be designed during implementation)
- 📌 Monitoring dashboard specifications (post-MVP optimization)
- 📌 i18n infrastructure details (when multi-language support is needed)

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium)
- [x] Technical constraints identified (iOS 14+, Expo SDK 51+)
- [x] Cross-cutting concerns mapped (8 concerns)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established (DB, API, Frontend)
- [x] Structure patterns defined
- [x] Communication patterns specified (API responses, events)
- [x] Process patterns documented (error handling, loading states)

**✅ Project Structure**
- [x] Complete directory structure defined (Mobile + Backend)
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
1. Clear separation of concerns (mobile/backend, offline/online)
2. Comprehensive technology stack with proven compatibility
3. Detailed implementation patterns prevent AI agent conflicts
4. Full requirements coverage with explicit mapping
5. Cost-effective infrastructure choices (~¥500-800/year)

**Areas for Future Enhancement:**
1. Database schema details (Epics phase)
2. AI prompt engineering (implementation phase)
3. Performance monitoring dashboards (post-MVP)
4. Multi-language support infrastructure (future releases)

### Implementation Handoff

**AI Agent Guidelines:**

1. **Follow all architectural decisions** exactly as documented
2. **Use implementation patterns** consistently across all components
3. **Respect project structure** and boundaries
4. **Refer to this document** for all architectural questions
5. **Check existing patterns** before creating new ones

**First Implementation Priority:**

```bash
# Mobile project initialization
npx create-expo-app@latest dali-mobile

# Backend project initialization
mkdir dali-api && cd dali-api
poetry init
poetry add fastapi uvicorn sqlalchemy alembic
```

**Recommended Epic Sequence:**
1. Epic 0: Project Setup & Foundation
2. Epic 1: Authentication & Onboarding
3. Epic 2: Camera & Photo Upload
4. Epic 3: AI Recommendation Engine
5. Epic 4: History & Offline Support
6. Epic 5: Sharing & Social Integration

---

## Document Complete

**Architecture Document Statistics:**
- Total sections: 7 major sections
- Decisions documented: 25+ architectural decisions
- Patterns defined: 15+ implementation patterns
- Files/directories specified: 90+ locations
- Requirements covered: 65 FR + 10+ NFR

**Next Steps:**
1. Run **Implementation Readiness Review** [IR] to validate against PRD/UX
2. Create **Epics & Stories** to break down into implementable units
3. Start **Sprint Planning** to begin development

---

_Architecture document completed on 2026-01-03 by Winston (Architect Agent) in collaboration with Xiaoshaoqian._

---

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED

**Total Steps Completed:** 8
**Date Completed:** 2026-01-03
**Document Location:** _bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**Complete Architecture Document**

- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**Implementation Ready Foundation**

- 25+ architectural decisions made
- 15+ implementation patterns defined
- 90+ files/directories specified
- 65 functional requirements fully supported

**AI Agent Implementation Guide**

- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing the dali (搭理) project. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**

```bash
# Mobile project initialization
npx create-expo-app@latest dali-mobile

# Backend project initialization
mkdir dali-api && cd dali-api
poetry init
poetry add fastapi uvicorn sqlalchemy alembic
```

**Development Sequence:**

1. Initialize project using documented starter template
2. Set up development environment per architecture
3. Implement core architectural foundations
4. Build features following established patterns
5. Maintain consistency with documented rules

### Quality Assurance Checklist

**Architecture Coherence**

- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**Requirements Coverage**

- [x] All 65 functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**Implementation Readiness**

- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**Solid Foundation**
The chosen Expo starter template and FastAPI backend provide a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
