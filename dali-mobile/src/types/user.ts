/**
 * User Profile and Statistics Types
 * Used for personal profile screen and user management
 */

export interface UserProfile {
  id: string;
  phone?: string;
  wechatId?: string;
  nickname: string;
  avatar?: string;
  bio?: string; // User bio/tagline for profile display
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalOutfits: number; // 生成次数
  favoriteCount: number; // 收藏数量
  shareCount: number; // 分享次数
  joinedDays: number; // 加入天数 (for future use)
  aiAccuracy: number; // AI准确度 0-1 (for future use)
}

export interface UpdateUserProfileRequest {
  nickname?: string;
  avatar?: string;
}

export interface UploadAvatarResponse {
  signedUrl: string;
  avatarUrl: string;
}
