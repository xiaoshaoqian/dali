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

export const visionService = {
    detectMainBody,
    segmentCloth,
};
