# Story 1.3: Personalized Onboarding Questionnaire

Status: completed

## Story

As a **newly registered user**,
I want to answer 3-5 personalization questions in under 30 seconds,
So that AI can provide accurate outfit recommendations from the start.

## Acceptance Criteria

1. **Given** I just completed phone/WeChat registration
   **When** onboarding flow starts
   **Then** I see progress indicator "1/3" at the top
   **And** I see friendly welcome text: "让 AI 更懂你，3 个问题即可开始"

2. **Step 1 - Body Type Selection (Single-select):**
   **Given** I am on step 1/3
   **When** the screen loads
   **Then** I see 5 illustrated body type cards:
   - 梨形 (Pear)
   - 苹果形 (Apple)
   - 沙漏形 (Hourglass)
   - 直筒形 (Rectangle)
   - 倒三角形 (Inverted Triangle)
   **And** each card has an illustration + label
   **When** I tap a body type card
   **Then** it highlights with purple border `#6C63FF`
   **And** "下一步" button becomes enabled

3. **Step 2 - Style Preferences (Multi-select 1-3):**
   **Given** I tap "下一步" from step 1
   **When** step 2/3 loads
   **Then** I see style preference chips:
   - 简约 (Minimalist)
   - 时尚 (Trendy)
   - 甜美 (Sweet)
   - 知性 (Intellectual)
   - 运动 (Athletic)
   **And** I can select 1-3 styles
   **When** I select at least 1 style
   **Then** "下一步" button is enabled

4. **Step 3 - Common Occasions (Multi-select 1-3):**
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

5. **Given** onboarding is complete
   **When** I reach the Home screen
   **Then** I see personalized greeting using user name

## Tasks / Subtasks

- [x] Task 1: Create Onboarding Questionnaire UI (AC: #1, #2, #3, #4)
  - [x] Create `app/(onboarding)/questionnaire.tsx` main screen
  - [x] Create `src/components/onboarding/BodyTypeCard.tsx` component
  - [x] Create `src/components/onboarding/SelectableChip.tsx` component (for styles and occasions)
  - [x] Create `src/components/onboarding/ProgressIndicator.tsx` component
  - [x] Implement step navigation with animations

- [x] Task 2: Create Types and Options (AC: #2, #3, #4)
  - [x] Create `src/components/onboarding/types.ts` with BodyType, StylePreference, Occasion types
  - [x] Define BODY_TYPES, STYLE_OPTIONS, OCCASION_OPTIONS with Chinese labels

- [x] Task 3: Implement Backend API (AC: #4)
  - [x] Create `app/schemas/user_preferences.py` Pydantic schemas
  - [x] Create `app/models/user_preferences.py` SQLAlchemy model
  - [x] Create `app/services/user_preferences.py` service layer
  - [x] Update `app/api/deps.py` with get_current_user dependency
  - [x] Create `PUT /api/v1/users/me/preferences` endpoint
  - [x] Create `GET /api/v1/users/me/preferences` endpoint
  - [x] Create Alembic migration for user_preferences table

- [x] Task 4: Create Preferences Service (Mobile) (AC: #4)
  - [x] Create `src/services/userPreferencesService.ts`
  - [x] Implement save preferences API call
  - [x] Handle success/error states

- [x] Task 5: Update Navigation Flow (AC: #5)
  - [x] Update onboarding index to redirect to questionnaire
  - [x] Navigate to Home after completion

## Dev Notes

### Data Models

**Body Types:**
```typescript
type BodyType = 'pear' | 'apple' | 'hourglass' | 'rectangle' | 'inverted-triangle';
```

**Style Preferences:**
```typescript
type StylePreference = 'minimalist' | 'trendy' | 'sweet' | 'intellectual' | 'athletic';
```

**Occasions:**
```typescript
type Occasion = 'work' | 'date' | 'party' | 'daily' | 'sports';
```

### API Request/Response

**PUT /api/v1/users/me/preferences**
```json
{
  "bodyType": "hourglass",
  "styles": ["minimalist", "intellectual"],
  "occasions": ["work", "daily"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "bodyType": "hourglass",
  "styles": ["minimalist", "intellectual"],
  "occasions": ["work", "daily"],
  "createdAt": "2026-01-05T12:00:00Z",
  "updatedAt": "2026-01-05T12:00:00Z"
}
```

### UI Colors (from UX spec)
- Primary: `#6C63FF`
- Selected border: `#6C63FF` (2px)
- Background: `#F2F2F7`
- Card background: `#FFFFFF`
- Text primary: `#1C1C1E`
- Text secondary: `#8E8E93`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

**Backend Files Created/Modified:**
- `dali-api/app/schemas/user_preferences.py` - Pydantic schemas for preferences API
- `dali-api/app/models/user_preferences.py` - SQLAlchemy UserPreferences model
- `dali-api/app/models/user.py` - Added preferences relationship (modified)
- `dali-api/app/models/__init__.py` - Export User and UserPreferences (modified)
- `dali-api/app/services/user_preferences.py` - Preferences service layer
- `dali-api/app/api/deps.py` - Added get_current_user dependency (modified)
- `dali-api/app/api/v1/users.py` - User preferences endpoints (modified)
- `dali-api/alembic/versions/97db65a6eeb6_create_user_preferences_table.py` - Migration
- `dali-api/tests/unit/test_user_preferences.py` - Unit tests for preferences API

**Mobile Files Created/Modified:**
- `dali-mobile/src/components/onboarding/types.ts` - TypeScript types and constants
- `dali-mobile/src/components/onboarding/ProgressIndicator.tsx` - Step progress indicator
- `dali-mobile/src/components/onboarding/BodyTypeCard.tsx` - Body type selection card
- `dali-mobile/src/components/onboarding/SelectableChip.tsx` - Multi-select chip component
- `dali-mobile/src/components/onboarding/index.ts` - Barrel export
- `dali-mobile/app/(onboarding)/_layout.tsx` - Onboarding layout component
- `dali-mobile/app/(onboarding)/questionnaire.tsx` - 3-step questionnaire screen
- `dali-mobile/app/(onboarding)/index.tsx` - Redirect to questionnaire (modified)
- `dali-mobile/src/services/userPreferencesService.ts` - API service for preferences
- `dali-mobile/src/services/__tests__/userPreferencesService.test.ts` - Unit tests
- `dali-mobile/src/services/index.ts` - Export userPreferencesService (modified)
- `dali-mobile/src/constants/colors.ts` - Added primaryLight color (modified)

## Change Log

- 2026-01-05: Story created and implementation started (Claude Opus 4.5)
- 2026-01-05: Story completed - all tasks done, all tests passing (Claude Opus 4.5)
- 2026-01-05: Code review completed - fixed 4 issues (2 HIGH, 2 MEDIUM): added missing tests, fixed fake Alembic migration ID, added missing files to File List, extracted hardcoded colors to constants (Claude Opus 4.5)
