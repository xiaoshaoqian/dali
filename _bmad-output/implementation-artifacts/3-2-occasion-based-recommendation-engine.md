# Story 3.2: Occasion-Based Recommendation Engine

Status: done

## Story

As a **user**,
I want to select an occasion (e.g., romantic date, business meeting) and receive 3 tailored outfit recommendations,
So that the AI provides contextually appropriate styling suggestions.

## Acceptance Criteria

1. **Given** photo recognition is complete
   **When** I see the occasion selector modal
   **Then** I see 6 occasion options as icon cards:
     - 浪漫约会 💕 (Romantic Date)
     - 商务会议 💼 (Business Meeting)
     - 职场通勤 🏢 (Workplace Commute)
     - 朋友聚会 🎉 (Friend Gathering)
     - 日常出行 ☕ (Daily Casual)
     - 居家休闲 🏠 (Home Leisure)

2. **Given** occasion options are displayed
   **When** backend analyzes context (time of day, weather via location)
   **Then** a default occasion is suggested and highlighted
   **And** I can override by tapping a different occasion

3. **Given** I select an occasion and tap "生成搭配"
   **When** AI generation starts
   **Then** backend calls `app/services/ai_orchestrator.py` with inputs:
     - Garment attributes (type, colors, style)
     - User preferences (body type, style preferences from onboarding)
     - Selected occasion

4. **Given** AI orchestrator processes the request
   **When** recommendation logic runs
   **Then** 3 outfit combinations are generated using:
     - Rule engine baseline (mock expert-annotated outfit examples)
     - Mock LLM for theory generation
     - Personalization layer based on user preferences
   **And** total generation time is <5 seconds per NFR-P1

## Tasks / Subtasks

- [x] Task 1: Create AI Orchestrator Service (Mock)
  - [x] Create `app/services/ai_orchestrator.py` module
  - [x] Define OutfitRecommendation data class
  - [x] Implement `generate_outfit_recommendations()` method
  - [x] Generate 3 mock outfit combinations per occasion

- [x] Task 2: Create Outfit Schemas
  - [x] Create OutfitItem schema
  - [x] Create OutfitRecommendation schema
  - [x] Create GenerateOutfitRequest/Response schemas

- [x] Task 3: Create Outfit Generation Endpoint
  - [x] Create `/api/v1/outfits/generate` POST endpoint
  - [x] Accept garment data, occasion, user preferences
  - [x] Call AI Orchestrator service
  - [x] Return 3 outfit recommendations

- [x] Task 4: Mobile Integration
  - [x] Create outfitService.ts for API calls
  - [x] Update AI loading screen to call generate endpoint
  - [x] Create outfit results screen to display recommendations
  - [x] Update navigation flow

## Dev Notes

### Mock Implementation

Since actual Tongyi Qianwen API credentials are not available:
- Backend returns realistic mock outfit recommendations
- Each recommendation includes outfit items, theory, and styling tips
- Mock includes variety based on occasion and garment type

### Occasion Types (Chinese)
- 浪漫约会 (Romantic Date)
- 商务会议 (Business Meeting)
- 职场通勤 (Workplace Commute)
- 朋友聚会 (Friend Gathering)
- 日常出行 (Daily Casual)
- 居家休闲 (Home Leisure)

### Outfit Recommendation Structure
Each recommendation includes:
- name: Outfit name (e.g., "职场优雅风")
- items: Array of outfit items (top, bottom, accessory)
- theory: Color theory explanation and styling tips
- styleTags: Array of style tags
- confidence: How well it fits the occasion

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

**Backend Files Created/Modified:**
- dali-api/app/services/ai_orchestrator.py - AI orchestration service with mock recommendations
- dali-api/app/schemas/outfit.py - Outfit-related Pydantic schemas
- dali-api/app/api/v1/outfits.py - Outfit generation endpoint

**Mobile Files Created/Modified:**
- dali-mobile/src/services/outfitService.ts - Outfit generation API client
- dali-mobile/src/services/index.ts - Updated exports
- dali-mobile/app/ai-loading/index.tsx - Updated to call generate API
- dali-mobile/app/outfit-results/index.tsx - New results display screen
- dali-mobile/app/_layout.tsx - Added outfit-results route

## Change Log

- 2026-01-05: Story created and implementation completed (Claude Opus 4.5)
