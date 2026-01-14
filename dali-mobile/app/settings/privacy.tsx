/**
 * Privacy Settings Screen
 * Privacy and permissions management
 *
 * @see HTML Prototype: ux-design/pages/05-profile/settings-privacy.html
 * @see Story 7.1: Correction Task #4
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing } from '@/constants';

interface SettingsItemProps {
  label: string;
  value?: string | React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function SettingsItem({
  label,
  value,
  onPress,
  showChevron = false,
}: SettingsItemProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.itemLabel}>{label}</Text>
      <View style={styles.itemRight}>
        {typeof value === 'string' ? (
          <Text style={styles.itemValue}>{value}</Text>
        ) : (
          value
        )}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray3} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(true);

  const handleToggleRecommendations = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPersonalizedRecommendations(value);
    // TODO: Persist this setting to backend/storage
  };

  const handleCameraPermission = () => {
    Alert.alert('相机权限', '当前已开启\n\n您可以在系统设置中管理权限');
  };

  const handlePhotoPermission = () => {
    Alert.alert('照片访问', '当前已开启\n\n您可以在系统设置中管理权限');
  };

  return (
    <View style={styles.container}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#6C63FF', '#8578FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>隐私设置</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* System Permissions */}
        <Text style={styles.sectionHeader}>系统权限</Text>
        <SettingsGroup>
          <SettingsItem
            label="相机权限"
            value={<Text style={styles.enabledText}>已开启</Text>}
            onPress={handleCameraPermission}
          />
          <SettingsItem
            label="照片访问"
            value={<Text style={styles.enabledText}>已开启</Text>}
            onPress={handlePhotoPermission}
          />
        </SettingsGroup>

        {/* Personalization */}
        <Text style={styles.sectionHeader}>个性化</Text>
        <SettingsGroup>
          <SettingsItem
            label="个性化推荐"
            value={
              <Switch
                value={personalizedRecommendations}
                onValueChange={handleToggleRecommendations}
                trackColor={{ false: '#E5E5EA', true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E5EA"
              />
            }
          />
        </SettingsGroup>
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
    paddingBottom: 16,
    paddingHorizontal: spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.l,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    color: colors.gray2,
    marginLeft: 4,
    marginBottom: spacing.xs,
    marginTop: spacing.s,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  group: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemLabel: {
    fontSize: 16,
    color: colors.gray1,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  itemValue: {
    fontSize: 15,
    color: colors.gray3,
  },
  enabledText: {
    fontSize: 15,
    color: '#34C759', // iOS green
    fontWeight: '500',
  },
});
