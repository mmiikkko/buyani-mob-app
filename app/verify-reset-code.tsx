import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

export const options = {
  headerShown: false,
};

export default function VerifyResetCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError('Please enter the 6-digit code.');
      return;
    }

    if (code.trim().length !== 6) {
      setError('Code must be 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.verifyResetCode(email, code.trim());
      
      if (result.success) {
        // Navigate to new password page
        router.push({
          pathname: '/new-password',
          params: { email, code: code.trim() },
        });
      }
    } catch (e: any) {
      setError(e.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError(null);

    try {
      await api.requestPasswordResetCode(email);
      setError('A new code has been sent to your email.');
    } catch (e: any) {
      setError(e.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      <ThemedView style={styles.wrapper}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              Verify Code
            </ThemedText>
          </View>

          <ThemedText style={styles.subtitle}>
            We've sent a 6-digit verification code to <ThemedText style={styles.emailText}>{email}</ThemedText>. Please enter it below.
          </ThemedText>

          <View style={styles.form}>
            <ThemedText style={styles.label}>Verification Code</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
          </View>

          {error ? (
            <View style={styles.messageContainerError}>
              <ThemedText style={styles.messageTextError}>{error}</ThemedText>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyCode}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Verify Code
              </ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <ThemedText style={styles.resendText}>Didn't receive the code? </ThemedText>
            <TouchableOpacity onPress={handleResendCode} disabled={resending}>
              <ThemedText style={[styles.resendLink, resending && styles.resendLinkDisabled]}>
                {resending ? 'Sending...' : 'Resend Code'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const ORANGE = '#F5821F';
const EMERALD = '#276A2B';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },

  header: {
    marginBottom: 8,
  },

  backButton: {
    marginTop: 40,
    marginBottom: 12,
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: EMERALD,
    letterSpacing: -0.3,
    marginBottom: 6,
    marginTop: 190,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'justify',
    lineHeight: 20,
  },

  emailText: {
    fontWeight: '600',
    color: EMERALD,
  },

  form: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1.4,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 4,
    fontSize: 24,
    fontWeight: '600',
  },

  messageContainerError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },

  messageTextError: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },

  button: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: ORANGE,
    ...Platform.select({
      ios: {
        shadowColor: ORANGE,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: `0px 6px 16px rgba(245, 130, 31, 0.35)`,
      },
    }),
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },

  resendLink: {
    fontSize: 14,
    color: ORANGE,
    fontWeight: '600',
  },

  resendLinkDisabled: {
    opacity: 0.5,
  },
});

