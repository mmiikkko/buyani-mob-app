import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

// Hide the default stack header so we only see our custom header row
export const options = {
  headerShown: false,
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter the Gmail you used to create your account.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.requestPasswordResetCode(email.trim());
      // Navigate to verify code page with email
      router.push({
        pathname: '/verify-reset-code',
        params: { email: email.trim() },
      });
    } catch (e: any) {
      setError(e.message || 'Failed to send reset code. Please try again.');
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
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              Forgot password
            </ThemedText>
          </View>

          <ThemedText style={styles.subtitle}>
            Enter the Gmail / email you used to sign up. We'll send you a 6-digit
            verification code to reset your password.
          </ThemedText>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="your@gmail.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
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
                Send verification code
              </ThemedText>
            )}
          </TouchableOpacity>
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

  /* ---------- HEADER ---------- */
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logo: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 48,
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
    marginTop:4,
    marginBottom: 24,
    textAlign: 'justify',
    lineHeight: 20,
  },
  

  /* ---------- FORM ---------- */
  formContainer: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 6px 20px rgba(0,0,0,0.06)',
      },
    }),
  },

  inputWrapper: {
    marginBottom: 14,
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

  forgotPasswordText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: ORANGE,
    alignSelf: 'flex-end',
  },

  /* ---------- BUTTON ---------- */
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

  backButton: {
    marginTop: 40, // 👈 pushes the back button down
    marginBottom: 12,
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 12,
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

  /* ---------- FOOTER ---------- */
  termsCopy: {
    marginTop: 16,
    marginBottom: 18,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },

  linkText: {
    color: ORANGE,
    fontWeight: '700',
  },

  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },

  /* ---------- ERRORS ---------- */
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
});



