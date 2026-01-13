/**
 * User Service
 * API calls for user profile and statistics
 */
import { apiClient } from './apiClient';
import type { UserStats, UserProfile, UpdateUserProfileRequest, UploadAvatarResponse } from '@/types/user';

/**
 * Get current user statistics
 * @returns User statistics including outfit count, favorites, shares
 */
export async function getUserStats(): Promise<UserStats> {
  const response = await apiClient.get<UserStats>('/users/me/stats');
  return response.data;
}

/**
 * Get current user profile
 * @returns User profile with id, nickname, avatar, etc
 */
export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/users/me');
  return response.data;
}

/**
 * Update user profile
 * @param updates Partial profile updates (nickname, avatar, etc)
 * @returns Updated user profile
 */
export async function updateUserProfile(updates: UpdateUserProfileRequest): Promise<UserProfile> {
  const response = await apiClient.put<UserProfile>('/users/me', updates);
  return response.data;
}

/**
 * Upload user avatar
 * Multi-step process:
 * 1. Get signed upload URL from backend
 * 2. Upload image to OSS using signed URL
 * 3. Update user profile with new avatar URL
 *
 * @param imageUri Local image URI from ImagePicker
 * @returns Final avatar URL
 */
export async function uploadUserAvatar(imageUri: string): Promise<string> {
  try {
    // Step 1: Get signed upload URL
    const { data: uploadData } = await apiClient.post<UploadAvatarResponse>(
      '/users/me/avatar/upload-url'
    );

    // Step 2: Upload image to OSS
    const imageBlob = await fetch(imageUri).then((r) => r.blob());
    await fetch(uploadData.signedUrl, {
      method: 'PUT',
      body: imageBlob,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    // Step 3: Update user avatar URL
    await updateUserProfile({ avatar: uploadData.avatarUrl });

    return uploadData.avatarUrl;
  } catch (error) {
    // Error will be handled by calling component
    throw error;
  }
}
