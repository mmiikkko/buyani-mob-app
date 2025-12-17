import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api, type Product, type Shop } from '@/lib/api';

function ShopProductCard({ item, onPress }: { item: Product; onPress: () => void }) {
  const imageUrl = item.images && item.images.length > 0 && item.images[0].image_url 
    ? item.images[0].image_url[0] 
    : null;

  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.productImageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="cover" />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="cube-outline" size={32} color="#ccc" />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <ThemedText type="defaultSemiBold" style={styles.productName} numberOfLines={2}>
          {item.productName}
        </ThemedText>
        <ThemedText style={styles.productPrice}>P{Number(item.price).toFixed(2)}</ThemedText>
        {item.rating && (
          <View style={styles.productRating}>
            <Ionicons name="star" size={12} color="#FFC107" />
            <ThemedText style={styles.productRatingText}>{item.rating}</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ShopDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setIsVisible } = useTabBar();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hide tab bar when component mounts
  useEffect(() => {
    setIsVisible(false);
    return () => {
      setIsVisible(true);
    };
  }, [setIsVisible]);

  useEffect(() => {
    const fetchShop = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await api.getShop(id);
        setShop(data);
      } catch (err: any) {
        console.error('Error fetching shop:', err);
        setError(err.message || 'Failed to load shop');
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) return;
      
      try {
        setProductsLoading(true);
        // Get all products and filter by shopId
        const allProducts = await api.getProducts();
        const shopProducts = allProducts.filter(p => p.shopId === id);
        setProducts(shopProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    if (shop) {
      fetchProducts();
    }
  }, [id, shop]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50C878" />
          <ThemedText style={styles.loadingText}>Loading shop...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !shop) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <ThemedText style={styles.errorText}>
            {error || 'Shop not found'}
          </ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Shop Header */}
        {shop.image ? (
          <View style={styles.shopHeader}>
            <Image source={{ uri: shop.image }} style={styles.shopHeaderImage} contentFit="cover" />
            <View style={styles.shopHeaderOverlay} />
          </View>
        ) : (
          <LinearGradient
            colors={['#50C878', '#45B869', '#3DA85A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shopHeader}
          >
            <View style={styles.shopHeaderContent}>
              <View style={styles.shopIcon}>
                <Ionicons name="storefront" size={48} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Shop Info */}
        <View style={styles.shopInfo}>
          <View style={styles.shopNameContainer}>
            <ThemedText type="title" style={styles.shopName}>
              {shop.shop_name}
            </ThemedText>
            {shop.shop_rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={18} color="#FFC107" />
                <ThemedText style={styles.ratingText}>{shop.shop_rating}</ThemedText>
              </View>
            )}
          </View>

          {shop.description && (
            <ThemedText style={styles.shopDescription}>{shop.description}</ThemedText>
          )}

          {/* Meta chips – owner, products, status */}
          <View style={styles.shopMeta}>
            {/* Owner */}
            {shop.owner_name && (
              <View style={styles.metaChip}>
                <Ionicons name="person-circle-outline" size={16} color="#4F46E5" />
                <ThemedText style={styles.metaChipText}>
                  {shop.owner_name}
                </ThemedText>
              </View>
            )}

            {/* Product count */}
            <View style={styles.metaChip}>
              <Ionicons name="cube-outline" size={16} color="#16A34A" />
              <ThemedText style={styles.metaChipText}>
                {(products?.length ?? shop.products) || 0}{' '}
                {(products?.length ?? shop.products) === 1 ? 'product' : 'products'}
              </ThemedText>
            </View>

            {/* Status */}
            {shop.status && (
              <View
                style={[
                  styles.metaChip,
                  styles.statusChip,
                  shop.status === 'approved'
                    ? styles.statusApproved
                    : shop.status === 'pending'
                    ? styles.statusPending
                    : styles.statusRejected,
                ]}
              >
                <Ionicons
                  name={
                    shop.status === 'approved'
                      ? 'checkmark-circle'
                      : shop.status === 'pending'
                      ? 'time-outline'
                      : 'close-circle'
                  }
                  size={16}
                  color={
                    shop.status === 'approved'
                      ? '#166534'
                      : shop.status === 'pending'
                      ? '#92400E'
                      : '#991B1B'
                  }
                />
                <ThemedText
                  style={[
                    styles.metaChipText,
                    shop.status === 'approved'
                      ? styles.statusApprovedText
                      : shop.status === 'pending'
                      ? styles.statusPendingText
                      : styles.statusRejectedText,
                  ]}
                >
                  {shop.status}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Products from {shop.shop_name}
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              {products.length} {products.length === 1 ? 'item' : 'items'} available
            </ThemedText>
          </View>

          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#50C878" />
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color="#ccc" />
              <ThemedText style={styles.emptyText}>No products available</ThemedText>
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={({ item }) => (
                <ShopProductCard
                  item={item}
                  onPress={() => router.push(`/(tabs)/product/${item.id}`)}
                />
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.productsGrid}
            />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopHeader: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  shopHeaderImage: {
    width: '100%',
    height: '100%',
  },
  shopHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  shopHeaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  shopInfo: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  shopNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  shopName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  shopDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginTop: 8,
  },
  shopMeta: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  metaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusChip: {
    borderWidth: 0,
  },
  statusApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusApprovedText: {
    color: '#166534',
  },
  statusPendingText: {
    color: '#92400E',
  },
  statusRejectedText: {
    color: '#991B1B',
  },
  productsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  productsGrid: {
    gap: 16,
  },
  productRow: {
    justifyContent: 'space-between',
    gap: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    maxWidth: '48%',
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
  productImageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f8f8f8',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 12,
    gap: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#50C878',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productRatingText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#50C878',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});

