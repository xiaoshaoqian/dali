/**
 * EditNicknameModal Component Tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import EditNicknameModal from '../EditNicknameModal';

// Mock Haptics
jest.mock('expo-haptics');

describe('EditNicknameModal', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal with current nickname', () => {
    render(
      <EditNicknameModal
        visible
        currentNickname="Test User"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('修改昵称')).toBeTruthy();
    expect(screen.getByDisplayValue('Test User')).toBeTruthy();
  });

  it('should not render when visible is false', () => {
    const { queryByText } = render(
      <EditNicknameModal
        visible={false}
        currentNickname="Test User"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(queryByText('修改昵称')).toBeNull();
  });

  it('should call onCancel when cancel button pressed', async () => {
    render(
      <EditNicknameModal
        visible
        currentNickname="Test User"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('取消');
    fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  it('should call onSave with valid nickname', async () => {
    render(
      <EditNicknameModal
        visible
        currentNickname="Test User"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByDisplayValue('Test User');
    fireEvent.changeText(input, 'NewName');

    const saveButton = screen.getByText('保存');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('NewName');
    });
  });

  it('should show error for nickname less than 2 characters', () => {
    render(
      <EditNicknameModal
        visible
        currentNickname="Test User"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByDisplayValue('Test User');
    fireEvent.changeText(input, 'A');

    const saveButton = screen.getByText('保存');
    fireEvent.press(saveButton);

    expect(screen.getByText('昵称至少需要2个字符')).toBeTruthy();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should show error for nickname more than 12 characters', () => {
    render(
      <EditNicknameModal
        visible
        currentNickname="Test User"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByDisplayValue('Test User');
    fireEvent.changeText(input, 'VeryLongNickname123');

    const saveButton = screen.getByText('保存');
    fireEvent.press(saveButton);

    expect(screen.getByText('昵称最多12个字符')).toBeTruthy();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should show character count', () => {
    render(
      <EditNicknameModal
        visible
        currentNickname="Test User"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('9/12')).toBeTruthy();
  });

  it('should disable save button when nickname unchanged', () => {
    render(
      <EditNicknameModal
        visible
        currentNickname="Test User"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByText('保存');
    expect(saveButton.parent?.props.disabled).toBe(true);
  });

  it('should show loading state', () => {
    render(
      <EditNicknameModal
        visible
        currentNickname="Test User"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isLoading
      />
    );

    expect(screen.getByText('保存中...')).toBeTruthy();
  });
});
