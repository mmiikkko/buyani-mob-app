import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

export default function ShopApplicationStatusScreen() {
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const params = useLocalSearchParams<{ shopName?: string }>();
  const shopName = params.shopName || 'Your Shop';

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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
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
              {shopName}
            </ThemedText>
          </View>

          {/* Status Section */}
          <View style={styles.statusSection}>
            <ThemedText style={styles.label}>Status:</ThemedText>
            <View style={styles.statusBadge}>
              <ThemedText type="defaultSemiBold" style={styles.statusText}>
                Pending Approval
              </ThemedText>
            </View>
          </View>

          {/* Informational Message */}
          <View style={styles.messageSection}>
            <ThemedText style={styles.messageText}>
              Your shop application is being reviewed. You will be notified once it's approved.
            </ThemedText>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/(tabs)')}>
              <ThemedText style={styles.footerLink}>Return to home</ThemedText>
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  titleSection: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
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
  footer: {
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 15,
    color: '#666',
  },
});

