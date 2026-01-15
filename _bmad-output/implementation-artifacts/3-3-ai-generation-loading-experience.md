# Story 3.3: AI Generation Loading Experience (Skeleton + Progress)

Status: done

## Story

As a **user**,
I want to see an engaging loading animation during the 5-second AI generation,
So that the wait feels purposeful and doesn't cause anxiety.

## Acceptance Criteria

1. **Given** I tap "生成搭配" after selecting occasion
   **When** AI generation starts
   **Then** I see loading screen with:
     - 紫色极光渐变背景
     - 3 outfit card skeletons with pulsing shimmer animation (1.5s cycle, opacity 0.3 → 0.7)
     - Progress bar (0% → 100%)
     - Rotating text messages every 1.5 seconds

2. **Given** skeleton screen is showing
   **When** first outfit completes generation (progressive loading)
   **Then** first skeleton is replaced with actual outfit card
   **And** other 2 skeletons continue pulsing

3. **Given** all 3 outfits are generated
   **When** 5-second generation completes
   **Then** loading screen transitions to results screen with slide-up animation

4. **Given** AI generation fails or times out (>8 seconds)
   **When** error occurs
   **Then** fallback message shows: "AI 正在学习你的风格，多点几次赞会更准确哦！"
   **And** degraded experience still delivers 3 outfit options

## Tasks / Subtasks

- [x] Task 1: Skeleton Loading Animation
  - [x] Create SkeletonCard component with shimmer effect
  - [x] Implement opacity animation (0.3 → 0.7, 1.5s cycle)
  - [x] Display 3 skeleton cards

- [x] Task 2: Progress Indicator
  - [x] Create ProgressBar component with gradient fill
  - [x] Animate from 0% to 100%
  - [x] Show percentage text

- [x] Task 3: Rotating Messages
  - [x] Implement message rotation every 1.5 seconds
  - [x] Add 4 loading messages in Chinese

- [x] Task 4: Error Handling
  - [x] Add timeout handling
  - [x] Show friendly error message
  - [x] Provide fallback navigation

## Dev Notes

### Loading Messages
1. "AI 正在为你挑选最佳搭配..."
2. "分析配色原理中..."
3. "匹配你的风格偏好..."
4. "马上就好，请稍等~"

### Animation Specs
- Skeleton shimmer: 1.5s ease-in-out loop
- Progress bar: Slows down as approaches 90%, completes on API return
- Message rotation: 1.5s interval

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List
- dali-mobile/app/ai-loading/index.tsx - Main loading screen implementation

## Change Log
- 2026-01-05: Story created, implementation already complete from Story 3.2
- 2026-01-15: AC updated per sprint-change-proposal-2026-01-15.md - Rewritten to v2 immersive loading with blur-to-clear effect by Code Review Agent
