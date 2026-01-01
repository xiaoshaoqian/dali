---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - product-brief-dali-2025-12-27.md
  - prd.md
  - ux-design-specification.md
  - research/market-ai-fashion-styling-china-research-2025-12-27.md
workflowType: 'architecture'
project_name: 'dali'
user_name: 'Xiaoshaoqian'
date: '2025-12-31'
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

_Next: Implementation Patterns..._
