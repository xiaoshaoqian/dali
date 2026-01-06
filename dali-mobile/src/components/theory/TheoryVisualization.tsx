/**
 * TheoryVisualization Component
 * Displays color theory visualization with color wheel and color palette
 * Part of Story 3.4 (base) + Story 4.1 (enhanced)
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { ColorWheel, ConnectionType } from './ColorWheel';
import { ColorPalette, ColorItem } from './ColorPalette';

// Theory data structure from API
export interface TheoryData {
  colorPrinciple: string;
  colors: ColorItem[];
  explanation?: string;
}

// Props interface (backward compatible with Story 3.4)
export interface TheoryVisualizationProps {
  // New enhanced props (Story 4.1)
  theory?: TheoryData;
  showColorPalette?: boolean;
  wheelSize?: number;
  // Legacy props (Story 3.4 compatibility)
  colorPrinciple?: string;
  colors?: string[];
  size?: number;
  onPress?: () => void;
}

// Tooltip component
interface TooltipProps {
  visible: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

function Tooltip({ visible, title, description, onClose }: TooltipProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.tooltipOverlay} onPress={onClose}>
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipTitle}>{title}</Text>
          <Text style={styles.tooltipDesc}>{description}</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

// Animated Pressable wrapper
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Determine connection type based on color principle
 */
function getConnectionType(principle: string): ConnectionType {
  if (principle.includes('补色') || principle.includes('对比')) {
    return 'complementary';
  }
  if (principle.includes('邻近') || principle.includes('类似') || principle.includes('同色')) {
    return 'analogous';
  }
  if (principle.includes('三色')) {
    return 'triadic';
  }
  return 'none';
}

/**
 * Generate description based on color principle
 */
function getTheoryDescription(principle: string): { title: string; desc: string } {
  const principles: Record<string, { title: string; desc: string }> = {
    '对比色': {
      title: '高对比度·色彩碰撞',
      desc: '利用色轮上对立的颜色，打造视觉冲击力和时尚感。',
    },
    '互补色': {
      title: '互补和谐·平衡之美',
      desc: '选用色轮上180度对立的颜色，形成强烈但和谐的搭配效果。',
    },
    '补色': {
      title: '补色搭配·对比鲜明',
      desc: '使用色轮上相对的颜色，视觉冲击强烈，适合突出重点。',
    },
    '同色系': {
      title: '同色渐变·优雅统一',
      desc: '使用同一色系的深浅变化，营造层次感和高级感。',
    },
    '类似色': {
      title: '相邻和谐·自然过渡',
      desc: '选取色轮上相邻的颜色，搭配自然协调不突兀。',
    },
    '邻近色': {
      title: '邻近配色·和谐柔和',
      desc: '使用色轮上相邻的颜色，营造舒适自然的视觉效果。',
    },
    '三色': {
      title: '三色搭配·活力平衡',
      desc: '选用色轮上等距的三种颜色，丰富而不杂乱。',
    },
    '黑白配': {
      title: '高对比度·黑白经典',
      desc: '利用大面积的白色提亮肤色，下半身黑色收缩视觉，营造干练且专业的职场形象。',
    },
  };

  // Find matching principle or return default
  for (const [key, value] of Object.entries(principles)) {
    if (principle.includes(key)) {
      return value;
    }
  }

  return {
    title: '配色原理',
    desc: principle || '根据您的服装颜色和场合需求，AI 为您推荐了最佳配色方案。',
  };
}

export function TheoryVisualization({
  // New props
  theory,
  showColorPalette = false,
  wheelSize,
  // Legacy props
  colorPrinciple: legacyColorPrinciple,
  colors: legacyColors,
  size: legacySize,
  onPress,
}: TheoryVisualizationProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const scale = useSharedValue(1);

  // Resolve props (new API takes precedence)
  const colorPrinciple = theory?.colorPrinciple || legacyColorPrinciple || '';
  const colorsList = theory?.colors || [];
  const hexColors = colorsList.length > 0
    ? colorsList.map((c) => c.hex)
    : legacyColors || [];
  const finalSize = wheelSize || legacySize || 80;

  // Press animation style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(1.05, { duration: 200, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
  };

  const handlePress = useCallback(() => {
    setTooltipVisible(true);
    onPress?.();
  }, [onPress]);

  const handleCloseTooltip = useCallback(() => {
    setTooltipVisible(false);
  }, []);

  const theoryDesc = getTheoryDescription(colorPrinciple);
  const connectionType = getConnectionType(colorPrinciple);

  return (
    <View style={styles.wrapper}>
      <AnimatedPressable
        style={[styles.container, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <View style={styles.wheelContainer}>
          <ColorWheel
            size={finalSize}
            highlightColors={hexColors}
            connectionType={connectionType}
          />
        </View>
        <View style={styles.descContainer}>
          <Text style={styles.title}>{theoryDesc.title}</Text>
          <Text style={styles.desc}>
            {theory?.explanation || theoryDesc.desc}
          </Text>
        </View>
      </AnimatedPressable>

      {/* Color Palette (optional) */}
      {showColorPalette && colorsList.length > 0 && (
        <ColorPalette
          colors={colorsList}
          showHex={false}
          showCategory={true}
        />
      )}

      {/* Tooltip */}
      <Tooltip
        visible={tooltipVisible}
        title={theoryDesc.title}
        description={theoryDesc.desc}
        onClose={handleCloseTooltip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  wheelContainer: {
    flexShrink: 0,
  },
  descContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    lineHeight: 21,
    color: '#636366',
  },
  // Tooltip styles
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxWidth: 300,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  tooltipDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: '#636366',
    textAlign: 'center',
  },
});
