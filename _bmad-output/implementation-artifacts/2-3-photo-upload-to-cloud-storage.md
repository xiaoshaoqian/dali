# Story 2.3: Photo Upload to Cloud Storage

Status: done

## Story

As a **developer**,
I want to upload user photos to Alibaba Cloud OSS with signed URLs,
So that photos are securely stored and accessible for AI processing.

## Acceptance Criteria

1. **Given** user has selected/captured a photo
   **When** occasion is confirmed and "生成搭配" is tapped
   **Then** mobile app requests signed upload URL from backend `/api/v1/upload/signed-url`
   **And** backend returns OSS signed URL (expiry: 10 minutes)

2. **Given** signed URL is received
   **When** photo upload starts
   **Then** photo is compressed to max 500KB (maintain aspect ratio)
   **And** upload to OSS begins with progress indicator
   **And** upload completes in <2 seconds on 4G network per NFR-P2

3. **Given** upload succeeds
   **When** OSS returns photo URL
   **Then** photo URL is stored locally and sent to AI generation API
   **And** user sees AI loading screen (skeleton + progress animation)

4. **Given** upload fails (network timeout, OSS error)
   **When** error occurs
   **Then** auto-retry mechanism attempts 3 times with exponential backoff (NFR-R10)
   **And** if all retries fail, show friendly error: "上传失败，请检查网络后重试"
   **And** provide "重试" button

## Tasks / Subtasks

- [x] Task 1: Backend Upload API
  - [x] Create `/api/v1/upload/signed-url` endpoint
  - [x] Generate presigned URL for OSS (mock implementation)
  - [x] Return URL with 10-minute expiry

- [x] Task 2: Mobile Photo Upload Service
  - [x] Create photoUploadService with compress and upload methods
  - [x] Implement photo compression (image-manipulator handles this)
  - [x] Implement upload with FileSystem.uploadAsync
  - [x] Add progress tracking

- [x] Task 3: Connect Camera/Album to Upload Flow
  - [x] Update camera screen to call upload after capture
  - [x] Update album editor to call upload after confirm
  - [x] Show uploading state during upload

## Dev Notes

### Dependencies
- expo-file-system/legacy: Photo compression and file operations
- expo-image-manipulator: Image compression

### Upload Flow
1. Capture/select photo → compress to 500KB max
2. Request signed URL from backend
3. Upload to OSS using signed URL
4. Return final photo URL for AI processing

### Mock Implementation

~~Since actual OSS credentials are not available, backend will return mock signed URLs.
Upload service will simulate the upload process locally.~~

**Updated 2026-01-12**: Real OSS implementation completed. The system now automatically detects OSS credentials:
- **With credentials**: Uses real Alibaba Cloud OSS with presigned URLs
- **Without credentials**: Falls back to mock implementation for development

This allows seamless transition from development to production without code changes.

### Retry Strategy
- First retry: 1 second delay
- Second retry: 2 seconds delay
- Third retry: 4 seconds delay
- After 3 failures: show error and manual retry option

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

**Backend Files Created/Modified:**
- `dali-api/app/api/v1/upload.py` - Upload endpoint for signed URL generation
- `dali-api/app/schemas/upload.py` - Upload request/response schemas
- `dali-api/app/services/storage.py` - Mock OSS storage service
- `dali-api/app/api/v1/router.py` - Added upload router
- `dali-api/tests/unit/test_upload.py` - Upload endpoint unit tests
- `dali-api/tests/unit/test_storage.py` - Storage service unit tests

**Mobile Files Created/Modified:**
- `dali-mobile/src/services/photoUploadService.ts` - Photo upload service with retry logic (NFR-R10)
- `dali-mobile/src/services/__tests__/photoUploadService.test.ts` - Upload service unit tests
- `dali-mobile/src/services/index.ts` - Added photoUploadService export
- `dali-mobile/app/camera/index.tsx` - Added upload flow with uploading state
- `dali-mobile/app/album/index.tsx` - Added upload flow with uploading state

## Change Log

- 2026-01-05: Story created and implementation started (Claude Opus 4.5)
- 2026-01-05: Implementation completed - backend upload API, mobile photoUploadService, camera/album upload integration (Claude Opus 4.5)
- 2026-01-05: Code review completed - fixed 2 issues (1 HIGH, 1 MEDIUM): added missing tests, implemented retry logic with exponential backoff per NFR-R10 (Claude Opus 4.5)
- **2026-01-12: Real OSS integration completed (Claude Sonnet 4.5)**
  - Added `oss2` SDK dependency (v2.19.1)
  - Implemented real `alibaba_oss.py` with full OSS client functionality
  - Updated `storage.py` to auto-detect credentials and switch between real OSS and mock
  - Updated `.env.example` with detailed OSS configuration guide
  - System now production-ready for Alibaba Cloud OSS
