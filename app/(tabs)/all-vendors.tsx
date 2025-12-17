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
      <LinearGradient
        colors={['#50C878', '#40B068', '#35A05A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.placeholder} />
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="storefront" size={24} color="#fff" />
          </View>
          <ThemedText type="title" style={styles.headerTitle}>
            All Shops
          </ThemedText>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>

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
                {shop.image ? (
                  <View style={styles.vendorCardHeader}>
                    <Image source={{ uri: shop.image }} style={styles.vendorImage} contentFit="cover" />
                  </View>
                ) : (
                  <LinearGradient
                    colors={['#50C878', '#45B869', '#3DA85A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.vendorCardHeader}
                  >
                    <View style={styles.vendorIcon}>
                      <Ionicons name="storefront" size={36} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                )}
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
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  vendorCardHeader: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  vendorImage: {
    width: '100%',
    height: '100%',
  },
  vendorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  vendorRatingText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
  },
  vendorProductCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

