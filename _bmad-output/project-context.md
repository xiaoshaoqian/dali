---
project_name: 'dali'
user_name: 'Xiaoshaoqian'
date: '2026-01-03'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 50
optimized_for_llm: true
---

# Project Context for AI Agents - Dali (搭理app)

_Critical rules and patterns that AI agents must follow when implementing code. Focus on unobvious details that agents might miss._

---

## Technology Stack & Versions

### Mobile (dali-mobile)

| Technology | Version | Notes |
|------------|---------|-------|
| React Native | Latest (Expo SDK 51+) | Expo managed workflow |
| Expo SDK | 51+ | Required minimum |
| TypeScript | 5.x | Strict mode enabled |
| Expo Router | 3.x | File-based routing |
| Zustand | 4.x | Client state only |
| TanStack React Query | 5.x | Server state |
| React Native Reanimated | 3.x | UI thread animations |
| expo-camera | Latest | Camera integration |
| expo-sqlite | Latest | Offline storage |
| expo-secure-store | Latest | Encrypted storage |
| Axios | Latest | HTTP client |

### Backend (dali-api)

| Technology | Version | Notes |
|------------|---------|-------|
| Python | 3.11+ | Type hints required |
| FastAPI | Latest | Async endpoints |
| SQLAlchemy | 2.0+ | Async ORM |
| PostgreSQL | 15+ | Primary database |
| Alembic | Latest | Migrations |
| Pydantic | 2.x | Schema validation |
| Poetry | Latest | Dependency management |

### Cloud Services

- **Alibaba Cloud OSS** - Image storage (SSE encryption enabled)
- **Alibaba Cloud Vision API** - Garment recognition
- **Tongyi Qianwen API** - AI text generation

---

## Critical Implementation Rules

### UX Design Source of Truth (CRITICAL)

**UI implementation MUST follow the HTML prototypes in `_bmad-output/planning-artifacts/ux-design/pages/`**

⚠️ **Priority Rule: HTML > Markdown**
- **HTML 原型文件是第一优先级** - 直接提取样式、布局、交互
- **Markdown 设计文档是辅助参考** - 仅用于理解意图和组件说明
- 当 HTML 和 Markdown 有差异时，**始终以 HTML 为准**

| Page | HTML Prototype Path |
|------|---------------------|
| 首页 (空状态) | `ux-design/pages/01-home/home-page-empty.html` |
| 首页 (有数据) | `ux-design/pages/01-home/home-page.html` |
| 搭配历史 | `ux-design/pages/04-wardrobe/outfit-page.html` |
| 我的 | `ux-design/pages/05-profile/profile-page.html` |
| 身材档案 | `ux-design/pages/05-profile/body-profile.html` |
| 风格档案 | `ux-design/pages/05-profile/style-profile.html` |
| 设置 | `ux-design/pages/05-profile/settings-page.html` |
| 设置-账号安全 | `ux-design/pages/05-profile/settings-security.html` |
| 设置-隐私 | `ux-design/pages/05-profile/settings-privacy.html` |
| 设置-帮助 | `ux-design/pages/05-profile/settings-help.html` |
| 设置-关于 | `ux-design/pages/05-profile/settings-about.html` |
| 搭配结果 | `ux-design/pages/02-outfit-results/outfit-results-page.html` |
| 搭配详情 | `ux-design/pages/03-outfit-detail/outfit-detail-page.html` |
| AI加载 | `ux-design/pages/07-flow-pages/ai-loading.html` |
| 分享模板 | `ux-design/pages/08-share/share-templates.html` |

**Before implementing ANY screen:**
1. **Read the corresponding HTML prototype file completely** (this is the source of truth)
2. Extract exact colors, spacing, typography from the CSS in HTML
3. Use SVG icons from the prototype (not emoji)
4. Match the exact layout structure from HTML
5. Only refer to .md files for component naming and intent clarification

**Key Design Elements:**
- Primary color: `#6C63FF` (purple)
- Secondary color: `#8578FF` / `#8B7FFF`
- Accent color: `#FF6B9D` (pink)
- Background: `#F2F2F7` (iOS light gray)
- Card background: `#FFFFFF`
- Tab bar: 83px height, blur effect, `#F2F2F7` background
- Header gradient: `linear-gradient(180deg, #6C63FF 0%, #8578FF 100%)`
- Card border-radius: 24px (content cards), 16px (item cards)
- White card overlaps purple header by ~100px with rounded top corners

### TypeScript/React Native Rules

**Configuration:**
- TypeScript strict mode is ENABLED - no `any` types without explicit justification
- Use path aliases: `@/` maps to `src/`
- Target ES2022 for modern JavaScript features

**Import Order (MUST follow):**
```typescript
// 1. React/React Native
import React from 'react';
import { View, Text } from 'react-native';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal absolute imports (@/)
import { useAuthStore } from '@/stores/authStore';

// 4. Relative imports
import { styles } from './styles';
import type { Props } from './types';
```

**Error Handling:**
- Use typed errors with `code`, `message`, `details` structure
- Never catch and swallow errors silently
- Always use ErrorBoundary for component-level errors
- Use Toast for recoverable errors

### Python/FastAPI Rules

**Type Hints:**
- All functions MUST have complete type hints
- Use Pydantic models for all API schemas
- Use `async def` for all database operations

**Import Order:**
```python
# 1. Standard library
from typing import Optional, List

# 2. Third-party
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

# 3. Local imports
from app.models import User
from app.schemas import UserResponse
```

---

## Framework-Specific Rules

### Expo Router Rules

- Route files live in `app/` directory (file-based routing)
- Use route groups: `(auth)/` for unauthenticated, `(tabs)/` for main app
- Layout files are `_layout.tsx`
- Dynamic routes use `[param].tsx` syntax

### State Management Rules

**Zustand (Client State):**
- One store per domain: `authStore`, `userStore`, `offlineStore`
- Store pattern: state + actions in same interface
- Export as `use{Domain}Store`
- NEVER use for server state

**React Query (Server State):**
- Query keys pattern:
```typescript
export const outfitKeys = {
  all: ['outfits'] as const,
  lists: () => [...outfitKeys.all, 'list'] as const,
  list: (filters: OutfitFilters) => [...outfitKeys.lists(), filters] as const,
  detail: (id: string) => [...outfitKeys.all, 'detail', id] as const,
};
```
- Default staleTime: 5 minutes
- Always invalidate on mutations

### React Native Styling Rules

- Use `StyleSheet.create()` - NO inline styles
- Colors from constants: `#6C63FF` (primary), `#FF6B9D` (accent)
- Extract styles to separate file if >50 lines

---

## Testing Rules

**Test Organization:**
- Tests are CO-LOCATED with source files
- Pattern: `ComponentName.test.tsx` next to `ComponentName.tsx`
- Mocks live in `__mocks__/` at project root

**Test Structure:**
```typescript
describe('ComponentName', () => {
  describe('render', () => {
    it('should render correctly', () => {});
  });
  describe('interactions', () => {
    it('should handle tap', () => {});
  });
});
```

**What to Test:**
- All components: render + user interactions
- All hooks: state changes + side effects
- All services: API calls (mocked)

---

## Naming Conventions

### Database (PostgreSQL)

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `users`, `outfit_items` |
| Columns | snake_case | `user_id`, `created_at` |
| Foreign keys | `{table_singular}_id` | `user_id`, `outfit_id` |
| Indexes | `idx_{table}_{column}` | `idx_users_email` |

### API (REST)

| Element | Convention | Example |
|---------|------------|---------|
| Endpoints | plural nouns | `/api/v1/outfits` |
| Path params | camelCase | `/outfits/:outfitId` |
| Query params | camelCase | `?pageSize=10` |
| JSON fields | camelCase | `{ "userId": "..." }` |

### Frontend Code

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `OutfitCard.tsx` |
| Hooks | camelCase + use | `useAuth.ts` |
| Stores | camelCase + Store | `authStore.ts` |
| Constants | UPPER_SNAKE | `API_BASE_URL` |
| Types | PascalCase | `UserPreference` |

---

## API Response Patterns

**Success Response:**
```json
{ "id": "uuid", "name": "...", "items": [...] }
```

**Paginated Response:**
```json
{ "items": [...], "total": 100, "page": 1, "pageSize": 20 }
```

**Error Response:**
```json
{
  "code": "DOMAIN_ERROR_TYPE",
  "message": "User-friendly message",
  "details": { "field": "value" }
}
```

**Error Code Format:** `{DOMAIN}_{ERROR_TYPE}` (e.g., `AUTH_INVALID_TOKEN`, `OUTFIT_NOT_FOUND`)

**Date Format:** ISO 8601 (`2026-01-01T00:00:00Z`)

---

## Critical Anti-Patterns (NEVER DO)

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| `any` type | Define proper types or use `unknown` |
| Inline styles | Use `StyleSheet.create()` |
| Direct API calls in components | Use services + React Query hooks |
| `console.log` in production | Use logging service |
| Hardcoded strings | Use constants or i18n |
| Nested ternaries | Extract to helper or early returns |
| Components >300 lines | Split into smaller components |
| Storing tokens in AsyncStorage | Use `expo-secure-store` |
| Precise location data | City-level only (PIPL compliance) |

---

## File Organization

**Mobile Project:**
```
dali-mobile/
├── app/           # Routes (Expo Router)
├── src/
│   ├── components/   # UI components by domain
│   ├── services/     # API services
│   ├── stores/       # Zustand stores
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Helpers
│   ├── types/        # TypeScript types
│   └── constants/    # App constants
└── assets/        # Static files
```

**Backend Project:**
```
dali-api/
├── app/
│   ├── api/v1/       # Route handlers
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   ├── integrations/ # External APIs
│   └── core/         # Utilities
├── alembic/       # Migrations
└── tests/         # Test files
```

---

## Performance Requirements

| Metric | Requirement |
|--------|-------------|
| AI recommendation | < 5 seconds |
| Image upload | < 2 seconds |
| Cold start | < 3 seconds |
| History query | < 200ms (SQLite) |
| API P95 | < 1 second |

---

## Security Rules

- **Transport:** HTTPS/TLS 1.2+ for all API calls
- **Storage:** AES-256 for photos (OSS SSE)
- **Tokens:** expo-secure-store (iOS Keychain)
- **Personal Data:** Encrypted in expo-secure-store
- **Location:** City-level only (no precise coordinates)
- **Compliance:** China PIPL requirements

---

## Development Commands

**Mobile:**
```bash
npx expo start           # Dev server
npx expo run:ios         # iOS simulator
eas build --platform ios # Production build
```

**Backend:**
```bash
poetry run uvicorn app.main:app --reload  # Dev server
poetry run alembic upgrade head           # Run migrations
poetry run pytest                         # Run tests
```

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Check architecture.md for detailed decisions

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

---

_This context file ensures AI agents implement code consistently with project standards._

_Last Updated: 2026-01-04_
