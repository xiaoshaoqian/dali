/**
 * Occasion Selector Screen
 * Shows occasion selection modal after photo upload
 * Part of Story 3.2: Occasion-Based Recommendation Engine
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { colors } from '@/constants';
import { garmentService, type GarmentAnalysisResult } from '@/services';
import { OccasionSelector, type Occasion } from '@/components/occasion';

type ScreenState = 'analyzing' | 'selecting' | 'generating';

export default function OccasionScreen() {
  const params = useLocalSearchParams<{ photoUrl: string }>();
  const [screenState, setScreenState] = useState<ScreenState>('analyzing');
  const [garmentData, setGarmentData] = useState<GarmentAnalysisResult | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  // Analyze garment on mount
  useEffect(() => {
    if (!params.photoUrl) {
      Alert.alert('错误', '未找到照片', [{ text: '返回', onPress: () => router.back() }]);
      return;
    }

    analyzeGarment();
  }, [params.photoUrl]);

  const analyzeGarment = async () => {
    try {
      setScreenState('analyzing');
      const result = await garmentService.analyzeGarment(params.photoUrl!);
      setGarmentData(result);
      setScreenState('selecting');
      setShowSelector(true);
    } catch (_error) {
      Alert.alert(
        '抱歉',
        '我没看清这件衣服，能换个角度再拍一张吗？',
        [{ text: '重新拍照', onPress: () => router.back() }]
      );
    }
  };

  const handleOccasionConfirm = useCallback((occasion: Occasion) => {
    setShowSelector(false);
    setScreenState('generating');

    // Navigate to AI loading screen with all data
    router.replace({
      pathname: '/ai-loading' as never,
      params: {
        photoUrl: params.photoUrl,
        occasionId: occasion.id,
        occasionName: occasion.name,
        garmentType: garmentData?.garmentType || '',
        styleTags: garmentData?.styleTags?.join(',') || '',
        colors: JSON.stringify(garmentData?.primaryColors || []),
      },
    });
  }, [params.photoUrl, garmentData]);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  // Analyzing state
  if (screenState === 'analyzing') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>正在分析你的衣服...</Text>
        <Text style={styles.loadingSubtext}>识别颜色、款式和风格</Text>
      </View>
    );
  }

  // Generating state (brief transition)
  if (screenState === 'generating') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>准备生成搭配...</Text>
      </View>
    );
  }

  // Occasion selection
  return (
    <View style={styles.container}>
      <OccasionSelector
        visible={showSelector}
        onClose={handleClose}
        onConfirm={handleOccasionConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
