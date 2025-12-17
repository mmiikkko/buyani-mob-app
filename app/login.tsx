import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { KeyboardAvoidingView } from 'react-native';
import { Link, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: 'customer' | 'seller' }>();
  const initialRole = useMemo(
    () => (params.role === 'seller' ? 'seller' : 'customer'),
    [params.role],
  );
  const role: 'customer' | 'seller' = initialRole;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleForgotPassword = () => {
    router.push('/forgot-password' as Href);
  };

  const handleLogin = async () => {
    setError(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.login({ email, password, role });
      
      // Store the token
      await api.setToken(response.token);

      // Smooth fade-out transition before navigation
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });
      translateY.value = withTiming(-20, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });

      // Navigate after animation completes
      setTimeout(() => {
        const destination: Href =
          role === 'seller' ? ('/seller' as Href) : ('/(tabs)' as Href);
        router.replace(destination);
      }, 300);
    } catch (e: any) {
      // Check if it's a network/server connection error
      const isNetworkError = e.message?.includes('Cannot connect to server') || 
                            e.message?.includes('Network request failed') ||
                            e.message?.includes('Failed to fetch');
      
      if (isNetworkError) {
        // For network errors, allow demo mode - store a demo token and proceed
        // This allows users to see the UI even when backend is unavailable
        await api.setToken('demo-token-offline-mode');
        
        // Show a warning but still proceed
        setError(
          '⚠️ Cannot connect to server. Continuing in offline mode. ' +
          'Some features may not work until the server is available.'
        );
        
        setLoading(false);
        
        // Navigate after a brief delay to show the warning
        setTimeout(() => {
          // Smooth fade-out transition before navigation
          opacity.value = withTiming(0, {
            duration: 300,
            easing: Easing.in(Easing.ease),
          });
          translateY.value = withTiming(-20, {
            duration: 300,
            easing: Easing.in(Easing.ease),
          });

          setTimeout(() => {
            const destination: Href =
              role === 'seller' ? ('/seller' as Href) : ('/(tabs)' as Href);
            router.replace(destination);
          }, 300);
        }, 1500);
      } else {
        // For other errors (invalid credentials, etc.), show the error
        setError(e.message || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
<KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
  >
  <ThemedView style={styles.wrapper}>
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <ScrollView

          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Image 
              source={require('@/assets/images/Buyani.jpeg')} 
              style={styles.logo}
              contentFit="contain"
            />
            <ThemedText type="title" style={styles.title}>
              Welcome Back
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign in to continue to Buyani
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoComplete="email"
              />
            </View>

            <View style={styles.inputWrapper}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}>
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.forgotPasswordText}>
                  Forgot password?
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin} 
            disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Log In
              </ThemedText>
            )}
          </TouchableOpacity>

          <ThemedText style={styles.termsCopy}>
            By logging in, you agree to our{' '}
            <ThemedText type="defaultSemiBold" style={styles.linkText}>
              Terms & Privacy Policy
            </ThemedText>
          </ThemedText>

          <ThemedText style={styles.footerText}>
            Don&apos;t have an account?{' '}
            <Link href={{ pathname: '/signup', params: { role } }}>
              <ThemedText type="defaultSemiBold" style={styles.linkText}>
                Sign up
              </ThemedText>
            </Link>
          </ThemedText>
        </ScrollView>
      </Animated.View>
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
    paddingVertical: 45,
    paddingBottom: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 12,
    marginBottom: 24,
    marginTop: 60,
  },
  title: {
    marginBottom: 8,
    color: '#276A2B',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 1,
  },
  inputWrapper: {
    marginBottom: 20,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  forgotPasswordText: {
    marginTop: 8,
    fontSize: 13,
    color: '#F5821F',
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  eyeButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 1,
    marginBottom: 16,
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
  termsCopy: {
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  linkText: {
    color: '#F5821F',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
});
