import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const MENU_ITEMS = [
  { id: 'orders', label: 'My Orders' },
  { id: 'address', label: 'Shipping Address' },
  { id: 'payments', label: 'Payment Methods' },
  { id: 'support', label: 'Help & Support' },
];

export default function AccountScreen() {
  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <ThemedText type="title" style={styles.avatarText}>
            B
          </ThemedText>
        </View>
        <View>
          <ThemedText type="title">Buyani Customer</ThemedText>
          <ThemedText style={styles.subText}>customer@buyani.app</ThemedText>
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
    backgroundColor: '#2d8a34',
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
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
    backgroundColor: '#f5821f',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
  },
});


