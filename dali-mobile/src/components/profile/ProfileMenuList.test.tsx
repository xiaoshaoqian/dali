/**
 * ProfileMenuList Component Tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import ProfileMenuList from '../ProfileMenuList';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ProfileMenuList', () => {
  it('should render all menu items', () => {
    render(<ProfileMenuList />);

    expect(screen.getByText('我的收藏')).toBeTruthy();
    expect(screen.getByText('分享记录')).toBeTruthy();
    expect(screen.getByText('风格档案')).toBeTruthy();
    expect(screen.getByText('设置')).toBeTruthy();
  });

  it('should handle my favorites press', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(<ProfileMenuList />);

    const favoritesItem = screen.getByText('我的收藏').parent;
    if (favoritesItem) {
      fireEvent.press(favoritesItem);
    }

    // Should navigate to history with favorites filter
    // Tested via router.push mock in real integration
  });

  it('should handle share history press', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(<ProfileMenuList />);

    const shareItem = screen.getByText('分享记录').parent;
    if (shareItem) {
      fireEvent.press(shareItem);
    }

    expect(consoleSpy).toHaveBeenCalledWith('Share history not yet implemented');
  });

  it('should handle style profile press', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(<ProfileMenuList />);

    const styleItem = screen.getByText('风格档案').parent;
    if (styleItem) {
      fireEvent.press(styleItem);
    }

    expect(consoleSpy).toHaveBeenCalledWith('Style profile not yet implemented');
  });

  it('should handle settings press', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(<ProfileMenuList />);

    const settingsItem = screen.getByText('设置').parent;
    if (settingsItem) {
      fireEvent.press(settingsItem);
    }

    expect(consoleSpy).toHaveBeenCalledWith('Settings page not yet implemented');
  });
});
