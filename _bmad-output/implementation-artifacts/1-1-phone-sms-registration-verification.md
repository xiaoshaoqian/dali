# Story 1.1: Phone SMS Registration & Verification

Status: done

## Story

As a **new user**,
I want to register using my phone number with SMS verification,
So that I can create an account quickly and securely.

## Acceptance Criteria

1. **Given** I am on the welcome screen (HTML: `06-welcome-onboarding/welcome-onboarding-page.html`)
   **When** I tap "手机号登录" button
   **Then** I see the phone registration screen with:
   - Phone number input field (placeholder: "请输入手机号")
   - "获取验证码" button (disabled until valid 11-digit number entered)
   - 紫色渐变主题 per UX spec

2. **Given** I enter a valid 11-digit phone number
   **When** I tap "获取验证码"
   **Then** SMS is sent via backend SMS service
   **And** button text changes to "60s 后重新发送" with countdown
   **And** 6-digit verification code input field appears

3. **Given** I receive the SMS code
   **When** I enter the 6-digit code
   **Then** backend verifies the code via `/api/v1/auth/sms/verify`
   **And** if valid, I receive JWT access token (15min expiry) + refresh token (30 days)
   **And** tokens are stored in expo-secure-store (NFR-S3)
   **And** I am navigated to onboarding questionnaire

4. **Given** SMS verification fails
   **When** I enter an incorrect code
   **Then** I see error message: "验证码错误，请重试"
   **And** I can re-enter the code up to 3 times before requesting new SMS

## Tasks / Subtasks

- [x] Task 1: Implement Backend SMS Service (AC: #1, #2)
  - [x] Create `app/services/sms.py` with Alibaba Cloud SMS SDK integration
  - [x] Implement `send_verification_code(phone: str)` function
  - [x] Implement verification code generation (6-digit, 5-min expiry)
  - [x] Create Redis/in-memory storage for verification codes
  - [x] Add rate limiting (max 1 SMS per 60 seconds per phone)

- [x] Task 2: Create Auth API Endpoints (AC: #2, #3, #4)
  - [x] Create `app/api/v1/auth.py` with SMS endpoints
  - [x] Implement `POST /api/v1/auth/sms/send` endpoint
  - [x] Implement `POST /api/v1/auth/sms/verify` endpoint
  - [x] Add JWT token generation in `app/core/security.py`
  - [x] Create User model if not exists (phone, created_at, is_active)
  - [x] Handle both new user registration and existing user login

- [x] Task 3: Create Mobile Phone Input Screen (AC: #1)
  - [x] Create `app/(auth)/phone-login.tsx` screen
  - [x] Implement phone number input with validation (11 digits, starts with 1)
  - [x] Style with purple gradient theme (#6C63FF)
  - [x] Add "获取验证码" button with disabled state

- [x] Task 4: Implement SMS Code Verification Flow (AC: #2, #3)
  - [x] Add verification code input (6 digits, auto-submit)
  - [x] Implement 60-second countdown timer
  - [x] Create `src/services/authService.ts` with SMS APIs
  - [x] Handle API response and token storage

- [x] Task 5: Token Storage & Navigation (AC: #3)
  - [x] Create `src/stores/authStore.ts` Zustand store
  - [x] Implement token storage in expo-secure-store
  - [x] Add navigation to onboarding after successful verification
  - [x] Handle existing user login (skip onboarding)

- [x] Task 6: Error Handling & Edge Cases (AC: #4)
  - [x] Implement error display for invalid code
  - [x] Add retry counter (max 3 attempts)
  - [x] Handle network errors with friendly messages
  - [x] Implement resend SMS functionality

## Dev Notes

### Architecture Patterns and Constraints

**Backend Implementation (Python FastAPI):**

1. **SMS Service Structure** (`app/services/sms.py`):
```python
from alibabacloud_dysmsapi20170525.client import Client
from alibabacloud_dysmsapi20170525 import models as sms_models
from alibabacloud_tea_openapi import models as open_api_models

class SMSService:
    def __init__(self, settings: Settings):
        config = open_api_models.Config(
            access_key_id=settings.ALIBABA_ACCESS_KEY_ID,
            access_key_secret=settings.ALIBABA_ACCESS_KEY_SECRET,
        )
        config.endpoint = "dysmsapi.aliyuncs.com"
        self.client = Client(config)
        self.sign_name = settings.SMS_SIGN_NAME
        self.template_code = settings.SMS_TEMPLATE_CODE

    async def send_verification_code(self, phone: str) -> str:
        """Send SMS verification code, returns code for storage"""
        code = self._generate_code()  # 6-digit random
        request = sms_models.SendSmsRequest(
            phone_numbers=phone,
            sign_name=self.sign_name,
            template_code=self.template_code,
            template_param=f'{{"code":"{code}"}}'
        )
        response = self.client.send_sms(request)
        if response.body.code != "OK":
            raise SMSException(response.body.message)
        return code
```

2. **Verification Code Storage** - Use in-memory dict with TTL for MVP (upgrade to Redis later):
```python
# app/services/verification_store.py
from datetime import datetime, timedelta
from typing import Optional

class VerificationStore:
    def __init__(self):
        self._store: dict[str, tuple[str, datetime]] = {}
        self.code_expiry = timedelta(minutes=5)
        self.rate_limit = timedelta(seconds=60)

    def store_code(self, phone: str, code: str) -> None:
        self._store[phone] = (code, datetime.utcnow())

    def verify_code(self, phone: str, code: str) -> bool:
        if phone not in self._store:
            return False
        stored_code, created_at = self._store[phone]
        if datetime.utcnow() - created_at > self.code_expiry:
            del self._store[phone]
            return False
        return stored_code == code

    def can_send(self, phone: str) -> bool:
        if phone not in self._store:
            return True
        _, created_at = self._store[phone]
        return datetime.utcnow() - created_at >= self.rate_limit
```

3. **JWT Token Generation** (`app/core/security.py`):
```python
from datetime import datetime, timedelta, UTC
from jose import jwt
from passlib.context import CryptContext

ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30

def create_access_token(user_id: str, secret_key: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user_id, "exp": expire, "type": "access"},
        secret_key,
        algorithm="HS256"
    )

def create_refresh_token(user_id: str, secret_key: str) -> str:
    expire = datetime.now(UTC) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": user_id, "exp": expire, "type": "refresh"},
        secret_key,
        algorithm="HS256"
    )
```

4. **Auth API Endpoints** (`app/api/v1/auth.py`):
```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

router = APIRouter(prefix="/auth", tags=["auth"])

class SendSMSRequest(BaseModel):
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$")

class VerifySMSRequest(BaseModel):
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$")
    code: str = Field(..., min_length=6, max_length=6)

class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str
    expiresIn: int
    isNewUser: bool

@router.post("/sms/send")
async def send_sms(request: SendSMSRequest):
    # Rate limit check, send SMS, store code
    pass

@router.post("/sms/verify", response_model=TokenResponse)
async def verify_sms(request: VerifySMSRequest):
    # Verify code, create/get user, generate tokens
    pass
```

**Mobile Implementation (React Native + Expo):**

1. **Auth Service** (`src/services/authService.ts`):
```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export const authService = {
  async sendSMS(phone: string): Promise<void> {
    await axios.post(`${API_BASE}/api/v1/auth/sms/send`, { phone });
  },

  async verifySMS(phone: string, code: string): Promise<TokenResponse> {
    const { data } = await axios.post(`${API_BASE}/api/v1/auth/sms/verify`, {
      phone,
      code
    });
    await this.storeTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync('accessToken');
  },
};
```

2. **Auth Store** (`src/stores/authStore.ts`):
```typescript
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isNewUser: boolean;
  userId: string | null;
  setAuthenticated: (userId: string, isNewUser: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isNewUser: false,
  userId: null,
  setAuthenticated: (userId, isNewUser) => set({
    isAuthenticated: true,
    userId,
    isNewUser
  }),
  logout: () => set({
    isAuthenticated: false,
    userId: null,
    isNewUser: false
  }),
}));
```

3. **Phone Input Component** - Key styling requirements:
```typescript
// Colors from UX Spec
const colors = {
  primary: '#6C63FF',
  secondary: '#9D94FF',
  accent: '#FF6B9D',
  background: '#F2F2F7',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  error: '#FF3B30',
};

// Button gradient: linear-gradient(135deg, #6C63FF 0%, #9D94FF 100%)
// Font: SF Pro (system default on iOS)
// Border radius: 12px for buttons, 16px for cards
```

4. **Phone Validation Regex**:
```typescript
const CHINA_PHONE_REGEX = /^1[3-9]\d{9}$/;
const isValidPhone = (phone: string) => CHINA_PHONE_REGEX.test(phone);
```

### Project Structure Notes

**Backend Files to Create/Modify:**
```
dali-api/
├── app/
│   ├── api/v1/
│   │   └── auth.py          # NEW: SMS auth endpoints
│   ├── models/
│   │   └── user.py          # MODIFY: Add User model implementation
│   ├── schemas/
│   │   └── auth.py          # MODIFY: Add request/response schemas
│   ├── services/
│   │   ├── sms.py           # MODIFY: Implement Alibaba SMS SDK
│   │   ├── auth.py          # MODIFY: Implement auth business logic
│   │   └── verification_store.py  # NEW: In-memory code storage
│   └── core/
│       └── security.py      # MODIFY: Add JWT functions
```

**Mobile Files to Create/Modify:**
```
dali-mobile/
├── app/
│   └── (auth)/
│       ├── _layout.tsx      # NEW: Auth flow layout
│       ├── index.tsx        # NEW: Welcome screen
│       └── phone-login.tsx  # NEW: Phone input screen
├── src/
│   ├── services/
│   │   └── authService.ts   # NEW: Auth API service
│   ├── stores/
│   │   └── authStore.ts     # NEW: Auth state management
│   ├── components/
│   │   └── auth/
│   │       ├── PhoneInput.tsx     # NEW: Phone input component
│   │       └── CodeInput.tsx      # NEW: OTP input component
│   └── hooks/
│       └── useCountdown.ts  # NEW: SMS countdown timer hook
```

### Technology Version Notes

**Alibaba Cloud SMS SDK (2025-2026):**
- Package: `alibabacloud-dysmsapi20170525`
- Install: `poetry add alibabacloud-dysmsapi20170525`
- Region endpoint: `dysmsapi.aliyuncs.com` (China mainland)
- Template format: `{"code":"${code}"}` - code is 6 digits
- Sign name (签名) and template code must be pre-approved in Alibaba Cloud console
- Rate limiting: Alibaba Cloud has built-in rate limits (~100/day per phone by default)

**React Native OTP Input Best Practices:**
- Use `react-native-otp-entry` for OTP input UI (supports auto-fill on iOS)
- Auto-detection via SMS Retriever API only works on Android
- On iOS, rely on iOS 12+ auto-fill feature (reads from Messages app)
- OTP input should auto-submit when all 6 digits entered

**expo-secure-store Notes:**
- Automatically uses iOS Keychain on iOS
- Data persists across app reinstalls
- Max value size: 2KB
- Synchronous API deprecated - use async methods

### API Response Patterns

**Success - Send SMS:**
```json
{
  "message": "验证码已发送"
}
```

**Success - Verify SMS:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "isNewUser": true
}
```

**Error - Rate Limited:**
```json
{
  "code": "AUTH_RATE_LIMITED",
  "message": "请等待 60 秒后再试",
  "details": {
    "retryAfter": 45
  }
}
```

**Error - Invalid Code:**
```json
{
  "code": "AUTH_INVALID_CODE",
  "message": "验证码错误，请重试",
  "details": {
    "attemptsRemaining": 2
  }
}
```

### Previous Story Learnings (Story 0-2)

From Story 0-2 implementation:
1. **Poetry 2.x** uses `[project]` table for PEP-621 metadata and `tool.poetry` for Poetry-specific config
2. **FastAPI 0.128.0** installed with standard extras
3. **SQLAlchemy 2.0.45** with asyncio support - use `async_sessionmaker`
4. **Ruff** replaces Black, isort, flake8 for linting
5. All placeholder modules already exist - modify them, don't create new

### Testing Requirements

**Backend Tests:**
```python
# tests/unit/test_auth.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_send_sms_valid_phone(client: AsyncClient):
    response = await client.post("/api/v1/auth/sms/send", json={
        "phone": "13800138000"
    })
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_send_sms_invalid_phone(client: AsyncClient):
    response = await client.post("/api/v1/auth/sms/send", json={
        "phone": "invalid"
    })
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_verify_sms_wrong_code(client: AsyncClient):
    response = await client.post("/api/v1/auth/sms/verify", json={
        "phone": "13800138000",
        "code": "000000"
    })
    assert response.status_code == 401
    assert response.json()["code"] == "AUTH_INVALID_CODE"
```

**Mobile Tests:**
```typescript
// src/services/__tests__/authService.test.ts
describe('authService', () => {
  it('should validate Chinese phone number', () => {
    expect(isValidPhone('13800138000')).toBe(true);
    expect(isValidPhone('12800138000')).toBe(false);
    expect(isValidPhone('1380013800')).toBe(false);
  });
});
```

### Security Considerations

1. **Rate Limiting**: Max 1 SMS per 60 seconds per phone number
2. **Code Expiry**: 5 minutes from generation
3. **Attempt Limiting**: Max 3 verification attempts per code
4. **Token Security**: Access token 15min, Refresh token 30 days
5. **Secure Storage**: Use expo-secure-store for tokens (iOS Keychain)
6. **HTTPS Only**: All API calls over TLS 1.2+
7. **Phone Validation**: Server-side validation required (don't trust client)

### Anti-Patterns to Avoid

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Storing verification codes in database | Use in-memory store with TTL (Redis for production) |
| Logging SMS codes | Never log verification codes |
| Using `any` type in TypeScript | Define proper types for all API responses |
| Hardcoded API URLs | Use environment variables (EXPO_PUBLIC_API_URL) |
| Sync SecureStore operations | Use async methods only |
| Missing error boundaries | Wrap auth flow in ErrorBoundary |

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- [Source: _bmad-output/project-context.md#Technology Stack & Versions]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System]
- [Web: Alibaba Cloud SMS SDK Python](https://www.alibabacloud.com/help/en/sms/install-python-sdk)
- [Web: React Native OTP Verification Best Practices](https://reactnativeexpert.com/blog/implement-otp-verification-in-react-native-apps/)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Backend placeholder files exist from Story 0-2: `app/services/sms.py`, `app/services/auth.py`, `app/api/v1/auth.py`
- Mobile project structure from Story 0-1 uses Expo Router with `app/` directory
- TypeScript check passed for mobile project
- Ruff lint passed for backend (8/8 tests passed)

### Completion Notes List

1. **Backend SMS Service** - Implemented `SMSService` class with Alibaba Cloud SMS SDK integration
2. **Verification Store** - Created thread-safe in-memory verification code storage with TTL and rate limiting
3. **Auth Service** - Implemented `AuthService` for user registration/login via SMS
4. **Auth API Endpoints** - Created `POST /api/v1/auth/sms/send` and `POST /api/v1/auth/sms/verify`
5. **User Model** - Implemented SQLAlchemy User model with phone, wechat_id, is_active fields
6. **Custom Exceptions** - Added `RateLimitedError`, `SMSError`, `InvalidCodeError` exceptions
7. **Mobile Auth Flow** - Created complete phone-login screen with phone input and OTP verification
8. **Auth Store** - Created Zustand store for authentication state management
9. **Auth Service (Mobile)** - Created authService with SMS APIs and expo-secure-store integration
10. **Countdown Hook** - Created useCountdown hook for SMS resend timer
11. **PhoneInput Component** - Chinese phone validation (1[3-9]xxxxxxxxx pattern)
12. **CodeInput Component** - 6-digit OTP input with auto-submit

### File List

**Backend Files Modified:**
- `dali-api/app/api/v1/auth.py` - SMS endpoints implementation
- `dali-api/app/services/sms.py` - Alibaba SMS SDK integration
- `dali-api/app/services/auth.py` - Auth business logic
- `dali-api/app/models/user.py` - User SQLAlchemy model
- `dali-api/app/schemas/auth.py` - Request/response Pydantic schemas
- `dali-api/app/core/exceptions.py` - Added SMS and rate limit exceptions
- `dali-api/app/main.py` - Added verification code cleanup task startup
- `dali-api/pyproject.toml` - Added B008 to ruff ignore for FastAPI pattern
- `dali-api/poetry.lock` - Updated dependencies

**Backend Files Created:**
- `dali-api/app/services/verification_store.py` - In-memory verification code storage
- `dali-api/alembic/versions/72c396c5e2f2_create_users_table.py` - Users table migration
- `dali-api/tests/unit/test_auth.py` - Auth unit tests

**Mobile Files Modified:**
- `dali-mobile/app/index.tsx` - Auth routing logic
- `dali-mobile/src/hooks/index.ts` - Export useCountdown
- `dali-mobile/src/services/index.ts` - Export authService
- `dali-mobile/src/stores/index.ts` - Export authStore
- `dali-mobile/package.json` - Added Jest test configuration

**Mobile Files Created:**
- `dali-mobile/app/(auth)/phone-login.tsx` - Phone + SMS verification screen
- `dali-mobile/app/(onboarding)/_layout.tsx` - Onboarding layout (placeholder for Story 1.3)
- `dali-mobile/app/(onboarding)/index.tsx` - Onboarding screen (placeholder for Story 1.3)
- `dali-mobile/src/services/authService.ts` - Auth API service
- `dali-mobile/src/services/__tests__/authService.test.ts` - Auth service unit tests
- `dali-mobile/src/stores/authStore.ts` - Auth Zustand store
- `dali-mobile/src/components/auth/PhoneInput.tsx` - Phone input component
- `dali-mobile/src/components/auth/CodeInput.tsx` - OTP input component
- `dali-mobile/src/components/auth/index.ts` - Auth components barrel export
- `dali-mobile/src/hooks/useCountdown.ts` - SMS countdown timer hook

## Change Log

- 2026-01-05: Story created with comprehensive implementation context (Claude Opus 4.5)
- 2026-01-05: Implementation completed - all 6 tasks done, moved to review status (Claude Opus 4.5)
- 2026-01-05: Code review completed - fixed 7 issues (3 HIGH, 4 MEDIUM), added tests (Claude Opus 4.5)
