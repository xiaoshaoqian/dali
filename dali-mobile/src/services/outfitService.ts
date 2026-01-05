/**
 * Outfit Service
 * Handles AI outfit generation via backend API
 */

import { apiClient } from './apiClient';
import type { ColorInfo, GarmentAnalysisResult } from './garmentService';

// Types
export interface OutfitItem {
  itemType: string;
  name: string;
  color: string;
  colorHex: string;
  styleTip: string;
  imageUrl?: string;
}

export interface OutfitTheory {
  colorPrinciple: string;
  styleAnalysis: string;
  bodyTypeAdvice: string;
  occasionFit: string;
  fullExplanation: string;
}

export interface OutfitRecommendation {
  id: string;
  name: string;
  items: OutfitItem[];
  theory: OutfitTheory;
  styleTags: string[];
  confidence: number;
}

export interface GenerateOutfitRequest {
  photoUrl: string;
  occasion: string;
  garmentData: {
    garmentType: string;
    primaryColors: ColorInfo[];
    styleTags: string[];
  };
}

export interface GenerateOutfitResponse {
  success: boolean;
  recommendations: OutfitRecommendation[];
  occasion: string;
  message?: string;
}

/**
 * Generate outfit recommendations based on garment and occasion
 * @param request - Generation request with photo, occasion, and garment data
 * @returns Response with 3 outfit recommendations
 */
async function generateOutfits(request: GenerateOutfitRequest): Promise<GenerateOutfitResponse> {
  const response = await apiClient.post<GenerateOutfitResponse>('/outfits/generate', request);
  return response.data;
}

export const outfitService = {
  generateOutfits,
};
