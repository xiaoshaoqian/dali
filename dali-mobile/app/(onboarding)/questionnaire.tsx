/**
 * Onboarding Questionnaire Screen
 * 3-step personalization flow for new users
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import {
  BodyTypeCard,
  BODY_TYPES,
  BodyType,
  OCCASION_OPTIONS,
  Occasion,
  ProgressIndicator,
  SelectableChip,
  STYLE_OPTIONS,
  StylePreference,
} from '@/components/onboarding';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { userPreferencesService } from '@/services/userPreferencesService';

const TOTAL_STEPS = 3;
const MAX_MULTI_SELECT = 3;

export default function QuestionnaireScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Body type (single select)
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | null>(null);

  // Step 2: Style preferences (multi-select 1-3)
  const [selectedStyles, setSelectedStyles] = useState<StylePreference[]>([]);

  // Step 3: Occasions (multi-select 1-3)
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>([]);

  // Check if current step is valid
  const isStepValid = useCallback(() => {
    switch (currentStep) {
      case 1:
        return selectedBodyType !== null;
      case 2:
        return selectedStyles.length >= 1 && selectedStyles.length <= MAX_MULTI_SELECT;
      case 3:
        return selectedOccasions.length >= 1 && selectedOccasions.length <= MAX_MULTI_SELECT;
      default:
        return false;
    }
  }, [currentStep, selectedBodyType, selectedStyles, selectedOccasions]);

  // Handle style selection
  const handleStyleToggle = (style: StylePreference) => {
    setSelectedStyles((prev) => {
      if (prev.includes(style)) {
        return prev.filter((s) => s !== style);
      }
      if (prev.length >= MAX_MULTI_SELECT) {
        return prev; // Don't add if at max
      }
      return [...prev, style];
    });
  };

  // Handle occasion selection
  const handleOccasionToggle = (occasion: Occasion) => {
    setSelectedOccasions((prev) => {
      if (prev.includes(occasion)) {
        return prev.filter((o) => o !== occasion);
      }
      if (prev.length >= MAX_MULTI_SELECT) {
        return prev; // Don't add if at max
      }
      return [...prev, occasion];
    });
  };

  // Handle next step
  const handleNext = async () => {
    if (!isStepValid()) return;

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final step - save preferences
      await handleComplete();
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Complete onboarding
  const handleComplete = async () => {
    if (!selectedBodyType) return;

    setIsLoading(true);
    setError(null);

    try {
      await userPreferencesService.savePreferences({
        bodyType: selectedBodyType,
        styles: selectedStyles,
        occasions: selectedOccasions,
      });

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (err) {
      const apiError = err as { message?: string };
      setError(apiError.message || '保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>选择你的身材类型</Text>
            <Text style={styles.stepSubtitle}>这将帮助 AI 推荐更适合你的搭配</Text>
            <View style={styles.bodyTypeGrid}>
              {BODY_TYPES.map((type) => (
                <BodyTypeCard
                  key={type.id}
                  option={type}
                  selected={selectedBodyType === type.id}
                  onPress={() => setSelectedBodyType(type.id)}
                />
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>你喜欢什么风格？</Text>
            <Text style={styles.stepSubtitle}>选择 1-3 个你偏好的穿搭风格</Text>
            <View style={styles.chipsContainer}>
              {STYLE_OPTIONS.map((style) => (
                <SelectableChip
                  key={style.id}
                  label={style.label}
                  selected={selectedStyles.includes(style.id)}
                  onPress={() => handleStyleToggle(style.id)}
                  disabled={
                    selectedStyles.length >= MAX_MULTI_SELECT &&
                    !selectedStyles.includes(style.id)
                  }
                />
              ))}
            </View>
            <Text style={styles.selectionHint}>
              已选择 {selectedStyles.length}/{MAX_MULTI_SELECT}
            </Text>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>常见的穿搭场合</Text>
            <Text style={styles.stepSubtitle}>选择 1-3 个你最常穿搭的场合</Text>
            <View style={styles.chipsContainer}>
              {OCCASION_OPTIONS.map((occasion) => (
                <SelectableChip
                  key={occasion.id}
                  label={occasion.label}
                  icon={occasion.icon}
                  selected={selectedOccasions.includes(occasion.id)}
                  onPress={() => handleOccasionToggle(occasion.id)}
                  disabled={
                    selectedOccasions.length >= MAX_MULTI_SELECT &&
                    !selectedOccasions.includes(occasion.id)
                  }
                />
              ))}
            </View>
            <Text style={styles.selectionHint}>
              已选择 {selectedOccasions.length}/{MAX_MULTI_SELECT}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          <Text style={styles.welcomeText}>让 AI 更懂你，3 个问题即可开始</Text>
        </View>

        {/* Step Content */}
        {renderStepContent()}

        {/* Error Message */}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>上一步</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButtonContainer, !isStepValid() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isStepValid() || isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isStepValid()
                ? [colors.gradientStart, colors.gradientEnd]
                : [colors.gray3, colors.gray3]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.gray5} />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === TOTAL_STEPS ? '完成' : '下一步'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeText: {
    ...typography.body,
    color: colors.gray2,
    marginTop: spacing.m,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.title2,
    color: colors.gray1,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.gray2,
    marginBottom: spacing.l,
  },
  bodyTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectionHint: {
    ...typography.caption1,
    color: colors.gray3,
    marginTop: spacing.s,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.m,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    gap: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.gray4,
    backgroundColor: colors.gray5,
  },
  backButton: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    justifyContent: 'center',
  },
  backButtonText: {
    ...typography.body,
    color: colors.gray2,
  },
  nextButtonContainer: {
    flex: 1,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  nextButtonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    ...typography.headline,
    color: colors.gray5,
  },
});
