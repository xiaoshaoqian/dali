/**
 * EditNicknameModal Component
 * Modal for editing user nickname with validation
 *
 * @see Story 7.1: Profile Screen with User Stats
 * @see AC#6: 昵称编辑功能
 */
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, spacing, borderRadius } from '@/constants';

interface EditNicknameModalProps {
  visible: boolean;
  currentNickname: string;
  onSave: (nickname: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditNicknameModal({
  visible,
  currentNickname,
  onSave,
  onCancel,
  isLoading = false,
}: EditNicknameModalProps): React.ReactElement {
  const [nickname, setNickname] = React.useState(currentNickname);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setNickname(currentNickname);
      setError(null);
    }
  }, [visible, currentNickname]);

  const validateNickname = (value: string): boolean => {
    if (value.length < 2) {
      setError('昵称至少需要2个字符');
      return false;
    }
    if (value.length > 12) {
      setError('昵称最多12个字符');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async () => {
    // Force validation before saving (防止快速点击绕过disabled状态)
    const trimmedNickname = nickname.trim();
    if (!validateNickname(trimmedNickname)) {
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(trimmedNickname);
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
            >
              <View style={styles.modal}>
                {/* Title */}
                <Text style={styles.title}>修改昵称</Text>

                {/* Input */}
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  value={nickname}
                  onChangeText={(text) => {
                    setNickname(text);
                    if (error) {
                      validateNickname(text);
                    }
                  }}
                  placeholder="请输入昵称"
                  placeholderTextColor={colors.gray3}
                  maxLength={12}
                  autoFocus
                  editable={!isLoading}
                />

                {/* Error Message */}
                {error && <Text style={styles.errorText}>{error}</Text>}

                {/* Character Count */}
                <Text style={styles.charCount}>{nickname.length}/12</Text>

                {/* Buttons */}
                <View style={styles.buttons}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonCancel]}
                    onPress={handleCancel}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonCancelText}>取消</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.buttonSave, isLoading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={isLoading || !!error || nickname === currentNickname}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonSaveText}>
                      {isLoading ? '保存中...' : '保存'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    paddingHorizontal: spacing.l,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.large,
    padding: spacing.l,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray1,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.m,
    fontSize: 16,
    color: colors.gray1,
    marginBottom: spacing.xs,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  charCount: {
    fontSize: 13,
    color: colors.gray3,
    textAlign: 'right',
    marginBottom: spacing.m,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: colors.gray4,
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray2,
  },
  buttonSave: {
    backgroundColor: colors.primary,
  },
  buttonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default EditNicknameModal;
