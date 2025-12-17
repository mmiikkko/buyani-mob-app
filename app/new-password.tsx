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

export default function NewPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    // Validate inputs
    if (!password.trim() || !confirmPassword.trim()) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.resetPasswordWithCode(email, code, password);
      
      if (result.success) {
        // Show success message and navigate to login
        alert('Password reset successful! You can now log in with your new password.');
        router.replace('/login');
      }
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
              New Password
            </ThemedText>
          </View>

          <ThemedText style={styles.subtitle}>
            Enter your new password below. Make sure it's at least 8 characters long.
          </ThemedText>

          <View style={styles.form}>
            <ThemedText style={styles.label}>New Password</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <ThemedText style={styles.label}>Confirm New Password</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.messageContainerError}>
              <ThemedText style={styles.messageTextError}>{error}</ThemedText>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Reset Password
              </ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <ThemedText style={styles.infoText}>
              Password should be at least 8 characters with a mix of letters, numbers, and symbols.
            </ThemedText>
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

  form: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.4,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },

  eyeButton: {
    padding: 10,
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

  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    gap: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});

