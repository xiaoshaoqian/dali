# Tech-Spec: AI Outfit Generation Flow Upgrade

**Created:** 2026-01-18
**Status:** Ready for Development
**Author:** Xiaoshaoqian + AI Assistant

---

## Overview

### Problem Statement

The current AI outfit generation flow has several limitations:

1. **Long Wait Times**: Users experience a blank loading screen with simulated progress - no real feedback
2. **Image-Text Mismatch**: Generated outfit descriptions don't have corresponding visual images
3. **Rigid Interaction**: Recognition uses bounding boxes which feel dated; no intuitive item selection
4. **Mock Data**: All outfit recommendations are pre-configured templates, not real AI generation

### Solution

Upgrade the AI generation pipeline with:

1. **Streaming "Sandwich" Experience**: Real-time text streaming → thinking animation → theory + image fade-in
2. **Anchor Point Selection**: Replace bounding boxes with modern center-point anchors with breathing animations
3. **Img2Img Generation**: Use SiliconFlow FLUX.1-schnell to generate outfit visualization images
4. **One-Shot Visual Analysis**: Single Qwen-VL-Max call for coordinates + category + visual description

### Scope

**In Scope:**
- Backend: SSE streaming endpoint, stream parser, Qwen-VL-Max integration, SiliconFlow Img2Img
- Frontend: Anchor point UI, SSE client, streaming text display, image fade-in
- Data: New outfit record structure with generated image URL

**Out of Scope:**
- Virtual try-on feature (separate epic)
- Social sharing enhancements
- Outfit history refactoring
- Multi-language support

---

## Context for Development

### Codebase Patterns

**Backend (Python/FastAPI):**
- Async/await throughout with SQLAlchemy 2.0+
- Service layer pattern: `app/services/` for business logic
- Integration layer: `app/integrations/` for external APIs
- Custom exceptions in `app/core/exceptions.py`
- Environment config via `app/config.py`

**Frontend (React Native/Expo):**
- Expo Router file-based routing in `app/`
- Services in `src/services/` for API calls
- Zustand stores in `src/stores/`
- React Native Reanimated for animations
- TypeScript interfaces in `src/types/`

### Files to Reference

**Backend - Existing:**
- [dali-api/app/integrations/alibaba_vision.py](dali-api/app/integrations/alibaba_vision.py) - Vision API patterns
- [dali-api/app/services/ai_orchestrator.py](dali-api/app/services/ai_orchestrator.py) - Current orchestration (to be refactored)
- [dali-api/app/api/v1/outfits.py](dali-api/app/api/v1/outfits.py) - Outfit endpoints
- [dali-api/app/config.py](dali-api/app/config.py) - Environment configuration

**Frontend - Existing:**
- [dali-mobile/app/recognition/index.tsx](dali-mobile/app/recognition/index.tsx) - Recognition page (to be modified)
- [dali-mobile/app/ai-loading/index.tsx](dali-mobile/app/ai-loading/index.tsx) - Loading page (to be rewritten)
- [dali-mobile/app/outfit-results/index.tsx](dali-mobile/app/outfit-results/index.tsx) - Results page
- [dali-mobile/src/services/apiClient.ts](dali-mobile/src/services/apiClient.ts) - HTTP client patterns

### Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Visual Analysis Model | Qwen-VL-Max | One-shot analysis: coordinates + category + description in single call |
| Image Generation | SiliconFlow FLUX.1-schnell | Fast Img2Img, supports Chinese prompts, good price/performance |
| Streaming Protocol | SSE (Server-Sent Events) | Native browser support, simpler than WebSocket for one-way streaming |
| Stream Trigger | `<draw_prompt>` XML tag | LLM outputs hidden tag to trigger async image generation |
| Img2Img Strength | 0.3-0.5 (configurable) | Balance between preserving original garment and creative generation |
| Fallback Provider | OpenAI DALL-E 3 | If SiliconFlow fails, degrade gracefully |

---

## Implementation Plan

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
├─────────────────────────────────────────────────────────────────────┤
│  recognition/        │  ai-loading/           │  outfit-results/    │
│  - Anchor points     │  - SSE connection      │  - Image fade-in    │
│  - Item selection    │  - Stream parser       │  - Theory display   │
│  - Start generation  │  - Thinking animation  │                     │
└─────────────────────────────────────────────────────────────────────┘
                              │ SSE
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           BACKEND                                    │
├─────────────────────────────────────────────────────────────────────┤
│  POST /api/v1/outfits/generate-stream                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ StreamingOutfitGenerator                                     │    │
│  │  1. Call Qwen-VL-Max (one-shot analysis)                    │    │
│  │  2. Stream LLM response with <draw_prompt> tag              │    │
│  │  3. Parse stream: text → intercept tag → resume text        │    │
│  │  4. Async trigger SiliconFlow Img2Img                       │    │
│  │  5. Send image_ready event when complete                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │   Qwen-VL-Max     │       │   SiliconFlow     │
        │   (DashScope)     │       │   FLUX.1-schnell  │
        └───────────────────┘       └───────────────────┘
```

### SSE Event Protocol

```typescript
// Event types sent from backend to frontend
type SSEEvent =
  | { event: 'text_chunk', data: { content: string } }           // Streaming text
  | { event: 'thinking', data: { message: string } }              // AI is generating prompt
  | { event: 'image_generating', data: { prompt: string } }       // Image generation started
  | { event: 'image_ready', data: { url: string } }               // Image ready to display
  | { event: 'complete', data: { outfit_id: string } }            // Generation complete
  | { event: 'error', data: { message: string, code: string } }   // Error occurred
```

### Tasks

#### Epic 9: AI Generation Flow Upgrade

##### Story 9-1: Qwen-VL-Max Integration
- [ ] Create `dali-api/app/integrations/qwen_vl.py`
- [ ] Implement `analyze_image_one_shot()` method
- [ ] Return: center coordinates, garment type, visual description
- [ ] Add DASHSCOPE_API_KEY to config
- [ ] Write unit tests with mocked responses

##### Story 9-2: SiliconFlow Img2Img Integration
- [ ] Create `dali-api/app/integrations/siliconflow.py`
- [ ] Implement `generate_img2img()` method
- [ ] Parameters: base_image_url, prompt, strength (default 0.4)
- [ ] Upload generated image to OSS, return URL
- [ ] Add SILICONFLOW_API_KEY to config
- [ ] Implement fallback to DALL-E 3 adapter
- [ ] Write integration tests

##### Story 9-3: Streaming Outfit Generator Service
- [ ] Refactor `dali-api/app/services/ai_orchestrator.py`
- [ ] Create `StreamingOutfitGenerator` class
- [ ] Implement stream parser with `<draw_prompt>` tag detection
- [ ] States: STREAMING_TEXT → BUFFERING_PROMPT → TRIGGERING_IMAGE → STREAMING_TEXT
- [ ] Async image generation (don't block stream)
- [ ] Error handling with graceful degradation

##### Story 9-4: SSE Endpoint Implementation
- [ ] Create `dali-api/app/api/v1/endpoints/sse.py`
- [ ] Implement `POST /api/v1/outfits/generate-stream`
- [ ] Request body: `{ image_url, occasion, selected_item }`
- [ ] Response: SSE stream with event types defined above
- [ ] Add proper CORS headers for SSE
- [ ] Implement request timeout (5 minutes max)
- [ ] Add rate limiting

##### Story 9-5: Frontend Anchor Point UI
- [ ] Modify `dali-mobile/app/recognition/index.tsx`
- [ ] Replace bounding box with center anchor points
- [ ] Anchor point states: default (white dot), selected (purple breathing glow)
- [ ] Minimum spacing algorithm to prevent overlap
- [ ] Link anchor selection with bottom item cards
- [ ] Smooth scroll to selected item card

##### Story 9-6: Frontend SSE Client
- [ ] Create `dali-mobile/src/services/sseService.ts`
- [ ] Implement `connectToStream()` with EventSource
- [ ] Handle all event types with callbacks
- [ ] Implement reconnection logic (max 3 retries)
- [ ] Proper cleanup on unmount

##### Story 9-7: AI Loading Page Rewrite
- [ ] Rewrite `dali-mobile/app/ai-loading/index.tsx`
- [ ] Connect to SSE endpoint on mount
- [ ] Display `text_chunk` events with typewriter effect
- [ ] Show "💭 AI正在构思搭配理论..." during `thinking` event
- [ ] Trigger condition: no new chunk for 1.5 seconds OR explicit `thinking` event
- [ ] Image generation progress indicator
- [ ] Navigate to results when `complete` event received

##### Story 9-8: Outfit Results with Generated Image
- [ ] Modify `dali-mobile/app/outfit-results/index.tsx`
- [ ] Add generated image display section
- [ ] Implement fade-in animation (500ms)
- [ ] Fallback UI if image generation failed
- [ ] Add "重新生成图片" button for retry
- [ ] Add disclaimer text "AI生成示意图，仅供参考"

##### Story 9-9: Data Structure & Database Update
- [ ] Create Alembic migration for outfit table changes
- [ ] Add fields: `generated_image_url`, `anchor_point`, `visual_description`
- [ ] Update Pydantic schemas
- [ ] Update TypeScript types

##### Story 9-10: Error Handling & Fallback
- [ ] Implement image generation retry (max 2 attempts)
- [ ] Text-only fallback if all image attempts fail
- [ ] Format validation regex for LLM output
- [ ] User-friendly error messages in Chinese
- [ ] Logging and monitoring hooks

### Acceptance Criteria

#### Functional
- [ ] **AC-1**: User can tap anchor points to select garment items (Given recognition page, When user taps anchor, Then anchor shows purple breathing glow and bottom card scrolls to item)
- [ ] **AC-2**: Text streams in real-time during generation (Given generation starts, When LLM produces text, Then text appears character-by-character within 100ms)
- [ ] **AC-3**: Thinking animation shows during prompt generation (Given text stream pauses >1.5s, When system generates image prompt, Then "AI正在构思" message appears)
- [ ] **AC-4**: Generated image appears with fade-in (Given image generation completes, When image is ready, Then image fades in over 500ms)
- [ ] **AC-5**: Generation completes within 30 seconds (Given user starts generation, When all steps complete, Then total time < 30s for text + image)

#### Non-Functional
- [ ] **AC-6**: SSE connection handles network interruption gracefully (auto-reconnect up to 3 times)
- [ ] **AC-7**: Image generation failure doesn't block text display
- [ ] **AC-8**: All error messages displayed in Chinese
- [ ] **AC-9**: Generated images stored in OSS with proper lifecycle policy

---

## Additional Context

### Dependencies

**Backend - New Packages:**
```python
# pyproject.toml additions
dashscope = "^1.14.0"        # Qwen-VL-Max via DashScope
httpx = "^0.25.0"            # Async HTTP for SiliconFlow
sse-starlette = "^1.6.0"     # SSE support for FastAPI
```

**Frontend - New Packages:**
```json
// package.json additions (if needed)
// Note: React Native has built-in EventSource support
```

**Environment Variables:**
```bash
# .env additions
DASHSCOPE_API_KEY=sk-xxx           # Alibaba DashScope for Qwen-VL
SILICONFLOW_API_KEY=sk-xxx         # SiliconFlow for FLUX.1
SILICONFLOW_MODEL=black-forest-labs/FLUX.1-schnell
IMG2IMG_STRENGTH=0.4               # 0.3-0.5 recommended
IMG2IMG_TIMEOUT=60                 # seconds
```

### Testing Strategy

**Unit Tests:**
- Mock Qwen-VL-Max responses for coordinate extraction
- Mock SiliconFlow responses for image generation
- Test stream parser state machine transitions
- Test anchor point spacing algorithm

**Integration Tests:**
- End-to-end SSE stream with test LLM
- Image upload to OSS
- Database record creation

**Manual Testing:**
- Visual verification of anchor point animations
- Timing verification of streaming experience
- Error scenario testing (network failure, API timeout)

### Notes

1. **Strength Parameter**: The Img2Img `strength` parameter of 0.4 means 40% variation from original. Test with real images to find optimal balance between preserving garment features and creative styling.

2. **Stream Timeout**: If no SSE event received for 30 seconds, frontend should show error and offer retry.

3. **LLM Prompt Engineering**: The `<draw_prompt>` tag must be clearly instructed in the system prompt. Example:
   ```
   在输出推荐单品后，用 <draw_prompt>英文绘图指令</draw_prompt> 标签包裹图片生成提示词，
   然后继续输出搭配理论解析。标签内容对用户不可见。
   ```

4. **Fallback Chain**: SiliconFlow → DALL-E 3 → Text-only (no image)

5. **Rate Limiting**: Consider 10 generations per user per hour to control costs.

---

## File Change Summary

| Action | File | Description |
|--------|------|-------------|
| CREATE | `dali-api/app/integrations/qwen_vl.py` | Qwen-VL-Max client |
| CREATE | `dali-api/app/integrations/siliconflow.py` | SiliconFlow Img2Img client |
| MODIFY | `dali-api/app/services/ai_orchestrator.py` | Add StreamingOutfitGenerator |
| CREATE | `dali-api/app/api/v1/endpoints/sse.py` | SSE streaming endpoint |
| MODIFY | `dali-api/app/config.py` | Add new API keys |
| CREATE | `dali-api/alembic/versions/xxx_add_generated_image.py` | DB migration |
| MODIFY | `dali-mobile/app/recognition/index.tsx` | Anchor point UI |
| REWRITE | `dali-mobile/app/ai-loading/index.tsx` | SSE streaming display |
| MODIFY | `dali-mobile/app/outfit-results/index.tsx` | Generated image display |
| CREATE | `dali-mobile/src/services/sseService.ts` | SSE client |
| MODIFY | `dali-mobile/src/types/outfit.ts` | New type definitions |
