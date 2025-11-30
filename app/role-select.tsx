import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RoleSelectScreen() {
  const handleSelect = (role: 'customer' | 'seller') => {
    router.replace({ pathname: '/login', params: { role } });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('@/assets/images/Buyani.jpeg')} style={styles.logo} />
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>Choose your role</ThemedText>
        </View>
        <ThemedText type="title" style={styles.title}>
          Who are you?
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Let us know how you plan to experience Buyani so we can tailor the journey that fits you best.
        </ThemedText>

        <View style={styles.cardGroup}>
          <TouchableOpacity style={[styles.card, styles.customerCard]} onPress={() => handleSelect('customer')}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <FontAwesome name="shopping-bag" size={18} color="#4A7C59" />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                I&apos;m a Customer
              </ThemedText>
            </View>
            <ThemedText style={styles.cardText}>
              Discover local goods, browse categories, and order fresh finds from nearby communities.
            </ThemedText>
            <ThemedText style={styles.cta}>Start shopping →</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.sellerCard]} onPress={() => handleSelect('seller')}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, styles.iconCircleSeller]}>
                <FontAwesome name="leaf" size={18} color="#fff" />
              </View>
              <ThemedText type="defaultSemiBold" style={[styles.cardTitle, styles.cardTitleSeller]}>
                I&apos;m a Seller
              </ThemedText>
            </View>
            <ThemedText style={[styles.cardText, styles.cardTextSeller]}>
              Manage orders, track performance, and grow your Buyani storefront with trusted buyers.
            </ThemedText>
            <ThemedText style={[styles.cta, styles.ctaSeller]}>Open seller centre →</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 24,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: -8,
  },
  title: {
    textAlign: 'center',
    color: '#2C3E2D',
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B6B6B',
    lineHeight: 22,
  },
  cardGroup: {
    gap: 18,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  customerCard: {
    backgroundColor: '#fff',
  },
  sellerCard: {
    backgroundColor: '#2C3E2D',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSeller: {
    backgroundColor: '#f5821f',
  },
  cardTitle: {
    color: '#2C3E2D',
    fontSize: 18,
  },
  cardTitleSeller: {
    color: '#fff',
  },
  cardText: {
    color: '#6B6B6B',
    lineHeight: 20,
  },
  cardTextSeller: {
    color: '#E0E0E0',
  },
  cta: {
    marginTop: 12,
    color: '#4A7C59',
    fontSize: 13,
    fontWeight: '600',
  },
  ctaSeller: {
    color: '#fff',
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E8E8E8',
  },
  badgeText: {
    color: '#4A4A4A',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});


