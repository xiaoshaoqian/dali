/**
 * Edit Preferences Screen (偏好编辑)
 * Allows users to modify their style preferences
 *
 * @see Story 7.3: PreferenceCloud Component and Edit Preferences
 * @see AC#4: Edit Mode Interface
 * @see AC#5: Preferences Save and Sync
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  BodyTypeCard,
  SelectableChip,
  BODY_TYPES,
  STYLE_OPTIONS,
  OCCASION_OPTIONS,
  BodyType,
  StylePreference,
  Occasion,
} from '@/components/onboarding';
import { Toast } from '@/components/ui';
import { usePreferences, useUpdatePreferences } from '@/hooks';
import { colors, spacing, borderRadius } from '@/constants';

const MAX_MULTI_SELECT = 3;

export default function EditPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Fetch current preferences
  const { data: currentPreferences, isLoading: isLoadingPreferences } = usePreferences();
  const updatePreferencesMutation = useUpdatePreferences();

  // Local state for editing
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<StylePreference[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Initialize from current preferences
  useEffect(() => {
    if (currentPreferences) {
      // API returns IDs directly (e.g., 'pear', 'minimalist', 'work')
      if (currentPreferences.bodyType) {
        setSelectedBodyType(currentPreferences.bodyType as BodyType);
      }

      // Styles are already IDs
      if (currentPreferences.styles) {
        setSelectedStyles(currentPreferences.styles as StylePreference[]);
      }

      // Occasions are already IDs
      if (currentPreferences.occasions) {
        setSelectedOccasions(currentPreferences.occasions as Occasion[]);
      }
    }
  }, [currentPreferences]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return (
      selectedBodyType !== null &&
      selectedStyles.length >= 1 &&
      selectedStyles.length <= MAX_MULTI_SELECT &&
      selectedOccasions.length >= 1 &&
      selectedOccasions.length <= MAX_MULTI_SELECT
    );
  }, [selectedBodyType, selectedStyles, selectedOccasions]);

  // Handle style selection
  const handleStyleToggle = (style: StylePreference) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStyles(prev => {
      if (prev.includes(style)) {
        return prev.filter(s => s !== style);
      }
      if (prev.length >= MAX_MULTI_SELECT) {
        return prev;
      }
      return [...prev, style];
    });
  };

  // Handle occasion selection
  const handleOccasionToggle = (occasion: Occasion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOccasions(prev => {
      if (prev.includes(occasion)) {
        return prev.filter(o => o !== occasion);
      }
      if (prev.length >= MAX_MULTI_SELECT) {
        return prev;
      }
      return [...prev, occasion];
    });
  };

  // Handle body type selection
  const handleBodyTypeSelect = (bodyType: BodyType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBodyType(bodyType);
  };

  // Handle back
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Handle save (AC#5)
  const handleSave = async () => {
    if (!isFormValid() || !selectedBodyType) return;

    try {
      // API expects IDs (not Chinese labels)
      await updatePreferencesMutation.mutateAsync({
        bodyType: selectedBodyType,
        styles: selectedStyles,
        occasions: selectedOccasions,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccessToast(true);

      // Navigate back after showing toast
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      Alert.alert('保存失败', '请稍后重试');
    }
  };

  if (isLoadingPreferences) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="edit-preferences-screen">
      <StatusBar barStyle="light-content" />

      {/* Purple Gradient Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleBack}
            testID="back-button"
            accessibilityRole="button"
            accessibilityLabel="返回"
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} accessibilityRole="header">
            编辑偏好
          </Text>

          <View style={styles.navButton} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Body Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>身材类型</Text>
          <Text style={styles.sectionSubtitle}>选择最符合你的身材类型</Text>
          <View style={styles.bodyTypeGrid}>
            {BODY_TYPES.map(type => (
              <BodyTypeCard
                key={type.id}
                option={type}
                selected={selectedBodyType === type.id}
                onPress={() => handleBodyTypeSelect(type.id)}
              />
            ))}
          </View>
        </View>

        {/* Style Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>风格偏好</Text>
          <Text style={styles.sectionSubtitle}>
            选择 1-3 个你喜欢的穿搭风格
          </Text>
          <View style={styles.chipsContainer}>
            {STYLE_OPTIONS.map(style => (
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

        {/* Occasions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>常见场合</Text>
          <Text style={styles.sectionSubtitle}>
            选择 1-3 个你最常穿搭的场合
          </Text>
          <View style={styles.chipsContainer}>
            {OCCASION_OPTIONS.map(occasion => (
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
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.m }]}>
        <TouchableOpacity
          style={[styles.saveButton, !isFormValid() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isFormValid() || updatePreferencesMutation.isPending}
          activeOpacity={0.8}
          testID="save-button"
        >
          <LinearGradient
            colors={
              isFormValid()
                ? [colors.gradientStart, colors.gradientEnd]
                : [colors.gray3, colors.gray3]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            {updatePreferencesMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>保存</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Success Toast (AC#5) */}
      <Toast
        message="偏好已更新，AI 会更懂你"
        type="success"
        duration={2000}
        visible={showSuccessToast}
        onDismiss={() => setShowSuccessToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingBottom: spacing.m,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray1,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray3,
    marginBottom: spacing.m,
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
    fontSize: 12,
    color: colors.gray3,
    marginTop: spacing.s,
  },
  bottomActions: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  saveButton: {
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
