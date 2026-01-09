/**
 * ProfileStats Component Tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';

import ProfileStats from '../ProfileStats';
import type { UserStats } from '@/types/user';

const mockStats: UserStats = {
  totalOutfits: 45,
  favoriteCount: 12,
  shareCount: 8,
  joinedDays: 15,
  aiAccuracy: 0.82,
};

describe('ProfileStats', () => {
  it('should render all stats correctly', () => {
    render(<ProfileStats stats={mockStats} />);

    expect(screen.getByText('45')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
  });

  it('should render stat labels correctly', () => {
    render(<ProfileStats stats={mockStats} />);

    expect(screen.getByText('生成次数')).toBeTruthy();
    expect(screen.getByText('收藏数量')).toBeTruthy();
    expect(screen.getByText('分享次数')).toBeTruthy();
  });

  it('should render stat icons correctly', () => {
    render(<ProfileStats stats={mockStats} />);

    expect(screen.getByText('✨')).toBeTruthy();
    expect(screen.getByText('⭐')).toBeTruthy();
    expect(screen.getByText('↗️')).toBeTruthy();
  });

  it('should handle zero stats', () => {
    const zeroStats: UserStats = {
      totalOutfits: 0,
      favoriteCount: 0,
      shareCount: 0,
      joinedDays: 0,
      aiAccuracy: 0,
    };

    render(<ProfileStats stats={zeroStats} />);

    expect(screen.getAllByText('0')).toHaveLength(3);
  });
});
