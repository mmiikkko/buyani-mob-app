import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();

  // Hide tab bar immediately when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsVisible(false);
      return () => {
        setIsVisible(true);
      };
    }, [setIsVisible])
  );

  const handleEmailPress = () => {
    const email = 'camarinesnortemarkethub@gmail.com';
    const subject = 'Support Request';
    const body = 'Hello, I need help with...';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          console.log("Don't know how to open email");
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const handlePhonePress = () => {
    const phoneNumber = 'tel:+639123456789'; // Replace with actual phone number if available
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch((err) => console.error('An error occurred', err));
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
          { paddingTop: 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle" size={48} color="#50C878" />
          </View>
          <ThemedText type="title" style={styles.welcomeTitle}>
            How can we help you?
          </ThemedText>
          <ThemedText style={styles.welcomeText}>
            We're here to assist you with any questions or concerns you may have.
          </ThemedText>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>
          
          {/* Email */}
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleEmailPress}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#FF6B6B15' }]}>
              <Ionicons name="mail" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.contactContent}>
              <ThemedText type="defaultSemiBold" style={styles.contactLabel}>
                Email
              </ThemedText>
              <ThemedText style={styles.contactValue}>
                camarinesnortemarkethub@gmail.com
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Phone (if available) */}
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handlePhonePress}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#4A90E215' }]}>
              <Ionicons name="call" size={24} color="#4A90E2" />
            </View>
            <View style={styles.contactContent}>
              <ThemedText type="defaultSemiBold" style={styles.contactLabel}>
                Phone
              </ThemedText>
              <ThemedText style={styles.contactValue}>
                +63 912 345 6789
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Location */}
          <View style={styles.contactCard}>
            <View style={[styles.contactIcon, { backgroundColor: '#50C87815' }]}>
              <Ionicons name="location" size={24} color="#50C878" />
            </View>
            <View style={styles.contactContent}>
              <ThemedText type="defaultSemiBold" style={styles.contactLabel}>
                Location
              </ThemedText>
              <ThemedText style={styles.contactValue}>
                Camarines Norte State College
              </ThemedText>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Frequently Asked Questions</ThemedText>
          
          <View style={styles.faqCard}>
            <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
              How do I place an order?
            </ThemedText>
            <ThemedText style={styles.faqAnswer}>
              Browse products, add items to your cart, and proceed to checkout. Follow the steps to complete your order.
            </ThemedText>
          </View>

          <View style={styles.faqCard}>
            <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
              How can I track my order?
            </ThemedText>
            <ThemedText style={styles.faqAnswer}>
              Go to "My Orders" in your account to view order status and tracking information.
            </ThemedText>
          </View>

          <View style={styles.faqCard}>
            <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
              What payment methods are accepted?
            </ThemedText>
            <ThemedText style={styles.faqAnswer}>
              We accept various payment methods. Check the payment options during checkout.
            </ThemedText>
          </View>
        </View>

        {/* Additional Help */}
        <View style={styles.section}>
          <View style={styles.helpCard}>
            <Ionicons name="information-circle" size={24} color="#50C878" />
            <View style={styles.helpContent}>
              <ThemedText type="defaultSemiBold" style={styles.helpTitle}>
                Need more help?
              </ThemedText>
              <ThemedText style={styles.helpText}>
                Feel free to reach out to us via email or phone. We typically respond within 24 hours.
              </ThemedText>
            </View>
          </View>
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
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#50C87815',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
    gap: 4,
  },
  contactLabel: {
    fontSize: 14,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  faqQuestion: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#50C87830',
    gap: 12,
  },
  helpContent: {
    flex: 1,
    gap: 4,
  },
  helpTitle: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#4CAF50',
    lineHeight: 20,
  },
});

