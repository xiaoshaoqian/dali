/**
 * PhoneInput Component
 * Phone number input with validation for Chinese phone numbers
 */
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { isValidPhone } from '@/services/authService';

interface PhoneInputProps {
  /** Current phone number value */
  value: string;
  /** Callback when phone number changes */
  onChangeText: (text: string) => void;
  /** Error message to display */
  error?: string;
  /** Whether input is disabled */
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChangeText,
  error,
  disabled = false,
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = useCallback(
    (text: string) => {
      // Only allow digits
      const digitsOnly = text.replace(/\D/g, '');
      // Limit to 11 digits
      const limited = digitsOnly.slice(0, 11);
      onChangeText(limited);
    },
    [onChangeText]
  );

  const isValid = value.length === 11 && isValidPhone(value);
  const showError = error || (value.length === 11 && !isValid);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          showError && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        <Text style={styles.prefix}>+86</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="请输入手机号"
          placeholderTextColor={colors.gray3}
          keyboardType="phone-pad"
          maxLength={11}
          editable={!disabled}
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
      </View>
      {showError && (
        <Text style={styles.errorText}>
          {error || '请输入正确的手机号码'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray4,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: spacing.m,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.gray5,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  prefix: {
    ...typography.body,
    color: colors.gray1,
    marginRight: spacing.s,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.gray1,
    padding: 0,
  },
  errorText: {
    ...typography.caption1,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
