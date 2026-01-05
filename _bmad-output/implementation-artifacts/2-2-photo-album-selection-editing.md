# Story 2.2: Photo Album Selection & Editing

Status: completed

## Story

As a **user**,
I want to select existing photos from my album and crop them,
So that I can use previously taken photos of my clothing.

## Acceptance Criteria

1. **Given** I am on the Home screen
   **When** I tap "从相册选择" button
   **Then** photo library permission is requested if not granted
   **And** permission dialog shows friendly explanation

2. **Given** photo library permission is granted
   **When** photo picker opens
   **Then** I see my photo library (expo-image-picker)
   **And** I can browse and select a single photo

3. **Given** I select a photo from album
   **When** the photo is selected
   **Then** I see a crop/edit screen with:
     - Photo preview
     - Rotate button (90° clockwise rotation)
     - "完成" confirmation button

4. **Given** I adjust rotation
   **When** I tap "完成"
   **Then** photo is rotated using expo-image-manipulator
   **And** I am navigated to occasion selector screen
   **And** edited photo is temporarily cached

5. **Given** photo library permission is denied
   **When** I tap "从相册选择" again
   **Then** I see prompt to open settings
   **And** "拍照" option remains available

## Tasks / Subtasks

- [x] Task 1: Update usePermissions hook for media library
  - [x] Already implemented in Story 2.1

- [x] Task 2: Create PhotoEditor component
  - [x] Display selected photo
  - [x] Rotate button (90° clockwise)
  - [x] "完成" confirmation button
  - [x] Reselect photo option

- [x] Task 3: Implement album picker flow
  - [x] Request media library permission
  - [x] Open image picker
  - [x] Navigate to editor with selected photo

- [x] Task 4: Implement photo manipulation
  - [x] Use expo-image-manipulator for rotate
  - [x] Resize to 1024px width
  - [x] Compress to 80% quality
  - [x] Save to cache directory
  - [x] Return processed photo URI

## Dev Notes

### Dependencies
- expo-image-picker: Photo selection from library
- expo-image-manipulator: Rotate and resize processing
- expo-file-system/legacy: Temporary storage

### Photo Processing
- Resize to 1024px width while maintaining aspect ratio
- Compress to 80% quality JPEG
- Save to FileSystem.cacheDirectory

### Navigation Flow
1. Home → Album picker (modal)
2. Album picker opens automatically on mount
3. If cancelled, navigate back to Home
4. If photo selected, show editor
5. On confirm, process photo and navigate to next screen

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

**Mobile Files Created/Modified:**
- `dali-mobile/app/album/index.tsx` - New album picker and editor screen
- `dali-mobile/app/_layout.tsx` - Added album route with fullScreenModal presentation
- `dali-mobile/app/(tabs)/index.tsx` - Connected album button to navigation
- `dali-mobile/app/camera/index.tsx` - Updated FileSystem import to legacy

## Change Log

- 2026-01-05: Story created and implementation started (Claude Opus 4.5)
- 2026-01-05: Story completed - all tasks done, TypeScript check passing (Claude Opus 4.5)
- 2026-01-05: Code review completed - no code issues found, tests created as part of Epic-wide review (Claude Opus 4.5)
