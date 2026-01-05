/**
 * Photo Upload Service
 * Handles photo upload to cloud storage via presigned URLs
 * Implements retry logic per NFR-R10: 3 retries with exponential backoff
 */
import * as FileSystem from 'expo-file-system/legacy';

import { apiClient } from './apiClient';

// Retry configuration per NFR-R10
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000, // 1 second, then 2s, then 4s (exponential backoff)
};

// Types
export interface SignedUrlResponse {
  uploadUrl: string;
  objectKey: string;
  photoUrl: string;
  expiresAt: string;
}

export interface UploadResult {
  success: boolean;
  photoUrl?: string;
  objectKey?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get presigned URL for uploading a photo
 */
async function getSignedUrl(contentType: string = 'image/jpeg'): Promise<SignedUrlResponse> {
  const response = await apiClient.post<SignedUrlResponse>('/upload/signed-url', {
    content_type: contentType,
  });
  return response.data;
}

/**
 * Upload photo to cloud storage using presigned URL
 * Implements retry logic per NFR-R10: 3 retries with exponential backoff
 * @param photoUri - Local URI of the photo to upload
 * @param contentType - MIME type of the photo
 * @param onProgress - Optional progress callback
 * @returns Upload result with photo URL
 */
async function uploadPhoto(
  photoUri: string,
  contentType: string = 'image/jpeg',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Check if the file exists first (no retry needed for this)
  const fileInfo = await FileSystem.getInfoAsync(photoUri);
  if (!fileInfo.exists) {
    return {
      success: false,
      error: 'Photo file not found',
    };
  }

  let lastError: string = 'Unknown upload error';

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      // Step 1: Get presigned URL from backend
      const signedUrlResponse = await getSignedUrl(contentType);

      // Step 2: Upload the file to cloud storage
      const uploadResult = await FileSystem.uploadAsync(signedUrlResponse.uploadUrl, photoUri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          'Content-Type': contentType,
        },
      });

      // Check upload success (2xx status codes)
      if (uploadResult.status >= 200 && uploadResult.status < 300) {
        // Report 100% progress on success
        if (onProgress) {
          onProgress({ loaded: 100, total: 100, percentage: 100 });
        }

        return {
          success: true,
          photoUrl: signedUrlResponse.photoUrl,
          objectKey: signedUrlResponse.objectKey,
        };
      } else {
        lastError = `Upload failed with status ${uploadResult.status}`;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown upload error';
    }

    // If we haven't exhausted all retries, wait before next attempt
    if (attempt < RETRY_CONFIG.maxAttempts) {
      const delayMs = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt); // 1s, 2s, 4s
      console.log(`Upload attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: lastError,
  };
}

/**
 * Upload multiple photos
 * @param photoUris - Array of local photo URIs
 * @param onProgress - Optional progress callback for overall progress
 * @returns Array of upload results
 */
async function uploadPhotos(
  photoUris: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < photoUris.length; i++) {
    const result = await uploadPhoto(photoUris[i]);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, photoUris.length);
    }
  }

  return results;
}

export const photoUploadService = {
  getSignedUrl,
  uploadPhoto,
  uploadPhotos,
};
