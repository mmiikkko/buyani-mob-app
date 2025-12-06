import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const MENU_ITEMS = [
  { id: 'profile', label: 'Store Profile' },
  { id: 'products', label: 'Manage Products' },
  { id: 'payouts', label: 'Payout Settings' },
  { id: 'support', label: 'Seller Support' },
];

export default function SellerAccountScreen() {
  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <ThemedText type="title" style={styles.avatarText}>
            S
          </ThemedText>
        </View>
        <View>
          <ThemedText type="title">Buyani Seller</ThemedText>
          <ThemedText style={styles.subText}>seller@buyani.app</ThemedText>
        </View>
      </View>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem}>
            <ThemedText>{item.label}</ThemedText>
            <ThemedText style={styles.chevron}>{'>'}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText type="defaultSemiBold" style={styles.logoutText}>
          Log out
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5821f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
  },
  subText: {
    color: '#666',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ececec',
  },
  chevron: {
    color: '#888',
  },
  logoutButton: {
    marginTop: 'auto',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#2d8a34',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
  },
});


