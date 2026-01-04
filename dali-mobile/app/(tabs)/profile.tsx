/**
 * Profile Screen (我的)
 * User profile with stats, AI learning progress, and preferences
 * Ref: ux-design/pages/05-profile/profile-page.html
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import {
  ProfileIcon,
  SettingsIcon,
  OutfitIcon,
  HeartIcon,
  GridIcon,
  ClockIcon,
  StarIcon,
  ChevronRightIcon,
} from '@/components/ui/icons';
import { colors } from '@/constants';

// Stats data
const stats = [
  { id: 1, value: '28', label: '搭配方案', type: 'primary', Icon: OutfitIcon },
  { id: 2, value: '12', label: '我的收藏', type: 'warning', Icon: HeartIcon },
  { id: 3, value: '108', label: '衣橱单品', type: 'success', Icon: GridIcon },
  { id: 4, value: '99+', label: '历史记录', type: 'info', Icon: ClockIcon },
];

const statColors: Record<string, { bg: string; color: string }> = {
  primary: { bg: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF' },
  warning: { bg: 'rgba(255, 149, 0, 0.1)', color: '#FF9500' },
  success: { bg: 'rgba(52, 199, 89, 0.1)', color: '#34C759' },
  info: { bg: 'rgba(0, 122, 255, 0.1)', color: '#007AFF' },
};

// Style preferences
const preferences = [
  { label: '简约', size: 'large' },
  { label: '通勤', size: 'medium' },
  { label: '时尚', size: 'small' },
  { label: '休闲', size: 'medium' },
  { label: '甜美', size: 'small' },
  { label: '约会', size: 'small' },
];

// Style distribution
const styleDistribution = [
  { name: '简约风', percent: 45 },
  { name: '时尚感', percent: 30 },
  { name: '甜美风', percent: 15 },
  { name: '知性风', percent: 10 },
];

// Progress Circle Component
function ProgressCircle({ percent }: { percent: number }) {
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={progressStyles.container}>
      <Svg width={size} height={size} style={progressStyles.svg}>
        <Defs>
          <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#6C63FF" />
            <Stop offset="100%" stopColor="#8B7FFF" />
          </SvgGradient>
        </Defs>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E5EA"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={progressStyles.textContainer}>
        <Text style={progressStyles.percent}>{percent}%</Text>
        <Text style={progressStyles.label}>AI 越来越懂你了</Text>
      </View>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    alignSelf: 'center',
    marginBottom: 16,
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Purple Gradient Header */}
        <LinearGradient
          colors={[colors.primary, '#8578FF']}
          style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
        >
          {/* Settings Button */}
          <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
            <SettingsIcon size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <ProfileIcon size={40} color={colors.primary} filled />
            </View>
            <Text style={styles.username}>小邵</Text>
            <Text style={styles.userBio}>穿搭新手 · 风格探索中</Text>
          </View>
        </LinearGradient>

        {/* White Content Card */}
        <View style={styles.contentCard}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <TouchableOpacity key={stat.id} style={styles.statsItem} activeOpacity={0.8}>
                <View style={[styles.statsIconBg, { backgroundColor: statColors[stat.type].bg }]}>
                  <stat.Icon size={20} color={statColors[stat.type].color} />
                </View>
                <Text style={styles.statsVal}>{stat.value}</Text>
                <Text style={styles.statsKey}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Learning Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI 学习进度</Text>
            <ProgressCircle percent={75} />
          </View>

          {/* Body Profile */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>我的身材档案</Text>
              <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
                <Text style={styles.editButtonText}>修改</Text>
                <ChevronRightIcon size={12} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.sizeCard}>
              <View style={styles.sizeGrid}>
                <View style={styles.sizeItem}>
                  <Text style={styles.sizeLabel}>身高</Text>
                  <Text style={styles.sizeValue}>165 <Text style={styles.sizeUnit}>cm</Text></Text>
                </View>
                <View style={styles.sizeItem}>
                  <Text style={styles.sizeLabel}>体重</Text>
                  <Text style={styles.sizeValue}>48 <Text style={styles.sizeUnit}>kg</Text></Text>
                </View>
                <View style={styles.sizeItem}>
                  <Text style={styles.sizeLabel}>体型</Text>
                  <Text style={styles.sizeValue}>梨形</Text>
                </View>
              </View>
              <View style={styles.sizeDivider} />
              <View style={styles.sizeGrid}>
                <View style={styles.sizeItem}>
                  <Text style={styles.sizeLabel}>上装</Text>
                  <Text style={styles.sizeValue}>S</Text>
                </View>
                <View style={styles.sizeItem}>
                  <Text style={styles.sizeLabel}>下装</Text>
                  <Text style={styles.sizeValue}>M</Text>
                </View>
                <View style={styles.sizeItem}>
                  <Text style={styles.sizeLabel}>鞋码</Text>
                  <Text style={styles.sizeValue}>37</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Style Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>你的风格偏好</Text>
            <View style={styles.preferenceCloud}>
              {preferences.map((pref, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.preferenceTag,
                    pref.size === 'large' && styles.preferenceTagLarge,
                    pref.size === 'medium' && styles.preferenceTagMedium,
                  ]}
                >
                  <Text
                    style={[
                      styles.preferenceTagText,
                      pref.size === 'large' && styles.preferenceTagTextLarge,
                      pref.size === 'medium' && styles.preferenceTagTextMedium,
                    ]}
                  >
                    {pref.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Style Distribution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>风格分布</Text>
            <View style={styles.styleBars}>
              {styleDistribution.map((style, idx) => (
                <View key={idx} style={styles.styleBar}>
                  <View style={styles.styleBarHeader}>
                    <Text style={styles.styleName}>{style.name}</Text>
                    <Text style={styles.stylePercent}>{style.percent}%</Text>
                  </View>
                  <View style={styles.styleBarTrack}>
                    <LinearGradient
                      colors={[colors.primary, '#8B7FFF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.styleBarFill, { width: `${style.percent}%` }]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Menu List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>更多</Text>
            <View style={styles.menuGroup}>
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                  <StarIcon size={20} color="#FF9500" />
                </View>
                <Text style={styles.menuText}>我的会员</Text>
                <ChevronRightIcon size={20} color="#C7C7CC" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(142, 142, 147, 0.1)' }]}>
                  <SettingsIcon size={20} color="#8E8E93" />
                </View>
                <Text style={styles.menuText}>设置</Text>
                <ChevronRightIcon size={20} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 90,
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 59,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -60,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statsItem: {
    width: '47%',
    backgroundColor: '#F9F9FB',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  statsIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statsVal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statsKey: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 13,
    color: colors.primary,
  },
  sizeCard: {
    backgroundColor: '#F9F9FB',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  sizeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sizeItem: {
    alignItems: 'center',
  },
  sizeLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  sizeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  sizeUnit: {
    fontSize: 12,
    fontWeight: '400',
  },
  sizeDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 12,
  },
  preferenceCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  preferenceTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.1)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  preferenceTagMedium: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    borderWidth: 0,
  },
  preferenceTagLarge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderWidth: 0,
    shadowOpacity: 0.3,
  },
  preferenceTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  preferenceTagTextMedium: {
    fontSize: 15,
  },
  preferenceTagTextLarge: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  styleBars: {
    gap: 16,
  },
  styleBar: {
    gap: 8,
  },
  styleBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  styleName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  stylePercent: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  styleBarTrack: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  styleBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
});
