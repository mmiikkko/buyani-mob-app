import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router, useLocalSearchParams, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

export default function SignupScreen() {
  const params = useLocalSearchParams<{ role?: 'customer' | 'seller' }>();
  const initialRole = useMemo(
    () => (params.role === 'seller' ? 'seller' : 'customer'),
    [params.role],
  );
  const role: 'customer' | 'seller' = initialRole;
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSeller = role === 'seller';

  const handleSignup = async () => {
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isSeller && !name) {
      setError('Please provide your name.');
      return;
    }

    if (
      isSeller &&
      (!storeName || !ownerName || !phoneNumber || !businessCategory)
    ) {
      setError('Please complete the seller information.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.signup({
        email,
        password,
        name: isSeller ? undefined : name,
        role,
        storeName: isSeller ? storeName : undefined,
        ownerName: isSeller ? ownerName : undefined,
        phoneNumber: isSeller ? phoneNumber : undefined,
        businessCategory: isSeller ? businessCategory : undefined,
      });

      // Store the token
      await api.setToken(response.token);

      // If successful, take the user into the relevant experience
      const destination: Href =
        role === 'seller' ? ('/seller' as Href) : ('/(tabs)' as Href);
      router.replace(destination);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.wrapper, isSeller && styles.wrapperSeller]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.replace('/role-select')}>
          <FontAwesome name="chevron-left" size={16} color="#1f5f29" />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>
        {isSeller ? (
          <>
            <View style={styles.sellerHeader}>
              <View>
                <ThemedText type="title" style={styles.sellerBrand}>
                  Buyani
                </ThemedText>
                <ThemedText style={styles.sellerBrandAccent}>Seller Centre</ThemedText>
              </View>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace('/role-select')}>
                <ThemedText style={styles.backButtonText}>Back to Marketplace</ThemedText>
              </TouchableOpacity>
            </View>
            <Image source={require('@/assets/images/Buyani.jpeg')} style={styles.sellerLogo} />

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
            <Image source={require('@/assets/images/Buyani.jpeg')} style={styles.logo} />
            <ThemedText type="title" style={styles.title}>
              Register
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#8a8a8a"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8a8a8a"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Create Password"
              placeholderTextColor="#8a8a8a"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#8a8a8a"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </>
        )}

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
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

        {!isSeller && (
          <>
            <ThemedText style={styles.orText}>or</ThemedText>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="instagram" size={24} color="#C13584" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <ThemedText style={styles.footerText}>
          Already have an account?{' '}
          <Link href={{ pathname: '/login', params: { role } }}>
            <ThemedText type="defaultSemiBold" style={styles.linkText}>
              Login
            </ThemedText>
          </Link>
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapperSeller: {
    backgroundColor: '#E9F6EC',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingVertical: 40,
    paddingBottom: 80,
    justifyContent: 'flex-start',
  },
  title: {
    marginBottom: 40,
    color: '#276A2B',
    fontSize: 28,
  },
  logo: {
    width: 320,
    height: 320,
    borderRadius: 0,
    alignSelf: 'center',
    marginBottom: 24,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    color: '#1f5f29',
  },
  sellerLogo: {
    width: 220,
    height: 220,
    alignSelf: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#C4C4C4',
    paddingVertical: 12,
    marginBottom: 28,
    fontSize: 16,
  },
  sellerInput: {
    borderWidth: 1,
    borderColor: '#d7e3d0',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f7fbf4',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F5821F',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  termsCopy: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: '#696969',
  },
  linkText: {
    color: '#F5821F',
  },
  orText: {
    marginTop: 18,
    textAlign: 'center',
    color: '#8a8a8a',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 18,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  footerText: {
    textAlign: 'center',
    color: '#696969',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerBrand: {
    color: '#1f5f29',
  },
  sellerBrandAccent: {
    color: '#f5821f',
    fontSize: 16,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#1f5f29',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  backButtonText: {
    color: '#1f5f29',
    fontSize: 12,
  },
  sellerCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeading: {
    fontSize: 20,
    color: '#1f5f29',
  },
  cardSubtext: {
    color: '#6a7567',
    marginBottom: 16,
  },
});


