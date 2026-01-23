/**
 * SSE (Server-Sent Events) Client Service
 * Handles real-time streaming from the AI generation backend
 *
 * Features:
 * - EventSource-like interface for React Native
 * - Automatic reconnection (up to 3 retries)
 * - Proper cleanup on unmount
 * - Typed event callbacks
 *
 * @see Story 9-6: Frontend SSE Client
 */

import { API_BASE_URL } from '@/constants/api';
import { authService } from '@/services/authService';

// SSE Event types matching backend
export type SSEEventType =
  | 'connected'
  | 'thinking'
  | 'analysis_complete'
  | 'text_chunk'
  | 'image_generating'
  | 'image_ready'
  | 'image_failed'
  | 'complete'
  | 'error'
  | 'done'
  | 'cancelled';

// Event data interfaces
export interface ThinkingEventData {
  message: string;
}

export interface AnalysisCompleteData {
  anchors: Array<{
    x: number;
    y: number;
    category: string;
  }>;
}

export interface TextChunkEventData {
  content: string;
}

export interface ImageGeneratingData {
  prompt?: string;
  message?: string;
}

export interface ImageReadyData {
  url: string;
}

export interface CompleteEventData {
  outfit_id: string;
  generated_image_url: string | null;
}

export interface ErrorEventData {
  message: string;
  code: string;
}

// Union type for all event data
export type SSEEventData =
  | ThinkingEventData
  | AnalysisCompleteData
  | TextChunkEventData
  | ImageGeneratingData
  | ImageReadyData
  | CompleteEventData
  | ErrorEventData
  | Record<string, never>;

// Callback types
export interface SSEEventCallbacks {
  onThinking?: (data: ThinkingEventData) => void;
  onAnalysisComplete?: (data: AnalysisCompleteData) => void;
  onTextChunk?: (data: TextChunkEventData) => void;
  onImageGenerating?: (data: ImageGeneratingData) => void;
  onImageReady?: (data: ImageReadyData) => void;
  onImageFailed?: (data: { message: string }) => void;
  onComplete?: (data: CompleteEventData) => void;
  onError?: (data: ErrorEventData) => void;
  onDone?: () => void;
}

// Request params (updated for new segmentation flow)
export interface GenerateStreamParams {
  selectedItemUrl: string;  // URL of the selected segmented clothing item
  selectedItemDescription: string;  // Description of the selected item
  selectedItemCategory: string;  // Category of the selected item
  occasion: string;  // Selected occasion
  originalImageUrl?: string;  // Optional original uploaded image URL for context
}

// Connection state
export type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'closed' | 'error';

/**
 * SSE Stream connection class
 * Manages a single SSE connection with automatic reconnection
 */
export class SSEConnection {
  private controller: AbortController | null = null;
  private callbacks: SSEEventCallbacks;
  private params: GenerateStreamParams;
  private retryCount = 0;
  private maxRetries = 3;
  private isClosedManually = false;
  private _state: ConnectionState = 'connecting';

  constructor(params: GenerateStreamParams, callbacks: SSEEventCallbacks) {
    this.params = params;
    this.callbacks = callbacks;
  }

  get state(): ConnectionState {
    return this._state;
  }

  /**
   * Start the SSE connection
   */
  async connect(): Promise<void> {
    if (this.isClosedManually) return;

    this._state = this.retryCount > 0 ? 'reconnecting' : 'connecting';
    this.controller = new AbortController();

    try {
      const token = await authService.getAccessToken();
      if (!token) {
        this.handleError({ message: '请先登录', code: 'AUTH_REQUIRED' });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/outfits/generate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          selected_item_url: this.params.selectedItemUrl,
          selected_item_description: this.params.selectedItemDescription,
          selected_item_category: this.params.selectedItemCategory,
          occasion: this.params.occasion,
          original_image_url: this.params.originalImageUrl,
        }),
        signal: this.controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      this._state = 'connected';
      this.retryCount = 0;

      // Process the stream
      await this.processStream(response.body);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Connection was closed manually
        console.log('[SSE] Connection aborted');
        return;
      }

      console.error('[SSE] Connection error:', error);

      // Attempt reconnection
      if (this.retryCount < this.maxRetries && !this.isClosedManually) {
        this.retryCount++;
        console.log(`[SSE] Reconnecting... (attempt ${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        await this.connect();
      } else {
        this._state = 'error';
        this.handleError({
          message: '连接失败，请检查网络后重试',
          code: 'CONNECTION_FAILED',
        });
      }
    }
  }

  /**
   * Process the SSE stream
   */
  private async processStream(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[SSE] Stream ended');
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let currentEvent = '';
        let currentData = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            currentData = line.slice(5).trim();
          } else if (line === '' && currentEvent) {
            // Empty line signals end of event
            this.handleEvent(currentEvent as SSEEventType, currentData);
            currentEvent = '';
            currentData = '';
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('[SSE] Stream processing error:', error);
        this.handleError({
          message: '数据流中断',
          code: 'STREAM_ERROR',
        });
      }
    } finally {
      reader.releaseLock();
      this._state = 'closed';
    }
  }

  /**
   * Handle a parsed SSE event
   */
  private handleEvent(eventType: SSEEventType, dataStr: string): void {
    let data: SSEEventData;
    try {
      data = dataStr ? JSON.parse(dataStr) : {};
    } catch {
      console.warn('[SSE] Failed to parse event data:', dataStr);
      data = {};
    }

    console.log(`[SSE] Event: ${eventType}`, data);

    switch (eventType) {
      case 'connected':
        // Initial connection confirmed
        break;

      case 'thinking':
        this.callbacks.onThinking?.(data as ThinkingEventData);
        break;

      case 'analysis_complete':
        this.callbacks.onAnalysisComplete?.(data as AnalysisCompleteData);
        break;

      case 'text_chunk':
        this.callbacks.onTextChunk?.(data as TextChunkEventData);
        break;

      case 'image_generating':
        this.callbacks.onImageGenerating?.(data as ImageGeneratingData);
        break;

      case 'image_ready':
        this.callbacks.onImageReady?.(data as ImageReadyData);
        break;

      case 'image_failed':
        this.callbacks.onImageFailed?.(data as { message: string });
        break;

      case 'complete':
        this.callbacks.onComplete?.(data as CompleteEventData);
        break;

      case 'error':
        this.handleError(data as ErrorEventData);
        break;

      case 'done':
        this.callbacks.onDone?.();
        this.close();
        break;

      case 'cancelled':
        this.close();
        break;

      default:
        console.warn(`[SSE] Unknown event type: ${eventType}`);
    }
  }

  /**
   * Handle error events
   */
  private handleError(data: ErrorEventData): void {
    this._state = 'error';
    this.callbacks.onError?.(data);
  }

  /**
   * Close the connection
   */
  close(): void {
    this.isClosedManually = true;
    this._state = 'closed';
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
}

/**
 * Create and start a new SSE connection
 */
export function connectToStream(
  params: GenerateStreamParams,
  callbacks: SSEEventCallbacks
): SSEConnection {
  const connection = new SSEConnection(params, callbacks);
  connection.connect().catch(console.error);
  return connection;
}

/**
 * SSE Service singleton for managing connections
 */
class SSEService {
  private activeConnection: SSEConnection | null = null;

  /**
   * Start a new generation stream
   * Closes any existing connection first
   */
  startGeneration(
    params: GenerateStreamParams,
    callbacks: SSEEventCallbacks
  ): SSEConnection {
    // Close existing connection
    this.stopGeneration();

    // Create new connection
    this.activeConnection = connectToStream(params, callbacks);
    return this.activeConnection;
  }

  /**
   * Stop the current generation stream
   */
  stopGeneration(): void {
    if (this.activeConnection) {
      this.activeConnection.close();
      this.activeConnection = null;
    }
  }

  /**
   * Get connection state
   */
  getState(): ConnectionState | null {
    return this.activeConnection?.state ?? null;
  }
}

// Export singleton
export const sseService = new SSEService();

export default sseService;
