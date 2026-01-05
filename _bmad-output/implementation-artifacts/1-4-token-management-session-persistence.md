# Story 1.4: Token Management & Session Persistence

Status: completed

## Story

As a **returning user**,
I want my login session to persist across app restarts,
So that I don't need to log in every time I open the app.

## Acceptance Criteria

1. **Given** I previously logged in and have valid tokens in expo-secure-store
   **When** I open the app
   **Then** authStore checks for stored access token
   **And** if token is valid (not expired), I am navigated directly to Home screen
   **And** if token is expired but refresh token is valid, access token is refreshed via `/api/v1/auth/refresh`

2. **Given** access token expires during app usage
   **When** an API call returns 401 Unauthorized
   **Then** axios interceptor attempts token refresh automatically
   **And** if refresh succeeds, the original request is retried
   **And** if refresh fails, I am logged out and navigated to welcome screen

3. **Given** I tap "退出登录" in Profile settings
   **When** logout is confirmed
   **Then** tokens are removed from expo-secure-store
   **And** authStore state is cleared
   **And** I am navigated to welcome screen

## Tasks / Subtasks

- [x] Task 1: Backend Token Refresh API (AC: #1, #2)
  - [x] Create `POST /api/v1/auth/refresh` endpoint
  - [x] Validate refresh token and issue new access token
  - [x] Handle expired/invalid refresh tokens

- [x] Task 2: Mobile Token Refresh Logic (AC: #1, #2)
  - [x] Add `refreshTokens` method to authService
  - [x] Add `isTokenExpired` method for token validation
  - [x] Add `getValidAccessToken` method (auto-refresh if needed)
  - [x] Update authStore with token refresh logic

- [x] Task 3: Axios Interceptor for Auto-Refresh (AC: #2)
  - [x] Create shared apiClient with interceptors
  - [x] Implement 401 response interceptor
  - [x] Queue requests during token refresh
  - [x] Retry original requests after refresh

- [x] Task 4: Auto-Login on App Start (AC: #1)
  - [x] Enhanced authStore.initialize() with token validation
  - [x] Auto-refresh expired tokens on startup
  - [x] Navigate to appropriate screen based on auth state

- [x] Task 5: Logout Functionality (AC: #3)
  - [x] Logout method in authStore clears tokens
  - [x] Resets app state
  - [x] App navigates to welcome screen (handled by index.tsx)

## Dev Notes

### Token Expiration
- Access token: 15 minutes (900 seconds)
- Refresh token: 30 days
- Token check includes 60-second buffer (refreshes if < 60s remaining)

### API Endpoints
- `POST /api/v1/auth/refresh` - Refresh access token
  - Request: `{ refreshToken: string }`
  - Response: `{ accessToken, refreshToken, expiresIn }`

### Error Codes
- `AUTH_TOKEN_EXPIRED` - Access token expired
- `AUTH_REFRESH_TOKEN_EXPIRED` - Refresh token expired (must re-login)
- `AUTH_INVALID_TOKEN` - Token is invalid

### Token Rotation
- Each refresh issues a new refresh token (token rotation)
- Old refresh tokens are invalidated

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

**Backend Files Created/Modified:**
- `dali-api/app/schemas/auth.py` - Added RefreshTokenRequest and RefreshTokenResponse schemas
- `dali-api/app/core/exceptions.py` - Added TokenExpiredError, RefreshTokenExpiredError, InvalidTokenError
- `dali-api/app/services/auth.py` - Added refresh_tokens method
- `dali-api/app/api/v1/auth.py` - Added POST /auth/refresh endpoint
- `dali-api/tests/unit/test_token_refresh.py` - Token refresh unit tests

**Mobile Files Created/Modified:**
- `dali-mobile/src/services/authService.ts` - Added refreshTokens, isTokenExpired, getValidAccessToken methods
- `dali-mobile/src/services/apiClient.ts` - Created shared axios instance with auto-refresh interceptors, added setOnAuthFailure callback
- `dali-mobile/src/services/__tests__/apiClient.test.ts` - API client unit tests
- `dali-mobile/src/services/index.ts` - Updated exports
- `dali-mobile/src/services/userPreferencesService.ts` - Updated to use shared apiClient
- `dali-mobile/src/stores/authStore.ts` - Enhanced initialize() with auto-refresh, added auth failure callback
- `dali-mobile/app/index.tsx` - Added auth initialization and routing logic

## Change Log

- 2026-01-05: Story created and implementation started (Claude Opus 4.5)
- 2026-01-05: Story completed - all tasks done, TypeScript check passing (Claude Opus 4.5)
- 2026-01-05: Code review completed - fixed 4 issues (2 CRITICAL, 2 MEDIUM): removed SKIP_AUTH_FOR_TESTING=true security bypass, added missing tests, added auth failure logout callback, updated File List (Claude Opus 4.5)
