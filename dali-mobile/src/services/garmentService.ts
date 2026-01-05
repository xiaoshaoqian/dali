/**
 * Garment Service
 * Handles garment image analysis via backend Vision API
 */

import { apiClient } from './apiClient';

// Types
export interface ColorInfo {
  hex: string;
  name: string;
  percentage: number;
}

export interface GarmentAnalysisResult {
  garmentType: string;
  primaryColors: ColorInfo[];
  styleTags: string[];
  confidence: number;
}

export interface GarmentAnalysisError {
  error: string;
  code: string;
}

/**
 * Analyze a garment image using Vision API
 * @param imageUrl - URL of the garment image in cloud storage
 * @returns Analysis result with garment type, colors, and style tags
 */
async function analyzeGarment(imageUrl: string): Promise<GarmentAnalysisResult> {
  const response = await apiClient.post<GarmentAnalysisResult>('/garments/analyze', {
    image_url: imageUrl,
  });
  return response.data;
}

export const garmentService = {
  analyzeGarment,
};
