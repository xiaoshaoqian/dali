/**
 * Tab Layout
 * Bottom tab navigation matching UX prototype design
 * Ref: ux-design/pages/01-home/home-page-empty.html
 */
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

import { HomeIcon, OutfitIcon, ProfileIcon } from '@/components/ui/icons';
import { colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon size={28} color={color} filled={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '搭配',
          tabBarIcon: ({ color, focused }) => (
            <OutfitIcon size={28} color={color} filled={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <ProfileIcon size={28} color={color} filled={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 83,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(242, 242, 247, 0.8)' : '#F2F2F7',
    borderTopWidth: 0.33,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
