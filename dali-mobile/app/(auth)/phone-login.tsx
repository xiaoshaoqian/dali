/**
 * Phone Login Screen
 * SMS-based phone registration and verification
 * AC: #1, #2, #3, #4 from Story 1.1
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { CodeInput, PhoneInput } from '@/components/auth';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useCountdown } from '@/hooks/useCountdown';
import { authService, isValidPhone } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

type AuthStep = 'phone' | 'code';

const MAX_VERIFY_ATTEMPTS = 3;

export default function PhoneLoginScreen() {
  // Form state
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<AuthStep>('phone');

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyAttempts, setVerifyAttempts] = useState(0);

  // Countdown for SMS resend
  const { countdown, isActive: isCountdownActive, start: startCountdown } = useCountdown(60);

  // Auth store
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  // Derived state
  const isPhoneValid = isValidPhone(phone);
  const canSendSMS = isPhoneValid && !isCountdownActive && !isLoading;
  const canVerify = code.length === 6 && !isLoading;

  /**
   * Handle SMS send request
   */
  const handleSendSMS = useCallback(async () => {
    if (!canSendSMS) return;

    setError(null);
    setIsLoading(true);

    try {
      await authService.sendSMS(phone);
      startCountdown();
      setStep('code');
      setCode('');
      setVerifyAttempts(0);
    } catch (err) {
      const apiError = err as { message?: string };
      setError(apiError.message || '发送验证码失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [canSendSMS, phone, startCountdown]);

  /**
   * Handle code verification
   */
  const handleVerifyCode = useCallback(
    async (verifyCode: string) => {
      if (verifyCode.length !== 6 || isLoading) return;

      setError(null);
      setIsLoading(true);

      try {
        const response = await authService.verifySMS(phone, verifyCode);

        // Update auth state
        setAuthenticated(response.userId, response.isNewUser);

        // Navigate based on user status
        if (response.isNewUser) {
          // New user - go to onboarding
          router.replace('/(onboarding)');
        } else {
          // Existing user - go to main app
          router.replace('/(tabs)');
        }
      } catch (err) {
        const apiError = err as { message?: string; details?: { attemptsRemaining?: number } };
        const newAttempts = verifyAttempts + 1;
        setVerifyAttempts(newAttempts);

        if (newAttempts >= MAX_VERIFY_ATTEMPTS) {
          setError('验证码错误次数过多，请重新获取');
          setStep('phone');
          setCode('');
          setVerifyAttempts(0);
        } else {
          const remaining = MAX_VERIFY_ATTEMPTS - newAttempts;
          setError(
            apiError.message || `验证码错误，还可尝试 ${remaining} 次`
          );
          setCode('');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [phone, isLoading, verifyAttempts, setAuthenticated]
  );

  /**
   * Handle resend SMS
   */
  const handleResendSMS = useCallback(async () => {
    if (isCountdownActive || isLoading) return;
    await handleSendSMS();
  }, [isCountdownActive, isLoading, handleSendSMS]);

  /**
   * Handle back to phone input
   */
  const handleBack = useCallback(() => {
    setStep('phone');
    setCode('');
    setError(null);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 'phone' ? '手机号登录' : '输入验证码'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'phone'
                ? '未注册的手机号将自动创建账号'
                : `验证码已发送至 +86 ${phone}`}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 'phone' ? (
              <>
                <PhoneInput
                  value={phone}
                  onChangeText={setPhone}
                  error={error || undefined}
                  disabled={isLoading}
                />
                <TouchableOpacity
                  style={[styles.buttonContainer, !canSendSMS && styles.buttonDisabled]}
                  onPress={handleSendSMS}
                  disabled={!canSendSMS}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      canSendSMS
                        ? [colors.gradientStart, colors.gradientEnd]
                        : [colors.gray3, colors.gray3]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.gray5} />
                    ) : (
                      <Text style={styles.buttonText}>获取验证码</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <CodeInput
                  value={code}
                  onChangeText={setCode}
                  onComplete={handleVerifyCode}
                  error={error || undefined}
                  disabled={isLoading}
                />
                <View style={styles.codeActions}>
                  <TouchableOpacity onPress={handleBack} disabled={isLoading}>
                    <Text style={styles.linkText}>更换手机号</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleResendSMS}
                    disabled={isCountdownActive || isLoading}
                  >
                    <Text
                      style={[
                        styles.linkText,
                        (isCountdownActive || isLoading) && styles.linkTextDisabled,
                      ]}
                    >
                      {isCountdownActive ? `${countdown}s 后重新发送` : '重新发送'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.buttonContainer, !canVerify && styles.buttonDisabled]}
                  onPress={() => handleVerifyCode(code)}
                  disabled={!canVerify}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      canVerify
                        ? [colors.gradientStart, colors.gradientEnd]
                        : [colors.gray3, colors.gray3]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.gray5} />
                    ) : (
                      <Text style={styles.buttonText}>验证登录</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              登录即表示同意{' '}
              <Text style={styles.footerLink}>用户协议</Text>
              {' '}和{' '}
              <Text style={styles.footerLink}>隐私政策</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray5,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.largeTitle,
    color: colors.gray1,
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray2,
  },
  form: {
    gap: spacing.m,
  },
  buttonContainer: {
    marginTop: spacing.s,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.headline,
    color: colors.gray5,
  },
  codeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.s,
  },
  linkText: {
    ...typography.subhead,
    color: colors.primary,
  },
  linkTextDisabled: {
    color: colors.gray3,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.l,
    right: spacing.l,
  },
  footerText: {
    ...typography.caption1,
    color: colors.gray3,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.primary,
  },
});
