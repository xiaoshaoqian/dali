# Sprint Change Proposal - Prototype UI Updates

**Date:** 2026-01-15
**Author:** Claude (Correct Course Workflow)
**Status:** ✅ Approved (2026-01-15)

---

## Executive Summary

本提案基于原型更新，对 Epic 3 中的 Story 3.1 和 Story 3.4 进行 Acceptance Criteria 重写，以精确匹配新的 HTML 原型实现。

### Change Trigger
- 原型文件更新: recognition-selection.html, recognition-selection-multi.html, ai-loading-v2.html, outfit-result-gen-v2.html
- 废弃页面: ai-loading.html (旧版)

### Impact Summary
| Story | Change Type | Risk Level |
|-------|-------------|------------|
| Story 3.1 | AC Rewrite | Low |
| Story 3.3 | Minor Update | Low |
| Story 3.4 | AC Rewrite | Low |

---

## Story 3.1: Garment Recognition & Selection - UPDATED AC

### Current AC (To Be Replaced)
Lines 606-635 in epics.md

### New Acceptance Criteria

**Given** user uploads a photo
**When** the image is analyzed by AI
**Then** AI identifies garment(s) with bounding boxes and confidence scores
**And** returns recognition results to the mobile app

---

#### Scenario A: Single Item High Confidence (>85%)

**Given** recognition returns single item with confidence >85%
**When** analysis completes
**Then** navigate directly to **Recognition Confirmation Page** (HTML: `07-flow-pages/recognition-selection.html`)
**And** display:
  - Full-screen photo background with dim overlay (`rgba(0,0,0,0.4)`)
  - Single bounding box with pulsing border animation (`pulse-border 2s infinite`)
  - Corner accents in purple (`#6C63FF`, 4px border, 20×20px)
  - Confidence tag above box: purple background, "已识别 98%" text
  - Recognition card at bottom (slide-up animation 0.5s):
    - Item name (e.g., "米色经典风衣")
    - Category + Style + Season tags
    - "修改" edit button (purple text)
    - "开始搭配" confirm button (black background, 50px height)

**Given** user taps "开始搭配"
**When** confirmation is received
**Then** save garment to Invisible Wardrobe (local SQLite)
**And** navigate to Occasion Selector or AI Loading page

---

#### Scenario B: Multiple Items or Low Confidence (<85%)

**Given** recognition returns multiple items OR confidence <85%
**When** analysis completes
**Then** navigate to **Multi-Selection Page** (HTML: `07-flow-pages/recognition-selection-multi.html`)
**And** display full-screen photo with multiple bounding boxes

**Multi-Selection Page UI Specifications:**

1. **Bounding Boxes (on photo)**
   - Each detected item has a bounding box
   - Unselected: `border: 2px solid rgba(255,255,255,0.4)`, `border-radius: 12px`
   - Selected: `border-color: #6C63FF`, `box-shadow: 0 0 0 9999px rgba(0,0,0,0.5)` (dim overlay)
   - Confidence tag appears only on selected box: "已选主体" with checkmark icon

2. **Selection Footer (bottom gradient area)**
   - Background: `linear-gradient(to top, #000 0%, rgba(0,0,0,0.95) 85%, transparent 100%)`
   - Padding: `50px 0 30px`
   - Header: "选择主体" (18px semibold) + "请选择一件物品作为搭配核心" (13px gray)

3. **Items Carousel**
   - Horizontal scroll, gap: 12px, padding: 0 24px
   - Card size: 100×140px
   - Card style: `rgba(255,255,255,0.1)` background, `backdrop-filter: blur(20px)`, 16px border-radius
   - Selected card: white background, `scale(1.05)`, elevated shadow

4. **Card Content**
   - Thumbnail image: 100% width, 80px height, 10px border-radius
   - Item name: 12px, centered
   - Radio indicator: 16px circle, purple fill when selected with white inner dot

5. **Action Button**
   - "开始搭配" button: purple `#6C63FF`, 56px height, 28px border-radius
   - Right arrow icon included

**Given** user taps a bounding box or carousel card
**When** selection changes
**Then** update both bounding box and carousel card to selected state
**And** scroll selected card into view (smooth scroll, center alignment)
**And** apply dim overlay to non-selected areas

**Given** user taps "开始搭配" with item selected
**When** button is pressed
**Then** save selected garment to Invisible Wardrobe
**And** navigate to AI Loading page (ai-loading-v2.html)

---

## Story 3.3: Progressive Visual Generation - MINOR UPDATE

### Current AC Status
Lines 661-699 in epics.md - **Mostly Accurate**

### Confirmed Specifications (from ai-loading-v2.html)

1. **Header Gradient** (verified):
   - `linear-gradient(180deg, rgba(28,28,46,0.7) 0%, rgba(44,44,84,0.4) 60%, transparent 100%)`

2. **Blur-to-Clear Effect** (verified):
   - Initial: `filter: blur(20px); opacity: 0.6; transform: scale(1.1)`
   - Progress-based: `blurVal = 20 - (progress * 0.2)`
   - Final: `filter: blur(0); opacity: 1`

3. **Auto-Navigation** (add to AC):
   - On completion, 800ms delay before navigating to results-gen-v2
   - Fade out purple overlay before transition

**No major AC changes required - verify implementation matches prototype.**

---

## Story 3.4: Outfit Results Display - UPDATED AC

### Current AC (To Be Replaced)
Lines 700-739 in epics.md

### New Acceptance Criteria

**Given** AI generation is complete
**When** results screen loads
**Then** display **Immersive Result Page** (HTML: `02-outfit-results/outfit-result-gen-v2.html`)
**And** use L5 layout structure (Hero 52% + Content Sheet overlap)

---

#### L5 Layout Structure

1. **Hero Section (52% screen height)**
   - Full-width outfit image, `filter: brightness(0.95)`
   - Floating image tags at bottom-left:
     - Style: `rgba(0,0,0,0.5)` background, `backdrop-filter: blur(8px)`
     - Border: `1px solid rgba(255,255,255,0.2)`
     - Examples: "✨ 韩系简约", "💼 职场通勤"

2. **Floating Header**
   - Position: absolute, top: 0
   - Background: `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)`
   - Nav buttons: 36×36px, `rgba(255,255,255,0.2)` background, blur effect
   - Left: Back button (chevron icon)
   - Right: Share button (upload icon)

3. **Content Sheet (overlapping)**
   - Background: white `#fff`
   - Border-radius: `32px 32px 0 0`
   - Margin-top: `-32px` (overlap effect)
   - Box-shadow: `0 -10px 40px rgba(0,0,0,0.1)`
   - Padding: `24px 20px 100px` (bottom for FAB)

4. **Sheet Handle**
   - Width: 36px, Height: 4px
   - Background: `#E5E5EA`, border-radius: 2px
   - Centered, margin-bottom: 8px

---

#### Content Sheet Components

5. **Info Header**
   - Flex layout: space-between
   - Left side:
     - Outfit title: 24px, font-weight 700, color `#1C1C1E`
     - Subtitle: 13px, color `#8E8E93`, "由 AI 视觉引擎生成"
   - Right side:
     - Match score badge: `#F0EFFF` background, `#6C63FF` text
     - Format: "98%", 14px font-weight 700

6. **Logic Echo Box (AI 搭配策略)**
   - Background: `#FAFAFC`, border-radius: 16px
   - Border: `1px solid #F2F2F7`
   - Padding: 16px
   - Title: 12px uppercase, `#8E8E93`, with info icon
   - Content: 14px, line-height 1.6, color `#3A3A3C`
   - Highlighted keywords: `.hl { color: #6C63FF; font-weight: 600 }`

7. **Items Row (包含单品)**
   - Section label: 15px, font-weight 600, margin-bottom 12px
   - Horizontal scroll, gap: 12px
   - Item thumbnail: 72×72px, `#F9F9F9` background, 16px border-radius
   - Border: `1px solid #F2F2F7`
   - Content: emoji icons (🧥👖👚👠👜)

---

#### Bottom Action Bar

8. **Bottom Bar (fixed)**
   - Position: absolute, bottom: 30px
   - Left/right: 20px padding
   - Flex layout, gap: 12px

9. **Retry Button**
   - Flex: 1
   - Height: 56px, border-radius: 28px
   - Background: white, color: `#1C1C1E`
   - Icon: refresh/retry icon
   - Shadow: `0 8px 24px rgba(0,0,0,0.15)`

10. **Try-On Button (Primary)**
    - Flex: 2
    - Height: 56px, border-radius: 28px
    - Background: `#1C1C1E`, color: white
    - Text: "一键上身" with eye icon
    - Shadow: `0 8px 24px rgba(0,0,0,0.15)`

---

#### Interaction Scenarios

**Given** user taps retry button
**When** button is pressed
**Then** navigate back to AI Loading page (ai-loading-v2.html)
**And** regenerate outfit with same garment

**Given** user taps "一键上身" button
**When** button is pressed
**Then** navigate to Virtual Try-On page
**And** pass current outfit data

---

## Implementation Checklist

### Documents to Update

- [x] **epics.md** - Story 3.1 AC (lines 606-688)
- [x] **epics.md** - Story 3.4 AC (lines 753-858)
- [ ] **epics.md** - HTML prototype references in Overview section (optional cleanup)

### New Prototype References

| Old Reference | New Reference |
|---------------|---------------|
| (none) | `07-flow-pages/recognition-selection.html` |
| (none) | `07-flow-pages/recognition-selection-multi.html` |
| `07-flow-pages/ai-loading.html` | `07-flow-pages/ai-loading-v2.html` |
| `02-outfit-results/outfit-results-page.html` | `02-outfit-results/outfit-result-gen-v2.html` |

### Deprecated Files

- `07-flow-pages/ai-loading.html` (replaced by v2)

---

## Approval

**Proposed By:** Claude (Correct Course Workflow)
**Date:** 2026-01-15

### Sign-off

- [x] Product Owner approval (2026-01-15 17:28)
- [x] Update epics.md with new AC (2026-01-15 17:28)

---

**Next Steps:**
1. Review this proposal
2. If approved, update epics.md
3. Continue with story implementation

