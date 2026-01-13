/**
 * API Configuration for Dali App
 * Backend API endpoints and configuration
 *
 * @see _bmad-output/planning-artifacts/architecture.md#API Endpoint Structure
 */

// Base URL for API calls - update this for different environments
export const API_BASE_URL = __DEV__
  ? 'http://dali-api.xiaosq.cn/api/v1'
  : 'https://api.dali-app.com/api/v1';

// API version
export const API_VERSION = 'v1';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    sendSms: '/auth/sms/send',
    verifySms: '/auth/sms/verify',
    wechatLogin: '/auth/wechat/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },

  // Users
  users: {
    me: '/users/me',
    preferences: '/users/me/preferences',
    stats: '/users/me/stats',
    avatar: '/users/me/avatar',
    pushToken: '/users/me/push-token',
  },

  // Outfits
  outfits: {
    generate: '/outfits/generate',
    list: '/outfits',
    detail: (id: string) => `/outfits/${id}`,
    like: (id: string) => `/outfits/${id}/like`,
    save: (id: string) => `/outfits/${id}/save`,
    delete: (id: string) => `/outfits/${id}`,
    sync: '/outfits/sync',
  },

  // Wardrobe
  wardrobe: {
    items: '/wardrobe/items',
    itemDetail: (id: string) => `/wardrobe/items/${id}`,
  },

  // Share
  share: {
    generate: '/share/generate',
    track: '/share/track',
  },

  // Context (weather, occasions)
  context: {
    weather: '/context/weather',
    occasions: '/context/occasions',
  },

  // Upload
  upload: {
    signedUrl: '/upload/signed-url',
  },
} as const;

// Request timeout in milliseconds
export const API_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const API_RETRY = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second (exponential backoff: 1s, 2s, 4s)
} as const;
