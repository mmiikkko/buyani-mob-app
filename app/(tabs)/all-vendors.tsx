import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api, type Shop } from '@/lib/api';

export default function AllVendorsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep tab bar visible for this screen
  useEffect(() => {
    setIsVisible(true);
  }, [setIsVisible]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getShops('approved');
        setShops(data);
      } catch (err: any) {
        console.error('Error fetching shops:', err);
        setError(err.message || 'Failed to load shops');
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.placeholder} />
        <ThemedText type="title" style={styles.headerTitle}>
          All Shops
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#50C878" />
            <ThemedText style={styles.loadingText}>Loading vendors...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#d0d0d0" />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
              Error loading vendors
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {error}
            </ThemedText>
          </View>
        ) : shops.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="storefront-outline" size={64} color="#d0d0d0" />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
              No vendors found
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Check back later for new vendors.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.vendorsGrid}>
            {shops.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                style={styles.vendorCard}
                activeOpacity={0.8}
                onPress={() => {
                  router.push(`/(tabs)/shop/${shop.id}`);
                }}
              >
                <LinearGradient
                  colors={['#FFE082', '#C5E1A5', '#E8F5E9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.vendorCardHeader}
                >
                  {shop.image && (
                    <Image source={{ uri: shop.image }} style={styles.vendorImage} contentFit="cover" />
                  )}
                  <View style={styles.vendorIcon}>
                    <Ionicons name="storefront-outline" size={36} color="#1976D2" />
                  </View>
                </LinearGradient>
                <View style={styles.vendorCardBody}>
                  <ThemedText type="defaultSemiBold" style={styles.vendorShopName} numberOfLines={1}>
                    {shop.shop_name}
                  </ThemedText>
                  {shop.shop_rating && (
                    <View style={styles.vendorRating}>
                      <Ionicons name="star" size={16} color="#FFC107" />
                      <ThemedText style={styles.vendorRatingText}>{shop.shop_rating}</ThemedText>
                    </View>
                  )}
                  <ThemedText style={styles.vendorProductCount}>
                    {shop.products} {shop.products === 1 ? 'product' : 'products'}
                  </ThemedText>
                  <ThemedText style={styles.vendorSellerName} numberOfLines={1}>
                    by {shop.owner_name}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  vendorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  vendorCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  vendorCardHeader: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  vendorImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  vendorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorCardBody: {
    padding: 18,
    gap: 8,
  },
  vendorShopName: {
    fontSize: 17,
    marginBottom: 4,
    color: '#000',
  },
  vendorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vendorRatingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  vendorProductCount: {
    fontSize: 13,
    color: '#666',
  },
  vendorSellerName: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

