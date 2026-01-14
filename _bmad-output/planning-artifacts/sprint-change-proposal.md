# Sprint Change Proposal - Profile & Settings UI/UX Alignment

**Date**: 2026-01-14
**Epic Affected**: Epic 7 - Profile & Growth Tracking
**Trigger**: Implementation differs from HTML prototypes for Profile and Settings pages
**Scope Classification**: Moderate - Requires backlog reorganization and navigation structure changes

---

## Section 1: Issue Summary

**Problem Statement**:
The current implementation of the Settings page (`app/settings/index.tsx`) significantly deviates from the approved HTML prototypes. The implementation uses a flat, single-page list structure instead of the hierarchical navigation system specified in the UX design.

**Discovery Context**:
Issue was identified during final review of Epic 7 implementation. User compared the running application against the HTML prototypes and discovered structural and feature mismatches.

**Evidence**:
- **Prototype**: 6 HTML files defining Settings main page + 4 sub-pages (security, privacy, help, about)
- **Implementation**: Single consolidated Settings screen with all options in flat list
- **Missing Features**: Profile edit card, body data management, separate sub-pages, notifications toggle, dark mode toggle

---

## Section 2: Impact Analysis

### Epic Impact
**Epic 7: Profile & Growth Tracking**
- **Story 7.1** (Profile Screen with User Stats): Partially affected - Settings navigation from Profile page exists but leads to incomplete implementation
- **Impact Level**: Story acceptance criteria not fully met - settings navigation requirement exists but implementation doesn't match specified design

### Story Impact
**Current Stories**:
- Story 7.1 AC#8 references settings navigation but doesn't specify detailed settings structure
- No dedicated story exists for Settings page implementation details

**Future Stories Needed**:
- New story required: "Settings Navigation Structure"
- New story required: "Settings Sub-pages Implementation"
- Potential story: "Profile Edit Functionality"

### Artifact Conflicts

**PRD Conflicts**: ✅ No direct conflict
- PRD doesn't specify detailed settings page structure
- Settings functionality mentioned as part of user preferences but not detailed

**Architecture Conflicts**: ✅ No conflict
- Navigation patterns support nested screens
- Expo Router file-based routing can accommodate sub-pages structure

**UI/UX Specification Conflicts**: ❌ **CRITICAL CONFLICT**
- UX Design Specification defines 6 HTML prototypes for Profile/Settings pages
- Current implementation ignores hierarchical navigation specified in prototypes
- Visual design (purple gradient header, profile card layout) not implemented as specified

---

## Section 3: Recommended Approach

**Selected Path**: **Direct Adjustment** (Option 1)

**Rationale**:
1. **Technical Feasibility**: Expo Router supports nested navigation - no architectural barriers
2. **Code Impact**: Settings implementation is isolated in single file, easy to refactor
3. **Timeline Impact**: Moderate effort, no need to rollback completed work
4. **Business Value**: Aligning with approved UX design ensures consistent user experience
5. **Risk Level**: Low - isolated change, well-defined requirements in prototypes

**Effort Estimate**: Medium (2-3 development days)
- Create 4 sub-page components (security, privacy, help, about)
- Refactor main settings page to match card-based layout
- Implement navigation routing between settings pages
- Add missing features (profile edit card, body data, toggles)

**Risk Assessment**: Low
- Clear design specification exists (HTML prototypes)
- No breaking changes to other features
- Isolated to settings section of app

---

## Section 4: Detailed Change Proposals

### Change Group 1: Settings Page Structure

**File**: `app/settings/index.tsx`

**OLD Approach**:
```
Single ScrollView with flat list of all settings options
All sections in one page: Account, Privacy, Help, About
```

**NEW Approach**:
```
Main settings page with navigation items:
- Profile Edit Card (avatar + name at top)
- Account & Body section → navigate to sub-pages
- Preferences section → inline toggles
- Support section → navigate to sub-pages
- Logout button at bottom
```

**Rationale**: Match HTML prototype `settings-page.html` specification for hierarchical navigation and visual design

---

### Change Group 2: Create Settings Sub-pages

**NEW Files Needed**:

1. **`app/settings/security.tsx`**
   - Based on: `settings-security.html` prototype
   - Features: Change password, phone number management, WeChat binding, device management, account deletion

2. **`app/settings/privacy.tsx`**
   - Based on: `settings-privacy.html` prototype
   - Features: System permissions (camera, photo), personalization settings

3. **`app/settings/help.tsx`**
   - Based on: `settings-help.html` prototype
   - Features: FAQ section, contact/feedback form

4. **`app/settings/about.tsx`**
   - Based on: `settings-about.html` prototype
   - Features: Brand info, version (v1.0.2), check updates, user agreement, privacy policy

**Rationale**: UX design specifies separate pages for focused settings categories, improving navigation clarity and reducing cognitive load

---

### Change Group 3: Add Missing Features

**File**: `app/settings/index.tsx`

**Changes**:

1. **Add Profile Edit Card**
   - OLD: No profile edit functionality on settings page
   - NEW: Card at top with avatar + name + edit button
   - Rationale: Matches prototype `settings-page.html` header section

2. **Add Body Data Management**
   - OLD: Missing entirely
   - NEW: Navigation item in "Account & Body" section → links to body data screen
   - Rationale: Critical for AI wardrobe feature, specified in settings-page.html

3. **Add Preference Toggles**
   - OLD: Missing notifications and dark mode
   - NEW: Inline toggles for notifications and dark mode preferences
   - Rationale: Specified in prototype, common user preferences

4. **Update Version**
   - OLD: `v1.0.0`
   - NEW: `v1.0.2`
   - Rationale: Match prototype specification

---

### Change Group 4: Visual Design Alignment

**File**: `app/settings/index.tsx` and new sub-pages

**Changes**:

1. **Purple Gradient Header**
   - Apply purple gradient navigation bar matching profile page design
   - Add back button navigation

2. **Card-based Layout**
   - Replace flat list sections with card-based grouped layout
   - Apply spacing and styling per HTML prototypes

**Rationale**: Visual consistency across Profile and Settings sections as specified in UX design

---

## Section 5: Implementation Handoff

### Change Scope: **Moderate**

**Handoff Recipients**: Development Team + Product Owner

**Responsibilities**:

**Development Team**:
- Create 4 new settings sub-page components
- Refactor main settings page structure
- Implement navigation routing
- Add missing features (profile edit, body data, toggles)
- Apply visual design updates
- Update tests for new navigation structure

**Product Owner / Scrum Master**:
- Review backlog and create new stories:
  - Story: "Settings Navigation Structure Refactor"
  - Story: "Settings Sub-pages Implementation"
  - Story: "Profile Edit Functionality"
- Prioritize stories for current or next sprint
- Update Epic 7 acceptance criteria to explicitly reference settings structure

### Success Criteria

**Functional**:
- [ ] Settings page matches `settings-page.html` layout and navigation structure
- [ ] All 4 sub-pages (security, privacy, help, about) implemented per prototypes
- [ ] Profile edit card functional at top of settings
- [ ] Body data management accessible from settings
- [ ] Notifications and dark mode toggles functional
- [ ] Navigation flows correctly: Main → Sub-page → Back to Main

**Visual**:
- [ ] Purple gradient header applied
- [ ] Card-based layout matches prototypes
- [ ] Spacing, typography, colors match UX specification

**Testing**:
- [ ] Navigation tests cover all settings routes
- [ ] Visual regression tests for settings pages
- [ ] Accessibility tests for new toggles and navigation

### Implementation Priority

**Priority**: High
**Recommended Sprint**: Current sprint (if capacity) or next sprint

**Dependencies**:
- No blocking dependencies
- Can proceed immediately after approval

---

## Approval & Next Steps

**Proposed Resolution**: Implement hierarchical settings navigation structure with 4 sub-pages, matching approved HTML prototypes

**Artifacts to Update**:
- Epic 7: Add explicit acceptance criteria for settings structure
- Create 2-3 new stories for settings implementation
- Update sprint backlog

**Estimated Timeline**: 2-3 development days + testing

**Handoff to**: Development Team (for implementation) + Product Owner (for backlog organization)

---

**Document Generated**: 2026-01-14
**Workflow**: `/bmad:bmm:workflows:correct-course`
**Mode**: Batch
**Status**: Pending User Approval
