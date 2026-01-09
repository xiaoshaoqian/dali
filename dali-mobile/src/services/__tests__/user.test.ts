/**
 * User Service Tests
 */
import { apiClient } from '../apiClient';
import { getUserStats, getUserProfile, updateUserProfile, uploadUserAvatar } from '../user';
import type { UserStats, UserProfile } from '@/types/user';

// Mock apiClient
jest.mock('../apiClient');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock fetch
global.fetch = jest.fn();

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('should fetch user statistics successfully', async () => {
      const mockStats: UserStats = {
        totalOutfits: 45,
        favoriteCount: 12,
        shareCount: 8,
        joinedDays: 15,
        aiAccuracy: 0.82,
      };

      mockApiClient.get.mockResolvedValue({ data: mockStats });

      const result = await getUserStats();

      expect(result).toEqual(mockStats);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/users/me/stats');
    });

    it('should throw error when API call fails', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(getUserStats()).rejects.toThrow('Network error');
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile: UserProfile = {
        id: 'user-123',
        phone: '13800138000',
        nickname: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-09T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValue({ data: mockProfile });

      const result = await getUserProfile();

      expect(result).toEqual(mockProfile);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/users/me');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user nickname successfully', async () => {
      const mockProfile: UserProfile = {
        id: 'user-123',
        nickname: 'NewName',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-09T00:00:00Z',
      };

      mockApiClient.put.mockResolvedValue({ data: mockProfile });

      const result = await updateUserProfile({ nickname: 'NewName' });

      expect(result.nickname).toBe('NewName');
      expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/users/me', { nickname: 'NewName' });
    });

    it('should update user avatar successfully', async () => {
      const mockProfile: UserProfile = {
        id: 'user-123',
        nickname: 'Test User',
        avatar: 'https://example.com/new-avatar.jpg',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-09T00:00:00Z',
      };

      mockApiClient.put.mockResolvedValue({ data: mockProfile });

      const result = await updateUserProfile({ avatar: 'https://example.com/new-avatar.jpg' });

      expect(result.avatar).toBe('https://example.com/new-avatar.jpg');
    });
  });

  describe('uploadUserAvatar', () => {
    it('should upload avatar successfully', async () => {
      const mockImageUri = 'file:///local/image.jpg';
      const mockSignedUrl = 'https://oss.example.com/signed-url';
      const mockAvatarUrl = 'https://oss.example.com/avatars/user-123.jpg';

      // Mock get signed URL
      mockApiClient.post.mockResolvedValue({
        data: { signedUrl: mockSignedUrl, avatarUrl: mockAvatarUrl },
      });

      // Mock fetch for blob and upload
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          blob: jest.fn().mockResolvedValue(new Blob(['image data'])),
        })
        .mockResolvedValueOnce({ ok: true });

      // Mock update profile
      mockApiClient.put.mockResolvedValue({
        data: {
          id: 'user-123',
          nickname: 'Test User',
          avatar: mockAvatarUrl,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-09T00:00:00Z',
        },
      });

      const result = await uploadUserAvatar(mockImageUri);

      expect(result).toBe(mockAvatarUrl);
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/users/me/avatar/upload-url');
      expect(global.fetch).toHaveBeenCalledWith(mockImageUri);
      expect(global.fetch).toHaveBeenCalledWith(
        mockSignedUrl,
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'image/jpeg' },
        })
      );
      expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/users/me', { avatar: mockAvatarUrl });
    });

    it('should throw error when upload fails', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Upload failed'));

      await expect(uploadUserAvatar('file:///local/image.jpg')).rejects.toThrow('Upload failed');
    });
  });
});
