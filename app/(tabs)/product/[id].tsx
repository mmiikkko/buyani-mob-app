import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { api, type Product } from '@/lib/api';

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setIsVisible } = useTabBar();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Hide tab bar when component mounts
  useEffect(() => {
    setIsVisible(false);
    return () => {
      setIsVisible(true);
    };
  }, [setIsVisible]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await api.getProduct(id);
        setProduct(data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const images = product?.images || [];
  const currentImage = images[selectedImageIndex]?.image_url?.[0] || null;

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
          <ThemedText style={styles.loadingText}>Loading product...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !product) {
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
            {error || 'Product not found'}
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
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/(tabs)/cart')}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Product Images */}
        <View style={styles.imageSection}>
          {currentImage ? (
            <Image source={{ uri: currentImage }} style={styles.mainImage} contentFit="cover" />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Ionicons name="image-outline" size={64} color="#ccc" />
              <ThemedText style={styles.noImageText}>No image available</ThemedText>
            </View>
          )}
          
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageThumbnails}
              contentContainerStyle={styles.imageThumbnailsContent}
            >
              {images.map((img, index) => {
                const thumbnailUrl = img.image_url?.[0];
                return (
                  <TouchableOpacity
                    key={img.id}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && styles.thumbnailSelected,
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                    activeOpacity={0.7}
                  >
                    {thumbnailUrl ? (
                      <Image source={{ uri: thumbnailUrl }} style={styles.thumbnailImage} contentFit="cover" />
                    ) : (
                      <View style={styles.thumbnailPlaceholder}>
                        <Ionicons name="image-outline" size={20} color="#ccc" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleContainer}>
              <ThemedText type="title" style={styles.productName}>
                {product.productName}
              </ThemedText>
              {product.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFC107" />
                  <ThemedText style={styles.ratingText}>{product.rating}</ThemedText>
                </View>
              )}
            </View>
            <ThemedText type="title" style={styles.productPrice}>
              P{Number(product.price).toFixed(2)}
            </ThemedText>
          </View>

          {/* Shop Info */}
          <TouchableOpacity
            style={styles.shopInfo}
            onPress={() => router.push(`/(tabs)/shop/${product.shopId}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="storefront-outline" size={20} color="#50C878" />
            <ThemedText style={styles.shopName}>{product.shopName}</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Description
              </ThemedText>
              <ThemedText style={styles.description}>{product.description}</ThemedText>
            </View>
          )}

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Product Details
            </ThemedText>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Stock:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </ThemedText>
            </View>
            {product.SKU && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>SKU:</ThemedText>
                <ThemedText style={styles.detailValue}>{product.SKU}</ThemedText>
              </View>
            )}
            {product.itemsSold !== undefined && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Items Sold:</ThemedText>
                <ThemedText style={styles.detailValue}>{product.itemsSold}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.addToCartButton, !product.isAvailable && styles.addToCartButtonDisabled]}
          onPress={() => {
            if (product.isAvailable) {
              // TODO: Add to cart functionality
              console.log('Add to cart:', product.id);
            }
          }}
          disabled={!product.isAvailable}
          activeOpacity={0.8}
        >
          <Ionicons name="cart" size={20} color="#fff" />
          <ThemedText style={styles.addToCartText}>
            {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
          </ThemedText>
        </TouchableOpacity>
      </View>
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
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSection: {
    marginBottom: 24,
  },
  mainImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#f8f8f8',
  },
  noImagePlaceholder: {
    width: '100%',
    height: 400,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  noImageText: {
    color: '#999',
    fontSize: 14,
  },
  imageThumbnails: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  imageThumbnailsContent: {
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailSelected: {
    borderColor: '#50C878',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    paddingHorizontal: 20,
    gap: 20,
  },
  productHeader: {
    gap: 12,
  },
  productTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff9e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  productPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#50C878',
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
  },
  shopName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#50C878',
  },
  descriptionSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  detailsSection: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#50C878',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
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
});

