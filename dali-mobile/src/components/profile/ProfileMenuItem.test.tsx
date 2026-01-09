/**
 * ProfileMenuItem Component Tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import ProfileMenuItem from '../ProfileMenuItem';

describe('ProfileMenuItem', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render menu item with icon and label', () => {
    render(<ProfileMenuItem icon="star" label="我的收藏" onPress={mockOnPress} />);

    expect(screen.getByText('我的收藏')).toBeTruthy();
  });

  it('should call onPress when clicked', () => {
    render(<ProfileMenuItem icon="star" label="我的收藏" onPress={mockOnPress} />);

    const menuItem = screen.getByText('我的收藏').parent;
    if (menuItem) {
      fireEvent.press(menuItem);
    }

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should not render bottom border when isLast is true', () => {
    const { getByText } = render(
      <ProfileMenuItem icon="star" label="我的收藏" onPress={mockOnPress} isLast />
    );

    const container = getByText('我的收藏').parent;
    expect(container?.props.style).toContainEqual(
      expect.objectContaining({ borderBottomWidth: 0 })
    );
  });

  it('should render bottom border when isLast is false', () => {
    const { getByText } = render(
      <ProfileMenuItem icon="star" label="我的收藏" onPress={mockOnPress} isLast={false} />
    );

    const container = getByText('我的收藏').parent;
    expect(container?.props.style).toContainEqual(
      expect.objectContaining({ borderBottomWidth: 1 })
    );
  });
});
