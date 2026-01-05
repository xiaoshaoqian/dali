# Story 2.1: Camera Integration for Photo Capture

Status: completed

## Story

As a **user**,
I want to use my phone's camera to photograph clothing items,
So that I can quickly generate outfit recommendations.

## Acceptance Criteria

1. **Given** I am on the Home screen
   **When** I tap the "拍照" button
   **Then** camera permission is requested if not yet granted
   **And** permission dialog shows friendly explanation

2. **Given** camera permission is granted
   **When** the camera opens
   **Then** I see real-time camera preview (expo-camera)
   **And** I see a capture button at the bottom center
   **And** I see a cancel button at top left
   **And** camera response time is <500ms

3. **Given** camera preview is active
   **When** I tap the capture button
   **Then** photo is taken and preview screen appears
   **And** I see "重拍" (retake) and "使用照片" (use photo) options

4. **Given** I tap "使用照片"
   **When** photo is confirmed
   **Then** I am navigated to occasion selector screen
   **And** photo is temporarily stored in local cache

5. **Given** camera permission is denied
   **When** I tap "拍照" again
   **Then** I see friendly prompt with alternative
   **And** "从相册选择" option is highlighted

## Tasks / Subtasks

- [x] Task 1: Create usePermissions hook for camera permission management
  - [x] Request camera permission with expo-camera
  - [x] Check permission status
  - [x] Handle permission denied state

- [x] Task 2: Create CameraScreen component
  - [x] Real-time camera preview with expo-camera
  - [x] Capture button (circular, prominent)
  - [x] Cancel button (top left)
  - [x] Flash toggle

- [x] Task 3: Create PhotoPreview component
  - [x] Display captured photo
  - [x] "重拍" button (retake)
  - [x] "使用照片" button (use photo)
  - [x] Purple gradient styling

- [x] Task 4: Add navigation routes
  - [x] Add /camera route
  - [x] Navigate from home to camera
  - [x] Navigate from camera to occasion selector (placeholder)

- [x] Task 5: Update Home screen with camera button action
  - [x] Connect "拍照" button to camera flow
  - [x] Handle permission states

## Dev Notes

### Dependencies
- expo-camera: Camera access and preview
- expo-image-manipulator: Photo processing (for later)
- expo-file-system: Temporary photo storage
- expo-haptics: Haptic feedback on capture

### Permission Flow
1. Check permission status first
2. If not determined, show custom explanation modal
3. Then request system permission
4. If denied, show alternative (album selection) and settings prompt

### Photo Storage
- Captured photo saved to FileSystem.cacheDirectory
- URI passed to next screen via navigation params

### Camera Features
- Front/back camera toggle
- Flash on/off toggle
- Full-screen modal presentation
- Haptic feedback on capture

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

**Mobile Files Created/Modified:**
- `dali-mobile/src/hooks/usePermissions.ts` - New hook for camera and media library permissions
- `dali-mobile/src/hooks/index.ts` - Updated exports
- `dali-mobile/app/camera/index.tsx` - New camera screen with preview functionality
- `dali-mobile/app/_layout.tsx` - Added camera route with fullScreenModal presentation
- `dali-mobile/app/(tabs)/index.tsx` - Connected camera button to navigation

## Change Log

- 2026-01-05: Story created and implementation started (Claude Opus 4.5)
- 2026-01-05: Story completed - all tasks done, TypeScript check passing (Claude Opus 4.5)
- 2026-01-05: Code review completed - no code issues found, tests created as part of Epic-wide review (Claude Opus 4.5)
