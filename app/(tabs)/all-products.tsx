import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, FlatList, View, TouchableOpacity, Platform, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api, type Product, type Category } from '@/lib/api';

function ProductCard({ item }: { item: Product }) {
  const imageUrl = item.images && item.images.length > 0 && item.images[0].image_url 
    ? item.images[0].image_url[0] 
    : null;

  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.85}
      onPress={() => {
        // TODO: Navigate to product detail page
        console.log(`Product ${item.productName} pressed`);
      }}
    >
      <View style={styles.productImageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="cover" />
        ) : (
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.noImagePlaceholder}
          >
            <View style={styles.imageIconContainer}>
              <Ionicons name="cube-outline" size={40} color="#4CAF50" />
            </View>
          </LinearGradient>
        )}
      </View>
      <View style={styles.productInfo}>
        <ThemedText type="defaultSemiBold" style={styles.productName} numberOfLines={2}>
          {item.productName}
        </ThemedText>
        <View style={styles.priceContainer}>
          <ThemedText style={styles.productPrice}>P{Number(item.price).toFixed(2)}</ThemedText>
        </View>
        <View style={styles.shopContainer}>
          <Ionicons name="storefront-outline" size={12} color="#999" />
          <ThemedText style={styles.productShopName} numberOfLines={1}>
            {item.shopName}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AllProductsScreen() {
  const insets = useSafeAreaInsets();
  const { isVisible, setIsVisible } = useTabBar();
  const scrollY = useRef(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(),
          api.getCategories(true).catch(() => []),
        ]);
        setAllProducts(productsData);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load products');
        setProducts([]);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = allProducts.filter(
        (product) => product.categoryId === selectedCategory
      );
      setProducts(filtered);
    } else {
      setProducts(allProducts);
    }
  }, [selectedCategory, allProducts]);

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDifference = currentScrollY - lastScrollY;

    // Always show at the top
    if (currentScrollY <= 10) {
      if (!isVisible) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
      return;
    }

    // Show tab bar when scrolling up, hide when scrolling down
    // Use a threshold to avoid flickering
    if (Math.abs(scrollDifference) > 5) {
      if (scrollDifference > 0 && isVisible) {
        // Scrolling down - hide
        setIsVisible(false);
      } else if (scrollDifference < 0 && !isVisible) {
        // Scrolling up - show
        setIsVisible(true);
      }
    }

    setLastScrollY(currentScrollY);
    scrollY.current = currentScrollY;
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#50C878', '#40B068', '#35A05A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 48 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="cube" size={28} color="#fff" />
            </View>
            <View>
              <ThemedText type="title" style={styles.headerTitle}>
                All Products
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {loading ? 'Loading...' : `${products.length} amazing products`}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, showDropdown && styles.filterButtonActive]} 
            activeOpacity={0.7}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Ionicons 
              name={showDropdown ? "close" : "options-outline"} 
              size={22} 
              color="#fff" 
            />
            {selectedCategory && !showDropdown && (
              <View style={styles.filterBadge}>
                <View style={styles.filterBadgeDot} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50C878" />
          <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
          </View>
          <ThemedText type="title" style={styles.emptyTitle}>
            Error loading products
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            {error}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => <ProductCard item={item} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cube-outline" size={64} color="#ccc" />
              </View>
              <ThemedText type="title" style={styles.emptyTitle}>
                No products found
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Check back later for new products.
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Filter Dropdown */}
      {showDropdown && (
        <>
          <Pressable 
            style={[styles.dropdownOverlay, { top: insets.top + 100 }]}
            onPress={() => setShowDropdown(false)}
          />
          <View style={[styles.dropdownContainer, { paddingTop: insets.top + 100 }]}>
            <View style={styles.dropdown}>
            <View style={styles.dropdownHeader}>
              <ThemedText type="defaultSemiBold" style={styles.dropdownTitle}>
                Filter by Category
              </ThemedText>
              {selectedCategory && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(null);
                    setShowDropdown(false);
                  }}
                  style={styles.clearButton}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView 
              style={styles.dropdownContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  !selectedCategory && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedCategory(null);
                  setShowDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownItemLeft}>
                  <View style={[
                    styles.checkbox,
                    !selectedCategory && styles.checkboxActive
                  ]}>
                    {!selectedCategory && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <ThemedText
                    style={[
                      styles.dropdownItemText,
                      !selectedCategory && styles.dropdownItemTextActive,
                    ]}
                  >
                    All Categories
                  </ThemedText>
                </View>
                <View style={styles.dropdownBadge}>
                  <ThemedText style={styles.dropdownBadgeText}>
                    {allProducts.length}
                  </ThemedText>
                </View>
              </TouchableOpacity>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.dropdownItem,
                    selectedCategory === category.id && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setShowDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.dropdownItemLeft}>
                    <View style={[
                      styles.checkbox,
                      selectedCategory === category.id && styles.checkboxActive
                    ]}>
                      {selectedCategory === category.id && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <ThemedText
                      style={[
                        styles.dropdownItemText,
                        selectedCategory === category.id &&
                          styles.dropdownItemTextActive,
                      ]}
                    >
                      {category.categoryName}
                    </ThemedText>
                  </View>
                  <View style={styles.dropdownBadge}>
                    <ThemedText style={styles.dropdownBadgeText}>
                      {category.productCount || 0}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            </View>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    zIndex: 1002,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
    zIndex: 1004,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#50C878',
  },
  list: {
    padding: 20,
    gap: 20,
  },
  row: {
    justifyContent: 'space-between',
    gap: 20,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: '48%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  productImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f8f8f8',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 16,
    gap: 8,
  },
  productName: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    minHeight: 40,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  shopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  productShopName: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    width: '100%',
  },
  emptyIconContainer: {
    marginBottom: 24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
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
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 1003,
    alignItems: 'flex-end',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 16,
    minWidth: 280,
    maxWidth: 320,
    maxHeight: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 8px 24px 0px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  clearButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  dropdownContent: {
    paddingVertical: 8,
    maxHeight: 320,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 12,
  },
  dropdownItemActive: {
    backgroundColor: '#F0F9F4',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxActive: {
    backgroundColor: '#50C878',
    borderColor: '#50C878',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#50C878',
    fontWeight: '600',
  },
  dropdownBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    minWidth: 36,
    alignItems: 'center',
  },
  dropdownBadgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});

