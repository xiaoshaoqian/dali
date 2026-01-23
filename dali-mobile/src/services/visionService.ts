/**
 * Vision Service
 * Handles image recognition, detection, and segmentation via backend Vision API
 */

import { apiClient } from './apiClient';

// ----- Types -----

export interface DetectionBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface DetectMainBodyResponse {
    box: DetectionBox;
}

export interface SegmentClothResponse {
    origin_image_url: string;
    mask_url: string;
}

// ----- API Functions -----

/**
 * Detect main body (person) in an image
 * @param imageUrl - URL of the image in cloud storage
 * @returns Bounding box coordinates of the detected main body
 */
async function detectMainBody(imageUrl: string): Promise<DetectionBox> {
    const response = await apiClient.post<DetectMainBodyResponse>('/vision/detect/main-body', {
        image_url: imageUrl,
    });
    return response.data.box;
}

/**
 * Segment clothing from an image
 * @param imageUrl - URL of the image in cloud storage
 * @returns URL of the segmented image (cutout with transparent background)
 */
async function segmentCloth(imageUrl: string): Promise<string> {
    const response = await apiClient.post<SegmentClothResponse>('/vision/segment/cloth', {
        image_url: imageUrl,
    });
    return response.data.mask_url;
}

// ----- Visual Analysis Types (Qwen-VL-Max) -----

export interface ClothingItem {
    id: string;
    category: string;
    description: string;
    center_x: number;
    center_y: number;
}

export interface VisualAnalysisResponse {
    items: ClothingItem[];
}

// ----- Visual Analysis API -----

/**
 * Analyze clothing items in an image using Qwen-VL-Max
 * @param imageUrl - URL of the image in cloud storage
 * @returns List of detected clothing items with positions
 */
async function analyzeClothingItems(imageUrl: string): Promise<ClothingItem[]> {
    const response = await apiClient.post<VisualAnalysisResponse>('/garments/visual-analysis', {
        image_url: imageUrl,
    });
    return response.data.items;
}

/**
 * Get image dimensions using React Native's Image.getSize
 * 
 * NOTE: We cannot use OSS image/info API because:
 * - OSS signed URLs have a signature calculated on the original request
 * - Appending ?x-oss-process=image/info changes the request and invalidates the signature
 * - This results in 403 Forbidden errors
 * 
 * Image.getSize works by loading the image headers to get dimensions.
 * For OSS signed URLs, this is the most reliable approach.
 * 
 * @param imageUrl - URL of the image (supports OSS signed URLs)
 * @returns Image dimensions and format
 */
async function getImageInfo(
    imageUrl: string
): Promise<{ width: number; height: number; format: string }> {
    const { Image } = require('react-native');

    return new Promise((resolve) => {
        console.log('[VisionService] Getting image dimensions via Image.getSize');

        // Set a timeout for slow networks
        const timeoutId = setTimeout(() => {
            console.warn('[VisionService] Image.getSize timeout, using fallback dimensions');
            resolve({
                width: 1024,
                height: 1024,
                format: 'jpeg',
            });
        }, 10000); // 10 second timeout

        Image.getSize(
            imageUrl,
            (width: number, height: number) => {
                clearTimeout(timeoutId);
                console.log(`[VisionService] Image dimensions: ${width}x${height}`);
                resolve({
                    width,
                    height,
                    format: 'jpeg', // Assume JPEG for photos
                });
            },
            (error: Error) => {
                clearTimeout(timeoutId);
                console.warn('[VisionService] Image.getSize failed:', error.message);
                // Fallback to reasonable defaults for mobile photos
                // Most phone cameras produce images around 3000x4000 or similar
                // We use 1024x1024 as a safe default since images are resized before upload
                console.warn('[VisionService] Using fallback dimensions: 1024x1024');
                resolve({
                    width: 1024,
                    height: 1024,
                    format: 'jpeg',
                });
            }
        );
    });
}

export const visionService = {
    detectMainBody,
    segmentCloth,
    analyzeClothingItems,
    getImageInfo,
};
