/**
 * Style Profile Screen (风格档案)
 * Display user style analysis and keywords
 *
 * @see HTML Prototype: ux-design/pages/05-profile/style-profile.html
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing } from '@/constants';

interface StyleKeyword {
  text: string;
  weight: 'primary' | 'medium' | 'default';
}

interface StyleComponent {
  name: string;
  percentage: number;
  color: string;
}

// Mock style data
const mockStyleKeywords: StyleKeyword[] = [
  { text: '简约通勤', weight: 'primary' },
  { text: '韩系温婉', weight: 'default' },
  { text: '舒适休闲', weight: 'default' },
  { text: '低饱和度', weight: 'default' },
  { text: '基础款', weight: 'default' },
];

const mockStyleComponents: StyleComponent[] = [
  { name: '简约', percentage: 45, color: '#6C63FF' },
  { name: '优雅', percentage: 30, color: '#FF9500' },
  { name: '休闲', percentage: 15, color: '#34C759' },
  { name: '其他', percentage: 10, color: '#8E8E93' },
];

function StyleTag({ text, weight }: StyleKeyword): React.ReactElement {
  const getTagStyle = () => {
    switch (weight) {
      case 'primary':
        return styles.tagPrimary;
      case 'medium':
        return styles.tagMedium;
      default:
        return styles.tagDefault;
    }
  };

  const getTextStyle = () => {
    switch (weight) {
      case 'primary':
        return styles.tagTextPrimary;
      default:
        return styles.tagTextDefault;
    }
  };

  return (
    <View style={[styles.tag, getTagStyle()]}>
      <Text style={[styles.tagText, getTextStyle()]}>{text}</Text>
    </View>
  );
}

function StyleBar({ name, percentage, color }: StyleComponent): React.ReactElement {
  return (
    <View style={styles.styleBarItem}>
      <View style={styles.styleInfo}>
        <Text style={styles.styleName}>{name}</Text>
        <Text style={styles.styleVal}>{percentage}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function StyleProfileScreen() {
  const router = useRouter();

  const handleRetest = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('重新测试', '风格测试功能开发中');
  };

  return (
    <View style={styles.container}>
      {/* Purple Gradient Header */}
      <LinearGradient
        colors={['#6C63FF', '#8578FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        {/* Navigation */}
        <View style={styles.navHeader}>
          <TouchableOpacity
            style={styles.navBack}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>风格档案</Text>
          <TouchableOpacity
            style={styles.navAction}
            onPress={handleRetest}
            activeOpacity={0.7}
          >
            <Text style={styles.navActionText}>重新测试</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* White Content Card */}
      <ScrollView
        style={styles.contentCard}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: 风格关键词 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>我的风格关键词</Text>
          <View style={styles.card}>
            <View style={styles.tagCloud}>
              {mockStyleKeywords.map((keyword, index) => (
                <StyleTag key={index} {...keyword} />
              ))}
            </View>
          </View>
        </View>

        {/* Section 2: 风格成分分析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>风格成分分析</Text>
          <View style={styles.card}>
            {mockStyleComponents.map((component, index) => (
              <StyleBar key={index} {...component} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray4,
  },
  header: {
    paddingTop: 59,
    paddingBottom: 90,
    paddingHorizontal: spacing.l,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.9,
  },
  navTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navAction: {
    opacity: 0.9,
  },
  navActionText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -30,
  },
  contentContainer: {
    padding: spacing.l,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray3,
    marginBottom: 10,
    paddingLeft: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  // Tag Cloud
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagDefault: {
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.1)',
  },
  tagMedium: {
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tagPrimary: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  tagText: {
    fontWeight: '500',
  },
  tagTextDefault: {
    fontSize: 14,
    color: '#6C63FF',
  },
  tagTextPrimary: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  // Style Bars
  styleBarItem: {
    marginBottom: 16,
  },
  styleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  styleName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray1,
  },
  styleVal: {
    fontSize: 14,
    color: colors.gray3,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.gray4,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
