/**
 * Body Profile Screen (身材档案)
 * Display and manage user body measurements
 *
 * @see HTML Prototype: ux-design/pages/05-profile/body-profile.html
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

interface SectionTagProps {
  type: 'required' | 'optional' | 'reference';
  label: string;
}

function SectionTag({ type, label }: SectionTagProps): React.ReactElement {
  const tagStyles = {
    required: { backgroundColor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF' },
    optional: { backgroundColor: 'rgba(142, 142, 147, 0.15)', color: '#8E8E93' },
    reference: { backgroundColor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF' },
  };

  return (
    <View style={[styles.sectionTag, { backgroundColor: tagStyles[type].backgroundColor }]}>
      <Text style={[styles.sectionTagText, { color: tagStyles[type].color }]}>{label}</Text>
    </View>
  );
}

interface ListItemProps {
  label: string;
  value?: string;
  isPlaceholder?: boolean;
  onPress?: () => void;
}

function ListItem({ label, value, isPlaceholder = false, onPress }: ListItemProps): React.ReactElement {
  const handlePress = async () => {
    if (onPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.itemLabel}>{label}</Text>
      <View style={styles.itemValueContainer}>
        <Text style={[styles.itemValue, isPlaceholder && styles.itemValuePlaceholder]}>
          {value || '未选择'}
        </Text>
        {isPlaceholder && (
          <Ionicons name="chevron-forward" size={14} color={colors.gray3} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// Mock body profile data
const mockBodyData = {
  basic: {
    gender: '女',
    height: '165 cm',
    weight: '48 kg',
    bodyType: '梨形身材',
  },
  appearance: {
    faceShape: null,
    hairStyle: '长卷发',
    hairColor: '深棕色',
  },
  sizes: {
    top: 'S / 160',
    bottom: 'M / 27',
    shoe: '37',
  },
};

export default function BodyProfileScreen() {
  const router = useRouter();

  const handleEdit = () => {
    Alert.alert('编辑', '编辑功能开发中');
  };

  const handleSelectFaceShape = () => {
    Alert.alert('选择脸型', '脸型选择功能开发中');
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
          <Text style={styles.navTitle}>身材档案</Text>
          <TouchableOpacity
            style={styles.navAction}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <Text style={styles.navActionText}>编辑</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* White Content Card */}
      <ScrollView
        style={styles.contentCard}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: 基本信息 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>基本信息</Text>
            <SectionTag type="required" label="必填" />
          </View>
          <View style={styles.card}>
            <ListItem label="性别" value={mockBodyData.basic.gender} />
            <ListItem label="身高" value={mockBodyData.basic.height} />
            <ListItem label="体重" value={mockBodyData.basic.weight} />
            <ListItem label="体型" value={mockBodyData.basic.bodyType} />
          </View>
        </View>

        {/* Section 2: 外貌特征 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>外貌特征</Text>
            <SectionTag type="optional" label="选填" />
          </View>
          <View style={styles.card}>
            <ListItem
              label="脸型"
              value={mockBodyData.appearance.faceShape || undefined}
              isPlaceholder={!mockBodyData.appearance.faceShape}
              onPress={handleSelectFaceShape}
            />
            <ListItem label="发型" value={mockBodyData.appearance.hairStyle} />
            <ListItem label="发色" value={mockBodyData.appearance.hairColor} />
          </View>
        </View>

        {/* Section 3: 尺码参考 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>尺码参考</Text>
            <SectionTag type="reference" label="参考" />
          </View>
          <View style={styles.card}>
            <ListItem label="上装" value={mockBodyData.sizes.top} />
            <ListItem label="下装" value={mockBodyData.sizes.bottom} />
            <ListItem label="鞋码" value={mockBodyData.sizes.shoe} />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingLeft: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray3,
  },
  sectionTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sectionTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 52,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemLabel: {
    fontSize: 16,
    color: colors.gray1,
  },
  itemValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemValue: {
    fontSize: 16,
    color: colors.gray3,
  },
  itemValuePlaceholder: {
    color: colors.gray4,
  },
});
