/**
 * TheoryVisualization Component
 * Displays color theory visualization with mini color wheel
 * Part of Story 3.4: Outfit Results Display with Theory Visualization
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/constants';

interface TheoryVisualizationProps {
  colorPrinciple: string;
  colors?: string[];
  size?: number;
  onPress?: () => void;
}

// Mini Color Wheel component
function MiniColorWheel({ colors: wheelColors, size = 80 }: { colors?: string[]; size?: number }) {
  const defaultColors = ['#1C1C1E', '#E5E5EA'];
  const displayColors = wheelColors && wheelColors.length >= 2 ? wheelColors.slice(0, 2) : defaultColors;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Base circle */}
      <Circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#E5E5EA"
        strokeWidth="8"
      />
      {/* First half - primary color */}
      <Path
        d="M50 5 a 45 45 0 0 1 0 90"
        stroke={displayColors[0] || '#1C1C1E'}
        strokeWidth="8"
        fill="none"
      />
      {/* Second half - secondary color */}
      <Path
        d="M50 5 a 45 45 0 0 0 0 90"
        stroke={displayColors[1] || '#E5E5EA'}
        strokeWidth="8"
        fill="none"
      />
    </Svg>
  );
}

// Animated Pressable wrapper
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TheoryVisualization({
  colorPrinciple,
  colors: colorsList,
  size = 80,
  onPress,
}: TheoryVisualizationProps) {
  const scale = useSharedValue(1);

  // Press animation style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(1.05, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  // Generate description based on color principle
  const getTheoryDescription = (principle: string): { title: string; desc: string } => {
    const principles: Record<string, { title: string; desc: string }> = {
      '对比色': {
        title: '高对比度·色彩碰撞',
        desc: '利用色轮上对立的颜色，打造视觉冲击力和时尚感。',
      },
      '互补色': {
        title: '互补和谐·平衡之美',
        desc: '选用色轮上180度对立的颜色，形成强烈但和谐的搭配效果。',
      },
      '同色系': {
        title: '同色渐变·优雅统一',
        desc: '使用同一色系的深浅变化，营造层次感和高级感。',
      },
      '类似色': {
        title: '相邻和谐·自然过渡',
        desc: '选取色轮上相邻的颜色，搭配自然协调不突兀。',
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
  };

  const theory = getTheoryDescription(colorPrinciple);

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <View style={styles.wheelContainer}>
        <MiniColorWheel colors={colorsList} size={size} />
      </View>
      <View style={styles.descContainer}>
        <Text style={styles.title}>{theory.title}</Text>
        <Text style={styles.desc}>{theory.desc}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  wheelContainer: {
    width: 80,
    height: 80,
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
});
