import { Image } from 'expo-image';
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

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: 'customer' | 'seller' }>();
  const initialRole = useMemo(
    () => (params.role === 'seller' ? 'seller' : 'customer'),
    [params.role],
  );
  const role: 'customer' | 'seller' = initialRole;
  
  // Customer fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Seller fields
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSeller = role === 'seller';

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

  const handleSignup = async () => {
    setError(null);

    if (isSeller) {
      if (!email || !password || !confirmPassword || !storeName || !ownerName || !phoneNumber || !businessCategory) {
        setError('Please fill in all required fields.');
        return;
      }
    } else {
      if (!username || !firstName || !lastName || !email || !password || !confirmPassword) {
        setError('Please fill in all required fields.');
        return;
      }
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.signup({
        email,
        password,
        username: isSeller ? undefined : username,
        firstName: isSeller ? undefined : firstName,
        lastName: isSeller ? undefined : lastName,
        name: isSeller ? ownerName : `${firstName} ${lastName}`,
        role,
        storeName: isSeller ? storeName : undefined,
        ownerName: isSeller ? ownerName : undefined,
        phoneNumber: isSeller ? phoneNumber : undefined,
        businessCategory: isSeller ? businessCategory : undefined,
      });

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
        // For other errors (validation, etc.), show the error
        setError(e.message || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <ThemedView style={[styles.wrapper, isSeller && styles.wrapperSeller]}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}>
        {isSeller ? (
          <>
            <View style={styles.sellerHeader}>
              <View>
                <ThemedText type="title" style={styles.sellerBrand}>
                  Buyani
                </ThemedText>
                <ThemedText style={styles.sellerBrandAccent}>Seller Centre</ThemedText>
              </View>
            </View>
            <Image 
              source={require('@/assets/images/Buyani.jpeg')} 
              style={styles.sellerLogo}
              contentFit="contain"
            />

            <View style={styles.sellerCard}>
              <ThemedText type="defaultSemiBold" style={styles.cardHeading}>
                Create Your Seller Account
              </ThemedText>
              <ThemedText style={styles.cardSubtext}>
                Join our growing community of local sellers.
              </ThemedText>

              <TextInput
                style={styles.sellerInput}
                placeholder="Store Name"
                placeholderTextColor="#889385"
                value={storeName}
                onChangeText={setStoreName}
              />
              <TextInput
                style={styles.sellerInput}
                placeholder="Owner Name"
                placeholderTextColor="#889385"
                value={ownerName}
                onChangeText={setOwnerName}
              />
              <TextInput
                style={styles.sellerInput}
                placeholder="Email Address"
                placeholderTextColor="#889385"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.sellerInput}
                placeholder="Phone Number"
                placeholderTextColor="#889385"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              <TextInput
                style={styles.sellerInput}
                placeholder="Business Category"
                placeholderTextColor="#889385"
                value={businessCategory}
                onChangeText={setBusinessCategory}
              />
              <TextInput
                style={styles.sellerInput}
                placeholder="Create a strong password"
                placeholderTextColor="#889385"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                style={styles.sellerInput}
                placeholder="Re-enter your password"
                placeholderTextColor="#889385"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <Image 
              source={require('@/assets/images/Buyani.jpeg')} 
              style={styles.logo}
              contentFit="contain"
            />
              <ThemedText type="title" style={styles.title}>
                Create Account
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Join Buyani and start shopping today
              </ThemedText>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Username</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              <View style={styles.nameRow}>
                <View style={[styles.inputWrapper, styles.nameInput]}>
                  <ThemedText style={styles.label}>First Name</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={[styles.inputWrapper, styles.nameInput]}>
                  <ThemedText style={styles.label}>Last Name</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

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
                />
              </View>

              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
          </>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSignup} 
          disabled={loading}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              {isSeller ? 'Create Seller Account' : 'Sign Up'}
            </ThemedText>
          )}
        </TouchableOpacity>

        <ThemedText style={styles.termsCopy}>
          By signing up, you agree to our{' '}
          <ThemedText type="defaultSemiBold" style={styles.linkText}>
            Terms & Privacy Policy
          </ThemedText>
        </ThemedText>

        <ThemedText style={styles.footerText}>
          Already have an account?{' '}
          <Link href={{ pathname: '/login', params: { role } }}>
            <ThemedText type="defaultSemiBold" style={styles.linkText}>
              Login
            </ThemedText>
          </Link>
        </ThemedText>
        </ScrollView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  wrapperSeller: {
    backgroundColor: '#E9F6EC',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 24,
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
    marginBottom: 24,
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  button: {
    marginTop: 8,
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
  // Seller styles
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerBrand: {
    color: '#1f5f29',
    fontSize: 28,
  },
  sellerBrandAccent: {
    color: '#f5821f',
    fontSize: 16,
  },
  sellerLogo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 24,
    borderRadius: 12,
  },
  sellerCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  cardHeading: {
    fontSize: 22,
    color: '#1f5f29',
    marginBottom: 4,
  },
  cardSubtext: {
    color: '#6a7567',
    marginBottom: 20,
    fontSize: 14,
  },
  sellerInput: {
    borderWidth: 1.5,
    borderColor: '#d7e3d0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f7fbf4',
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
});
