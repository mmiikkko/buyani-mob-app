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

export default function LoginScreen() {
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

      // If successful, take the user into the correct area
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
    <ThemedView style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.replace('/role-select')}>
          <FontAwesome name="chevron-left" size={16} color="#1f5f29" />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>
        <Image source={require('@/assets/images/Buyani.jpeg')} style={styles.logo} />
        <ThemedText type="title" style={styles.title}>
          Login
        </ThemedText>

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
          placeholder="Password"
          placeholderTextColor="#8a8a8a"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
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

        <ThemedText style={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link href={{ pathname: '/signup', params: { role } }}>
            <ThemedText type="defaultSemiBold" style={styles.linkText}>
              Sign up
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
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#C4C4C4',
    paddingVertical: 12,
    marginBottom: 28,
    fontSize: 16,
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
});


