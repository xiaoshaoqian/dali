/**
 * ProfileMenuList Component Tests
 *
 * @see HTML Prototype: ux-design/pages/05-profile/profile-page.html
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

import ProfileMenuList from './ProfileMenuList';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('ProfileMenuList', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('should render group titles', () => {
    render(<ProfileMenuList />);

    expect(screen.getByText('我的档案')).toBeTruthy();
    expect(screen.getByText('账户')).toBeTruthy();
  });

  it('should render all menu items', () => {
    render(<ProfileMenuList />);

    expect(screen.getByText('身材档案')).toBeTruthy();
    expect(screen.getByText('风格档案')).toBeTruthy();
    expect(screen.getByText('设置')).toBeTruthy();
  });

  it('should navigate to body profile on press', async () => {
    render(<ProfileMenuList />);

    const bodyProfileItem = screen.getByText('身材档案');
    fireEvent.press(bodyProfileItem);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/body-profile');
    });
  });

  it('should navigate to style profile on press', async () => {
    render(<ProfileMenuList />);

    const styleProfileItem = screen.getByText('风格档案');
    fireEvent.press(styleProfileItem);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/style-profile');
    });
  });

  it('should navigate to settings on press', async () => {
    render(<ProfileMenuList />);

    const settingsItem = screen.getByText('设置');
    fireEvent.press(settingsItem);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/settings');
    });
  });
});
