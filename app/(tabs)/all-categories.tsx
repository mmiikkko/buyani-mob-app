import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api, type Category, type Product } from '@/lib/api';

// Hide this screen from the bottom tab bar – it behaves like a pushed page
export const unstable_settings = {
  href: null,
};

const CATEGORY_COLORS = ['#50C878', '#f5821f', '#50C878', '#f5821f', '#50C878', '#f5821f'];

// Normalize category id from product payload (handles possible snake_case)
const getProductCategoryId = (product: Product): string | null => {
  const raw =
    (product as any).categoryId ??
    (product as any).category_id ??
    (product as any).category?.id ??
    null;
  return raw !== null && raw !== undefined ? String(raw) : null;
};

// Best-effort category name from product, used as a fallback when ids don't line up
const getProductCategoryName = (product: Product): string => {
  const raw =
    (product as any).categoryName ??
    (product as any).category?.categoryName ??
    (product as any).category_name ??
    '';
  return String(raw).trim().toLowerCase();
};

export default function AllCategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hide tab bar when component mounts
  useEffect(() => {
    setIsVisible(false);
    return () => {
      setIsVisible(true);
    };
  }, [setIsVisible]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [categoriesData, productsData] = await Promise.all([
          api.getCategories(true),
          api.getProducts().catch(() => []),
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (err: any) {
        console.error('Error fetching categories/products:', err);
        setError(err.message || 'Failed to load categories');
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Back Button */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          All Categories
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
            <ThemedText style={styles.loadingText}>Loading categories...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#d0d0d0" />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
              Error loading categories
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {error}
            </ThemedText>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="grid-outline" size={64} color="#d0d0d0" />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
              No categories found
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Check back later for new categories.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => {
              const isExpanded = expandedCategoryId === category.id;
              const categoryIdStr = String(category.id);
              const categoryNameKey = (category.categoryName || '').trim().toLowerCase();

              const categoryProducts = products.filter((p) => {
                const pid = getProductCategoryId(p);
                if (pid && pid === categoryIdStr) {
                  return true;
                }

                // Fallback: match by category name when ids don't line up
                const pname = getProductCategoryName(p);
                return pname === categoryNameKey;
              });

              return (
                <View key={category.id}>
                  <TouchableOpacity
                    style={[
                      styles.categoryCard,
                      { borderLeftColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setExpandedCategoryId(
                        isExpanded ? null : category.id
                      );
                    }}
                  >
                    <View style={styles.categoryContent}>
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}20` },
                        ]}
                      >
                        <Ionicons
                          name="cube-outline"
                          size={32}
                          color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      </View>
                      <View style={styles.categoryTexts}>
                        <ThemedText type="defaultSemiBold" style={styles.categoryName}>
                          {category.categoryName}
                        </ThemedText>
                        <ThemedText style={styles.categoryCount}>
                          {category.productCount || 0}{' '}
                          {(category.productCount || 0) === 1 ? 'product' : 'products'}
                        </ThemedText>
                      </View>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.productsContainer}>
                      {categoryProducts.length === 0 ? (
                        <View style={styles.emptyProductsRow}>
                          <ThemedText style={styles.emptyProductsText}>
                            No products in this category yet.
                          </ThemedText>
                        </View>
                      ) : (
                        <View style={styles.productGrid}>
                          {categoryProducts.map((product) => {
                            let imageUrl: string | null = null;
                            if (product.images && product.images.length > 0) {
                              const first = product.images[0];
                              if (first.image_url) {
                                imageUrl = Array.isArray(first.image_url)
                                  ? first.image_url[0] || null
                                  : first.image_url;
                              }
                            }

                            return (
                              <TouchableOpacity
                                key={product.id}
                                style={styles.productCard}
                                activeOpacity={0.85}
                                onPress={() => router.push(`/(tabs)/product/${product.id}`)}
                              >
                                <View style={styles.productImageContainer}>
                                  {imageUrl ? (
                                    <Image
                                      source={{ uri: imageUrl }}
                                      style={styles.productImage}
                                      contentFit="cover"
                                      transition={150}
                                    />
                                  ) : (
                                    <View style={styles.productImagePlaceholder}>
                                      <Ionicons name="cube-outline" size={28} color="#9CA3AF" />
                                    </View>
                                  )}
                                </View>
                                <View style={styles.productCardBody}>
                                  <ThemedText numberOfLines={2} style={styles.productName}>
                                    {product.productName}
                                  </ThemedText>
                                  <ThemedText style={styles.productPrice}>
                                    ₱{Number(product.price || 0).toFixed(2)}
                                  </ThemedText>
                                  {product.shopName && (
                                    <View style={styles.productShopRow}>
                                      <Ionicons name="storefront-outline" size={12} color="#9CA3AF" />
                                      <ThemedText numberOfLines={1} style={styles.productShop}>
                                        {product.shopName}
                                      </ThemedText>
                                    </View>
                                  )}
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
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
  categoriesGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  categoryCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  categoryTexts: {
    flex: 1,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  categoryCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  productsContainer: {
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 16,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    gap: 8,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  productImageContainer: {
    width: '100%',
    height: 130,
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCardBody: {
    padding: 12,
    gap: 6,
  },
  productName: {
    fontSize: 13,
    color: '#111827',
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '600',
  },
  productShopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  productShop: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  emptyProductsRow: {
    paddingVertical: 4,
  },
  emptyProductsText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

