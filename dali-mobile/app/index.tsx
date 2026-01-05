/**
 * App Entry Point
 * Handles authentication-based routing
 */
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

// 开发测试：设为 true 跳过登录直接进入主界面
// WARNING: Must be false in production!
const SKIP_AUTH_FOR_TESTING = __DEV__ ? false : false;

export default function Index() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // 开发测试模式：直接进入主界面
  if (SKIP_AUTH_FOR_TESTING) {
    return <Redirect href="/(tabs)" />;
  }

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/phone-login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray5,
  },
});
