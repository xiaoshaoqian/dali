/**
 * CodeInput Component
 * 6-digit OTP verification code input
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface CodeInputProps {
  /** Current code value */
  value: string;
  /** Callback when code changes */
  onChangeText: (text: string) => void;
  /** Callback when all 6 digits are entered */
  onComplete?: (code: string) => void;
  /** Error message to display */
  error?: string;
  /** Whether input is disabled */
  disabled?: boolean;
}

const CODE_LENGTH = 6;

export function CodeInput({
  value,
  onChangeText,
  onComplete,
  error,
  disabled = false,
}: CodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = useCallback(
    (text: string) => {
      // Only allow digits
      const digitsOnly = text.replace(/\D/g, '');
      // Limit to 6 digits
      const limited = digitsOnly.slice(0, CODE_LENGTH);
      onChangeText(limited);

      // 不再自动提交，让用户手动点击验证按钮
    },
    [onChangeText]
  );

  const handlePress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Split code into array for display
  const codeArray = value.split('');
  const boxes = Array.from({ length: CODE_LENGTH }, (_, i) => codeArray[i] || '');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.boxContainer}
        onPress={handlePress}
        activeOpacity={1}
        disabled={disabled}
      >
        {boxes.map((digit, index) => (
          <View
            key={index}
            style={[
              styles.box,
              isFocused && index === value.length && styles.boxFocused,
              error && styles.boxError,
              disabled && styles.boxDisabled,
            ]}
          >
            <Text style={styles.digit}>{digit}</Text>
          </View>
        ))}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          editable={!disabled}
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: 48,
    height: 56,
    backgroundColor: colors.gray4,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.gray5,
  },
  boxError: {
    borderColor: colors.error,
  },
  boxDisabled: {
    opacity: 0.6,
  },
  digit: {
    ...typography.title2,
    fontWeight: '600',
    color: colors.gray1,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    ...typography.caption1,
    color: colors.error,
    marginTop: spacing.s,
    textAlign: 'center',
  },
});
