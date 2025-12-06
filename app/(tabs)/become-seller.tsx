import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

export default function BecomeSellerScreen() {
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Hide tab bar immediately when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsVisible(false);
      return () => {
        setIsVisible(true);
      };
    }, [setIsVisible])
  );

  const handleRegisterShop = async () => {
    if (!shopName.trim() || !shopDescription.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    // TODO: Implement API call to register shop
    console.log('Registering shop:', { shopName, shopDescription });
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/(tabs)/shop-application-status',
        params: { shopName: shopName.trim() },
      });
    }, 1000);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Back Button */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/account')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <ThemedText type="title" style={styles.mainTitle}>
            Apply to Become a Seller
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Fill out the form below to submit your shop application.
          </ThemedText>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <ThemedText type="title" style={styles.cardTitle}>
            Become a Seller
          </ThemedText>
          <ThemedText style={styles.cardSubtitle}>
            Create your shop to start selling on our platform.
          </ThemedText>

          {/* Shop Name Input */}
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Shop Name
            </ThemedText>
            <TextInput
              style={styles.input}
              value={shopName}
              onChangeText={setShopName}
              placeholder="My Awesome Store"
              placeholderTextColor="#999"
            />
          </View>

          {/* Shop Description Input */}
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Shop Description
            </ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={shopDescription}
              onChangeText={setShopDescription}
              placeholder="Tell customers about your shop..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Register Shop Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegisterShop}
            disabled={loading}
            activeOpacity={0.8}
          >
            <ThemedText type="defaultSemiBold" style={styles.registerButtonText}>
              Register Shop
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Want to go back?{' '}
            <ThemedText
              style={styles.footerLink}
              onPress={() => router.push('/(tabs)')}
            >
              Return home
            </ThemedText>
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#f5f7fa',
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  titleSection: {
    width: '100%',
    maxWidth: 600,
    marginBottom: 32,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  registerButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px 0px rgba(46, 125, 50, 0.3)',
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#666',
  },
  footerLink: {
    fontSize: 15,
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
});

