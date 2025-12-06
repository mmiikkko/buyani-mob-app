import React, { useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();

  // Hide tab bar immediately when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Hide tab bar when cart screen is focused
      setIsVisible(false);
      
      // Show tab bar again when screen loses focus
      return () => {
        setIsVisible(true);
      };
    }, [setIsVisible])
  );

  return (
    <ThemedView style={styles.wrapper}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Shopping Cart
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.emptyCartContainer}>
          <View style={styles.cartIconContainer}>
            <Ionicons name="cart-outline" size={80} color="#d0d0d0" />
          </View>
          <ThemedText type="title" style={styles.emptyCartTitle}>
            Your cart is empty
          </ThemedText>
          <ThemedText style={styles.emptyCartSubtitle}>
            Add some items to get started!
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.continueShoppingButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.continueShoppingText}>Continue Shopping</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cartIconContainer: {
    marginBottom: 24,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  continueShoppingButton: {
    backgroundColor: '#50C878',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#50C878',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px 0px rgba(80, 200, 120, 0.3)',
      },
    }),
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

