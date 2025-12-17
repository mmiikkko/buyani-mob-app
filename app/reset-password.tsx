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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.resetPassword(String(token), password);
      setSuccess(res.message || 'Password reset successfully. You can now log in.');

      // After a short delay, send back to login
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (e: any) {
      setError(e.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
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
              Reset password
            </ThemedText>
          </View>

          <ThemedText style={styles.subtitle}>
            Enter your new password below. This link was sent to the email you used to sign up.
          </ThemedText>

          <View style={styles.form}>
            <ThemedText style={styles.label}>New password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <ThemedText style={[styles.label, { marginTop: 16 }]}>
              Confirm new password
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Re-enter new password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {error ? (
            <View style={styles.messageContainerError}>
              <ThemedText style={styles.messageTextError}>{error}</ThemedText>
            </View>
          ) : null}

          {success ? (
            <View style={styles.messageContainerSuccess}>
              <ThemedText style={styles.messageTextSuccess}>{success}</ThemedText>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Save new password
              </ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  button: {
    marginTop: 4,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F5821F',
    ...Platform.select({
      ios: {
        shadowColor: '#F5821F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px 0px rgba(245, 130, 31, 0.3)',
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messageContainerError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageTextError: {
    color: '#DC2626',
    fontSize: 14,
  },
  messageContainerSuccess: {
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageTextSuccess: {
    color: '#166534',
    fontSize: 14,
  },
});


