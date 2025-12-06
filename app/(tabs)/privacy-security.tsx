import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

export default function PrivacySecurityScreen() {
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
            <Ionicons name="shield-checkmark" size={48} color="#4A90E2" />
          </View>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Privacy & Security
          </ThemedText>
          <ThemedText style={styles.welcomeText}>
            Important information about privacy and security
          </ThemedText>
        </View>

        {/* Privacy Policy */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Privacy Policy</ThemedText>
          
          <View style={styles.infoCard}>
            <ThemedText style={styles.contentText}>
              At Buyani, we are committed to protecting your privacy and personal information. 
              We collect and use your data only to provide you with the best shopping experience 
              and to improve our services.
            </ThemedText>
            <ThemedText style={styles.contentText}>
              We collect information such as your name, email address, shipping address, and 
              payment details when you make a purchase. This information is used solely for 
              order processing, delivery, and customer support purposes.
            </ThemedText>
            <ThemedText style={styles.contentText}>
              We do not sell, trade, or rent your personal information to third parties. 
              Your data is stored securely using industry-standard encryption and security 
              measures to prevent unauthorized access.
            </ThemedText>
          </View>
        </View>

        {/* Security Requirements */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Security Requirements</ThemedText>
          
          <View style={styles.infoCard}>
            <ThemedText style={styles.contentText}>
              To ensure the security of your account, please follow these guidelines:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletPoint}>
                • Use a strong, unique password for your account
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • Never share your login credentials with anyone
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • Log out of your account when using shared devices
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • Report any suspicious activity immediately
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • Keep your app updated to the latest version
              </ThemedText>
            </View>
            <ThemedText style={styles.contentText}>
              We use secure payment processing and encrypt all financial transactions. 
              Your payment information is processed through trusted payment gateways 
              and is never stored on our servers.
            </ThemedText>
          </View>
        </View>

        {/* Data Protection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data Protection</ThemedText>
          
          <View style={styles.infoCard}>
            <ThemedText style={styles.contentText}>
              Your personal data is protected under applicable data protection laws. 
              We implement technical and organizational measures to safeguard your information 
              against unauthorized access, alteration, disclosure, or destruction.
            </ThemedText>
            <ThemedText style={styles.contentText}>
              You have the right to access, correct, or delete your personal information 
              at any time. You can also request a copy of your data or opt-out of certain 
              data processing activities by contacting our support team.
            </ThemedText>
            <ThemedText style={styles.contentText}>
              We retain your data only for as long as necessary to fulfill the purposes 
              outlined in this policy, unless a longer retention period is required by law.
            </ThemedText>
          </View>
        </View>

        {/* User Responsibilities */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>User Responsibilities</ThemedText>
          
          <View style={styles.infoCard}>
            <ThemedText style={styles.contentText}>
              As a user of Buyani, you are responsible for:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletPoint}>
                • Maintaining the confidentiality of your account credentials
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • Providing accurate and up-to-date information
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • Complying with all applicable laws and regulations
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • Not using the platform for any illegal or unauthorized purposes
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • Respecting the privacy and rights of other users
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Terms and Conditions</ThemedText>
          
          <View style={styles.infoCard}>
            <ThemedText style={styles.contentText}>
              By using Buyani, you agree to our Terms of Service. These terms govern 
              your use of the platform and outline your rights and responsibilities as a user.
            </ThemedText>
            <ThemedText style={styles.contentText}>
              We reserve the right to modify these policies at any time. Changes will be 
              communicated through the app or via email. Continued use of the platform 
              after changes constitutes acceptance of the updated policies.
            </ThemedText>
            <ThemedText style={styles.contentText}>
              If you have any questions or concerns about our privacy and security practices, 
              please contact us at camarinesnortemarkethub@gmail.com.
            </ThemedText>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.section}>
          <View style={styles.securityCard}>
            <Ionicons name="shield-checkmark" size={24} color="#4A90E2" />
            <View style={styles.infoContent}>
              <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
                Your Security is Our Priority
              </ThemedText>
              <ThemedText style={styles.infoText}>
                We use industry-standard encryption and security measures to protect your 
                personal information and transactions. Your data is safe with us.
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
    backgroundColor: '#4A90E215',
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
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
  contentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletList: {
    marginVertical: 12,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A90E230',
    gap: 12,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 16,
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#42A5F5',
    lineHeight: 20,
  },
});

