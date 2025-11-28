import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router, type Href } from 'expo-router';
import React, { useState } from 'react';
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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace this with your real API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // If successful, take the user into the relevant experience
      const destination: Href =
        role === 'seller' ? ('/seller' as Href) : ('/(tabs)' as Href);
      router.replace(destination);
    } catch (e) {
      setError('Something went wrong. Please try again.');
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

        <ThemedText style={styles.switchLabel}>Sign up as</ThemedText>
        <View style={styles.roleSwitch}>
          {(['customer', 'seller'] as const).map((option) => {
            const isActive = role === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.roleOption, isActive && styles.roleOptionActive]}
                onPress={() => setRole(option)}>
                <ThemedText style={isActive ? styles.roleOptionTextActive : styles.roleOptionText}>
                  {option === 'customer' ? 'Customer' : 'Seller'}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              Sign Up
            </ThemedText>
          )}
        </TouchableOpacity>

        <ThemedText style={styles.termsCopy}>
          By signing up, you agree to our{' '}
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
          Already have an account?{' '}
          <Link href="/login">
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
  switchLabel: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 8,
  },
  roleSwitch: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d6d6d6',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#2d8a34',
    borderColor: '#2d8a34',
  },
  roleOptionText: {
    color: '#616161',
  },
  roleOptionTextActive: {
    color: '#fff',
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


