/**
 * FilterBottomSheet Component
 * iOS-style bottom sheet for selecting filter options
 *
 * @see Story 5.3: Filter by Occasion, Time, and Favorites
 * @see AC #2: Occasion selection bottom sheet
 * @see AC #4: Time range selection bottom sheet
 */
import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  OCCASION_OPTIONS,
  TIME_RANGE_OPTIONS,
  type OccasionOption,
  type TimeRangeOption,
  type TimeRangeValue,
} from '@/stores/filterStore';

// =============================================================================
// Types
// =============================================================================

export type FilterType = 'occasion' | 'timeRange';

interface FilterBottomSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Type of filter to show options for */
  filterType: FilterType;
  /** Currently selected occasion value */
  selectedOccasion?: string;
  /** Currently selected time range value */
  selectedTimeRange?: TimeRangeValue;
  /** Called when an occasion option is selected */
  onSelectOccasion?: (value: string | undefined) => void;
  /** Called when a time range option is selected */
  onSelectTimeRange?: (value: TimeRangeValue) => void;
  /** Called when the bottom sheet is closed */
  onClose: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 420;
const ANIMATION_DURATION = 300;

// =============================================================================
// Component
// =============================================================================

export function FilterBottomSheet({
  visible,
  filterType,
  selectedOccasion,
  selectedTimeRange,
  onSelectOccasion,
  onSelectTimeRange,
  onClose,
}: FilterBottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Animate in/out when visibility changes
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleOccasionSelect = useCallback(
    (option: OccasionOption) => {
      onSelectOccasion?.(option.value);
      onClose();
    },
    [onSelectOccasion, onClose]
  );

  const handleTimeRangeSelect = useCallback(
    (option: TimeRangeOption) => {
      onSelectTimeRange?.(option.value);
      onClose();
    },
    [onSelectTimeRange, onClose]
  );

  const title = filterType === 'occasion' ? '选择场合' : '选择时间范围';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.backdropOverlay,
            { opacity: backdropAnim },
          ]}
        />
      </Pressable>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Options */}
        <ScrollView
          style={styles.optionsList}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {filterType === 'occasion' ? (
            // Occasion options
            OCCASION_OPTIONS.map((option) => {
              const isSelected = option.value === selectedOccasion;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => handleOccasionSelect(option)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${option.emoji} ${option.label}`}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.emoji} {option.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            // Time range options
            TIME_RANGE_OPTIONS.map((option) => {
              const isSelected = option.value === selectedTimeRange;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => handleTimeRangeSelect(option)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={option.label}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 34, // Safe area
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 2.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F2F2F7',
  },
  optionItemSelected: {
    backgroundColor: '#6C63FF',
  },
  optionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
});

export default FilterBottomSheet;
