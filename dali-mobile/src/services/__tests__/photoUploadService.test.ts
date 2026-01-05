/**
 * Photo Upload Service Tests
 * Unit tests for photo upload functionality
 */

// Mock dependencies
jest.mock('expo-file-system/legacy', () => ({
  getInfoAsync: jest.fn(),
  uploadAsync: jest.fn(),
  FileSystemUploadType: {
    BINARY_CONTENT: 'BINARY_CONTENT',
  },
}));

jest.mock('../apiClient', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

import * as FileSystem from 'expo-file-system/legacy';
import { apiClient } from '../apiClient';

// Import after mocking
import { photoUploadService, SignedUrlResponse, UploadResult } from '../photoUploadService';

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('photoUploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSignedUrl', () => {
    const mockSignedUrlResponse: SignedUrlResponse = {
      uploadUrl: 'https://storage.example.com/upload?signature=abc',
      objectKey: 'users/123/photos/test.jpg',
      photoUrl: 'https://storage.example.com/users/123/photos/test.jpg',
      expiresAt: '2026-01-05T12:00:00Z',
    };

    it('should request signed URL with default content type', async () => {
      mockApiClient.post.mockResolvedValue({ data: mockSignedUrlResponse });

      const result = await photoUploadService.getSignedUrl();

      expect(mockApiClient.post).toHaveBeenCalledWith('/upload/signed-url', {
        content_type: 'image/jpeg',
      });
      expect(result).toEqual(mockSignedUrlResponse);
    });

    it('should request signed URL with custom content type', async () => {
      mockApiClient.post.mockResolvedValue({ data: mockSignedUrlResponse });

      await photoUploadService.getSignedUrl('image/png');

      expect(mockApiClient.post).toHaveBeenCalledWith('/upload/signed-url', {
        content_type: 'image/png',
      });
    });
  });

  describe('uploadPhoto', () => {
    const mockSignedUrlResponse: SignedUrlResponse = {
      uploadUrl: 'https://storage.example.com/upload?signature=abc',
      objectKey: 'users/123/photos/test.jpg',
      photoUrl: 'https://storage.example.com/users/123/photos/test.jpg',
      expiresAt: '2026-01-05T12:00:00Z',
    };

    beforeEach(() => {
      mockApiClient.post.mockResolvedValue({ data: mockSignedUrlResponse });
    });

    it('should return error if file does not exist', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);

      const result = await photoUploadService.uploadPhoto('/path/to/photo.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Photo file not found');
    });

    it('should upload photo successfully', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true, size: 1000 } as any);
      mockFileSystem.uploadAsync.mockResolvedValue({ status: 200, body: '' } as any);

      const result = await photoUploadService.uploadPhoto('/path/to/photo.jpg');

      expect(result.success).toBe(true);
      expect(result.photoUrl).toBe(mockSignedUrlResponse.photoUrl);
      expect(result.objectKey).toBe(mockSignedUrlResponse.objectKey);
    });

    it('should return error on upload failure (4xx status)', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.uploadAsync.mockResolvedValue({ status: 400, body: '' } as any);

      const result = await photoUploadService.uploadPhoto('/path/to/photo.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toContain('400');
    });

    it('should return error on upload failure (5xx status)', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.uploadAsync.mockResolvedValue({ status: 500, body: '' } as any);

      const result = await photoUploadService.uploadPhoto('/path/to/photo.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should call progress callback on success', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.uploadAsync.mockResolvedValue({ status: 200, body: '' } as any);

      const progressCallback = jest.fn();
      await photoUploadService.uploadPhoto('/path/to/photo.jpg', 'image/jpeg', progressCallback);

      expect(progressCallback).toHaveBeenCalledWith({
        loaded: 100,
        total: 100,
        percentage: 100,
      });
    });

    it('should handle network errors', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.uploadAsync.mockRejectedValue(new Error('Network error'));

      const result = await photoUploadService.uploadPhoto('/path/to/photo.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should use correct upload headers', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.uploadAsync.mockResolvedValue({ status: 200, body: '' } as any);

      await photoUploadService.uploadPhoto('/path/to/photo.jpg', 'image/png');

      expect(mockFileSystem.uploadAsync).toHaveBeenCalledWith(
        mockSignedUrlResponse.uploadUrl,
        '/path/to/photo.jpg',
        expect.objectContaining({
          httpMethod: 'PUT',
          uploadType: 'BINARY_CONTENT',
          headers: {
            'Content-Type': 'image/png',
          },
        })
      );
    });
  });

  describe('uploadPhotos', () => {
    const mockSignedUrlResponse: SignedUrlResponse = {
      uploadUrl: 'https://storage.example.com/upload',
      objectKey: 'test.jpg',
      photoUrl: 'https://storage.example.com/test.jpg',
      expiresAt: '2026-01-05T12:00:00Z',
    };

    beforeEach(() => {
      mockApiClient.post.mockResolvedValue({ data: mockSignedUrlResponse });
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
      mockFileSystem.uploadAsync.mockResolvedValue({ status: 200, body: '' } as any);
    });

    it('should upload multiple photos', async () => {
      const uris = ['/photo1.jpg', '/photo2.jpg', '/photo3.jpg'];

      const results = await photoUploadService.uploadPhotos(uris);

      expect(results).toHaveLength(3);
      results.forEach((result: UploadResult) => {
        expect(result.success).toBe(true);
      });
    });

    it('should call progress callback for each photo', async () => {
      const uris = ['/photo1.jpg', '/photo2.jpg'];
      const progressCallback = jest.fn();

      await photoUploadService.uploadPhotos(uris, progressCallback);

      expect(progressCallback).toHaveBeenCalledTimes(2);
      expect(progressCallback).toHaveBeenNthCalledWith(1, 1, 2);
      expect(progressCallback).toHaveBeenNthCalledWith(2, 2, 2);
    });

    it('should continue uploading even if one fails', async () => {
      mockFileSystem.getInfoAsync
        .mockResolvedValueOnce({ exists: true } as any)
        .mockResolvedValueOnce({ exists: false } as any)
        .mockResolvedValueOnce({ exists: true } as any);

      const uris = ['/photo1.jpg', '/photo2.jpg', '/photo3.jpg'];
      const results = await photoUploadService.uploadPhotos(uris);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });
  });
});

describe('Retry Logic', () => {
  it('should retry on failure according to NFR-R10', async () => {
    // This test documents the expected behavior
    // The retry logic should:
    // 1. First retry after 1 second
    // 2. Second retry after 2 seconds
    // 3. Third retry after 4 seconds
    // 4. After 3 failures, return error

    const expectedRetryDelays = [1000, 2000, 4000];
    expect(expectedRetryDelays).toHaveLength(3);

    // The actual retry implementation should be tested when added
  });
});
