import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api } from '@/lib/api';

const SHOP_REGISTRATION_KEY_PREFIX = 'shop_registration_';

interface ShopRegistration {
  shopName: string;
  shopDescription: string;
  status?: 'pending' | 'approved';
}

export default function BecomeSellerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredShop, setRegisteredShop] = useState<ShopRegistration | null>(null);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(true);
  const [registrationKey, setRegistrationKey] = useState<string | null>(null);

  // Check if shop is already registered on mount
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        // Require an authenticated user so registration is always scoped per account
        const token = await api.getToken();
        if (!token) {
          setIsLoadingRegistration(false);
          return;
        }

        const user = await api.getCurrentUser();
        const userIdentifier = user?.id || user?.email;
        if (!userIdentifier) {
          setIsLoadingRegistration(false);
          return;
        }

        const key = `${SHOP_REGISTRATION_KEY_PREFIX}${userIdentifier}`;
        setRegistrationKey(key);

        const registrationData = await AsyncStorage.getItem(key);
        if (registrationData) {
          const registration: ShopRegistration = JSON.parse(registrationData);
          // Default to approved if status is not set (for existing registrations)
          if (!registration.status) {
            registration.status = 'approved';
            await AsyncStorage.setItem(key, JSON.stringify(registration));
          }
          setRegisteredShop(registration);
          setIsRegistered(true);
        }
      } catch (error) {
        console.error('Error checking registration:', error);
      } finally {
        setIsLoadingRegistration(false);
      }
    };

    checkRegistration();
  }, []);

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

    if (!registrationKey) {
      alert('Unable to determine your account. Please log in again and try registering your shop.');
      return;
    }

    setLoading(true);
    // TODO: Implement API call to register shop
    console.log('Registering shop:', { shopName, shopDescription });
    
    // Save registration to AsyncStorage with approved status
    const registration: ShopRegistration = {
      shopName: shopName.trim(),
      shopDescription: shopDescription.trim(),
      status: 'approved', // Set to approved for testing
    };
    
    try {
      await AsyncStorage.setItem(registrationKey, JSON.stringify(registration));
      setRegisteredShop(registration);
      setIsRegistered(true);
      setLoading(false);
    } catch (error) {
      console.error('Error saving registration:', error);
      setLoading(false);
      alert('Failed to save registration. Please try again.');
    }
  };

  // Show loading state while checking registration
  if (isLoadingRegistration) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/account')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Show status card if already registered
  if (isRegistered && registeredShop) {
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
            { paddingTop: 20, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Card */}
          <View style={styles.statusCard}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <ThemedText type="title" style={styles.mainTitle}>
                Shop Application Status
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Your shop application status
              </ThemedText>
            </View>

            {/* Shop Information Section */}
            <View style={styles.infoSection}>
              <ThemedText style={styles.label}>Shop Name:</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.shopName}>
                {registeredShop.shopName}
              </ThemedText>
            </View>

            {/* Shop Description Section */}
            <View style={styles.infoSection}>
              <ThemedText style={styles.label}>Shop Description:</ThemedText>
              <ThemedText style={styles.shopDescription}>
                {registeredShop.shopDescription}
              </ThemedText>
            </View>

            {/* Status Section */}
            <View style={styles.statusSection}>
              <ThemedText style={styles.label}>Status:</ThemedText>
              <View style={[
                styles.statusBadge,
                registeredShop.status === 'approved' && styles.statusBadgeApproved
              ]}>
                <ThemedText type="defaultSemiBold" style={styles.statusText}>
                  {registeredShop.status === 'approved' ? 'Approved' : 'Pending Approval'}
                </ThemedText>
              </View>
            </View>

            {/* Informational Message */}
            <View style={styles.messageSection}>
              <ThemedText style={styles.messageText}>
                {registeredShop.status === 'approved' 
                  ? 'Congratulations! Your shop application has been approved. You can now start selling on our platform.'
                  : 'Your shop application is being reviewed. You will be notified once it\'s approved.'}
              </ThemedText>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Footer */}
            <View style={styles.footer}>
              {registeredShop.status === 'approved' ? (
                <>
                  <TouchableOpacity 
                    style={styles.sellerDashboardButton}
                    onPress={() => router.push('/seller/home')}
                  >
                    <ThemedText type="defaultSemiBold" style={styles.sellerDashboardButtonText}>
                      Go to Seller Dashboard
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.footerLinkButton}
                    onPress={() => router.push('/(tabs)')}
                  >
                    <ThemedText style={styles.footerLink}>Return to home</ThemedText>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={() => router.push('/(tabs)')}>
                  <ThemedText style={styles.footerLink}>Return to home</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  // Show form if not registered
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
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
  infoSection: {
    marginBottom: 20,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  shopDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginTop: 8,
  },
  statusSection: {
    marginBottom: 24,
  },
  statusBadge: {
    backgroundColor: '#FFF9C4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusBadgeApproved: {
    backgroundColor: '#C8E6C9',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  messageSection: {
    marginBottom: 24,
  },
  messageText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 24,
  },
  sellerDashboardButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
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
  sellerDashboardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLinkButton: {
    marginTop: 8,
  },
});

