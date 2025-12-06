import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

export default function PaymentsScreen() {
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
        <ThemedText type="title" style={styles.headerTitle}>
          Payment Methods
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Available Payment Methods</ThemedText>
          
          {/* COD Payment Method */}
          <View style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
              <View style={[styles.paymentIcon, { backgroundColor: '#50C87815' }]}>
                <Ionicons name="cash" size={24} color="#50C878" />
              </View>
              <View style={styles.paymentContent}>
                <ThemedText type="defaultSemiBold" style={styles.paymentName}>
                  Cash on Delivery (COD)
                </ThemedText>
                <ThemedText style={styles.paymentDescription}>
                  Pay with cash when your order arrives
                </ThemedText>
              </View>
            </View>
          </View>

          {/* GCash Payment Method */}
          <View style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
              <View style={[styles.paymentIcon, { backgroundColor: '#0070F315' }]}>
                <Ionicons name="phone-portrait" size={24} color="#0070F3" />
              </View>
              <View style={styles.paymentContent}>
                <ThemedText type="defaultSemiBold" style={styles.paymentName}>
                  GCash
                </ThemedText>
                <ThemedText style={styles.paymentDescription}>
                  Pay using your GCash wallet
                </ThemedText>
              </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  paymentCard: {
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
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentContent: {
    flex: 1,
    gap: 4,
  },
  paymentName: {
    fontSize: 16,
    color: '#333',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

