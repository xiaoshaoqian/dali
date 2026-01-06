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
  /** Enhanced explanation text (150-200 chars) with **keyword** highlights - Story 4.3 */
  explanation?: string;
}

export interface OutfitRecommendation {
  id: string;
  name: string;
  items: OutfitItem[];
  theory: OutfitTheory;
  styleTags: string[];
  confidence: number;
  /** The occasion this outfit is recommended for - Story 4.2 */
  occasion?: string;
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

// Like/Save response types
export interface LikeOutfitResponse {
  isLiked: boolean;
}

export interface SaveOutfitResponse {
  isFavorited: boolean;
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

/**
 * Toggle like status for an outfit
 * @param outfitId - The outfit ID to like/unlike
 * @returns Response with new like status
 */
async function likeOutfit(outfitId: string): Promise<LikeOutfitResponse> {
  const response = await apiClient.post<LikeOutfitResponse>(`/outfits/${outfitId}/like`);
  return response.data;
}

/**
 * Unlike an outfit (explicit unlike)
 * @param outfitId - The outfit ID to unlike
 * @returns Response with new like status
 */
async function unlikeOutfit(outfitId: string): Promise<LikeOutfitResponse> {
  const response = await apiClient.delete<LikeOutfitResponse>(`/outfits/${outfitId}/like`);
  return response.data;
}

/**
 * Toggle save/favorite status for an outfit
 * @param outfitId - The outfit ID to save/unsave
 * @returns Response with new save status
 */
async function saveOutfit(outfitId: string): Promise<SaveOutfitResponse> {
  const response = await apiClient.post<SaveOutfitResponse>(`/outfits/${outfitId}/save`);
  return response.data;
}

/**
 * Unsave an outfit (explicit unsave)
 * @param outfitId - The outfit ID to unsave
 * @returns Response with new save status
 */
async function unsaveOutfit(outfitId: string): Promise<SaveOutfitResponse> {
  const response = await apiClient.delete<SaveOutfitResponse>(`/outfits/${outfitId}/save`);
  return response.data;
}

export const outfitService = {
  generateOutfits,
  likeOutfit,
  unlikeOutfit,
  saveOutfit,
  unsaveOutfit,
};
