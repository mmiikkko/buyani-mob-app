import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Linking,
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
import { useCart } from '@/contexts/cart-context';
import { api, type Product, type Category, type Shop } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category colors for display
const CATEGORY_COLORS = ['#50C878', '#f5821f', '#50C878', '#f5821f', '#50C878', '#f5821f'];

// Approx width of one category item (card + spacing) for pager movement
const CATEGORY_ITEM_WIDTH = 90 + 16;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList as any);

function CategoryCard({ item, color, index }: { item: Category; color: string; index: number }) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.categoryCard}
        activeOpacity={0.8}
        onPress={() => {
          // Go to All Products, filtered by this category
          router.push({
            pathname: '/(tabs)/all-products',
            params: {
              categoryId: item.id,
              categoryName: item.categoryName,
            },
          });
        }}
      >
        <View style={styles.categoryIconContainer}>
          <LinearGradient
            colors={[`${color}15`, `${color}08`]}
            style={styles.categoryIcon}
          >
            <Ionicons name="cube-outline" size={32} color={color} />
          </LinearGradient>
        </View>
        <ThemedText type="defaultSemiBold" style={styles.categoryLabel}>
          {item.categoryName}
        </ThemedText>
        {item.productCount !== undefined && (
          item.productCount > 0 ? (
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryDot, { backgroundColor: color }]} />
              <ThemedText style={styles.categoryItemCount}>
                {item.productCount} {item.productCount === 1 ? 'item' : 'items'}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryDot, { backgroundColor: '#E5E7EB' }]} />
              <ThemedText style={styles.categoryItemCountEmpty}>
                No items yet
              </ThemedText>
            </View>
          )
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function ProductCard({ item, index }: { item: Product; index: number }) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(50)).current;
  
  // Handle different image URL formats
  let imageUrl: string | null = null;
  if (item.images && item.images.length > 0) {
    const firstImage = item.images[0];
    if (firstImage.image_url) {
      if (Array.isArray(firstImage.image_url)) {
        imageUrl = firstImage.image_url[0] || null;
      } else {
        imageUrl = firstImage.image_url;
      }
    }
  }

  useEffect(() => {
    // Start animation immediately, no delay for first item
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: Math.min(index * 50, 200), // Cap delay at 200ms
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        delay: Math.min(index * 50, 200),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, translateX]);

  return (
    <Animated.View
      style={[
        styles.productCardWrapper,
        { opacity: fadeAnim, transform: [{ translateX }] },
      ]}
    >
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.85}
        onPress={() => {
          router.push(`/(tabs)/product/${item.id}`);
        }}
      >
        <View style={styles.productImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.productImage} 
              contentFit="cover"
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={['#F3F4F6', '#E5E7EB']}
              style={styles.noImagePlaceholder}
            >
              <Ionicons name="image-outline" size={32} color="#9CA3AF" />
            </LinearGradient>
          )}
          {item.stock !== undefined && item.stock > 0 && (
            <View style={styles.stockBadge}>
              <ThemedText style={styles.stockBadgeText}>In Stock</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <ThemedText type="defaultSemiBold" style={styles.productName} numberOfLines={2}>
            {item.productName || 'Product'}
          </ThemedText>
          <View style={styles.productPriceRow}>
            <ThemedText style={styles.productPrice}>₱{Number(item.price || 0).toFixed(2)}</ThemedText>
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFC107" />
                <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
              </View>
            )}
          </View>
          {item.shopName && (
            <ThemedText style={styles.productShopName} numberOfLines={1}>
              {item.shopName}
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function VendorCard({ item, index }: { item: Shop; index: number }) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(50)).current;
  const hasLogo = !!item.image;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ translateX }] },
      ]}
    >
      <TouchableOpacity
        style={styles.vendorCard}
        activeOpacity={0.85}
        onPress={() => {
          router.push(`/(tabs)/shop/${item.id}`);
        }}
      >
        {hasLogo ? (
          // If shop has logo, show it without icon overlay
          <View style={styles.vendorCardHeader}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.vendorImage} 
              contentFit="cover"
              transition={200}
            />
          </View>
        ) : (
          // If no logo, show gradient with icon
          <LinearGradient
            colors={['#50C878', '#45B869', '#3DA85A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.vendorCardHeader}
          >
            <View style={styles.vendorIcon}>
              <Ionicons name="storefront" size={40} color="#FFFFFF" />
            </View>
          </LinearGradient>
        )}
        <View style={styles.vendorCardBody}>
          <ThemedText type="defaultSemiBold" style={styles.vendorShopName} numberOfLines={1}>
            {item.shop_name}
          </ThemedText>
          {item.shop_rating && (
            <View style={styles.vendorRating}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <ThemedText style={styles.vendorRatingText}>{item.shop_rating}</ThemedText>
            </View>
          )}
          <ThemedText style={styles.vendorProductCount}>
            {item.products} {item.products === 1 ? 'product' : 'products'}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isVisible, setIsVisible } = useTabBar();
  const { cartCount } = useCart();
  const scrollY = useRef(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const categoryScrollX = useRef(new Animated.Value(0)).current;
  
  // State for API data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [categoriesData, productsData, shopsData] = await Promise.all([
          api.getCategories(true).catch((e) => {
            // Avoid red error screen – log softly in dev and continue
            if (__DEV__) {
              console.log('Error fetching categories:', e?.message || e);
            }
            return [];
          }),
          api.getProducts().catch((e) => {
            if (__DEV__) {
              console.log('Error fetching products:', e?.message || e);
            }
            // Surface a friendly error once
            setError((prev) => prev ?? (e?.message || 'Unable to load products right now.'));
            return [];
          }),
          api.getShops('approved').catch((e) => {
            if (__DEV__) {
              console.log('Error fetching shops:', e?.message || e);
            }
            return [];
          }),
        ]);

        console.log('Fetched data:', {
          categories: categoriesData.length,
          products: productsData.length,
          shops: shopsData.length,
        });

        setCategories(categoriesData || []);
        setProducts(productsData || []);
        setShops(shopsData || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        // Set empty arrays on error to prevent crashes
        setCategories([]);
        setProducts([]);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Pager movement for category strip
  const visibleCount = 4;
  const maxScroll =
    categories.length > visibleCount
      ? (categories.length - visibleCount) * CATEGORY_ITEM_WIDTH
      : 1;

  const pagerTranslateX = categoryScrollX.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, 20], // track width (40) - thumb width (20)
    extrapolate: 'clamp',
  });

  return (
    <ThemedView style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header with Logo, Search, Cart, Profile */}
        <View style={[styles.header, { paddingTop: insets.top + 28 }]}>
        <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/Buyani.jpeg')}
                style={styles.logo}
                contentFit="contain"
              />
              <ThemedText type="defaultSemiBold" style={styles.logoText}>
                Buyani
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.locationButton}
                activeOpacity={0.7}
                onPress={async () => {
                  const url = 'https://cnsc.edu.ph/UCN/cnsc-esd-launches-techno-demo-facility-university-market-hub-and-coffee-table-book/';
                  try {
                    const supported = await Linking.canOpenURL(url);
                    if (supported) {
                      await Linking.openURL(url);
                    } else {
                      console.error("Don't know how to open URI: " + url);
                    }
                  } catch (error) {
                    console.error('Error opening URL:', error);
                  }
                }}
              >
                <Ionicons name="location" size={12} color="#50C878" />
                <ThemedText style={styles.locationText}>CNSC</ThemedText>
              </TouchableOpacity>
            <TouchableOpacity
              style={styles.messagesButton}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/messages')}
            >
              <Ionicons name="chatbubbles-outline" size={18} color="#10B981" />
            </TouchableOpacity>
              <TouchableOpacity
                style={styles.cartButton}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/cart')}
              >
                <Ionicons name="cart" size={16} color="#fff" />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <ThemedText style={styles.cartBadgeText}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Ionicons name="search" size={20} color="#7d7d7d" />
            <ThemedText style={styles.searchPlaceholder}>
              Search local treats and shops...
            </ThemedText>
          </TouchableOpacity>
        </View>

{/* Hero Top */}
<LinearGradient
    colors={['#10B981', '#14B8A6', '#F59E0B']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.hero}
  >
    <View style={styles.heroContent}>
      <View style={styles.heroIcon}>
        <Ionicons name="sparkles" size={20} color="#FFFFFF" />
      </View>

      <ThemedText style={styles.heroText}>
        Campus favorites & locally crafted products
      </ThemedText>
    </View>
  </LinearGradient>

  {/* Badges Bottom */}
  <View style={styles.badgeRow}>
    <View style={styles.badgeCard}>
      <LinearGradient
        colors={['#34D399', '#14B8A6']}
        style={styles.badgeIcon}
      >
        <Ionicons name="bag-handle" size={16} color="#FFFFFF" />
      </LinearGradient>
      <ThemedText style={styles.badgeText}>Campus best-sellers</ThemedText>
    </View>

    <View style={styles.badgeCard}>
      <LinearGradient
        colors={['#38BDF8', '#34D399']}
        style={styles.badgeIcon}
      >
        <Ionicons name="car" size={16} color="#FFFFFF" />
      </LinearGradient>
      <ThemedText style={styles.badgeText}>Fast pickup & delivery</ThemedText>
    </View>

    <View style={styles.badgeCard}>
      <LinearGradient
        colors={['#FBBF24', '#F43F5E']}
        style={styles.badgeIcon}
      >
        <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
      </LinearGradient>
      <ThemedText style={styles.badgeText}>Trusted local sellers</ThemedText>
    </View>
  </View>

        {/* Categories strip (horizontal, like Shopee quick features) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <ThemedText style={styles.sectionLabel}>SHOP BY CATEGORY</ThemedText>
              <ThemedText type="title" style={styles.sectionTitle}>
                Browse categories
              </ThemedText>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/all-categories')}
            >
              <ThemedText style={styles.viewAllLink}>View all →</ThemedText>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#50C878" />
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No categories available</ThemedText>
            </View>
          ) : (
            <View>
              <AnimatedFlatList
                data={categories}
                keyExtractor={(item: Category) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryStrip}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: categoryScrollX } } }],
                  { useNativeDriver: false }
                )}
                renderItem={({ item, index }: { item: Category; index: number }) => (
                  <View style={styles.categoryStripItem}>
                    <CategoryCard
                      item={item}
                      color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      index={index}
                    />
                  </View>
                )}
              />

              {/* Pager indicator */}
              {categories.length > 4 && (
                <View style={styles.categoryPager}>
                  <View style={styles.categoryPagerTrack}>
                    <Animated.View
                      style={[
                        styles.categoryPagerThumb,
                        { transform: [{ translateX: pagerTranslateX }] },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        

        {/* Best Sellers This Week Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <ThemedText style={styles.sectionLabel}>CROWD FAVORITES</ThemedText>
              <ThemedText type="title" style={styles.sectionTitle}>
                Best sellers this week
              </ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Simple, popular picks students keep coming back for.
              </ThemedText>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/all-products')}
            >
              <ThemedText style={styles.viewAllLink}>View all →</ThemedText>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#50C878" />
            </View>
          ) : products.length > 0 ? (
            <FlatList
              data={products.slice(0, 10)}
              renderItem={({ item, index }) => <ProductCard item={item} index={index} />}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              scrollEnabled={true}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
              <ThemedText style={styles.emptyText}>No products available</ThemedText>
            </View>
          )}
        </View>

        {/* Featured Vendors Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <ThemedText style={styles.sectionLabel}>TRUSTED CAMPUS SELLERS</ThemedText>
              <ThemedText type="title" style={styles.sectionTitle}>
                Featured vendors
              </ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Curated stalls from students and local makers with the best reviews.
              </ThemedText>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/all-vendors')}
            >
              <ThemedText style={styles.viewAllLink}>View all →</ThemedText>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#50C878" />
            </View>
          ) : (
            <FlatList
              data={shops.slice(0, 10)}
              renderItem={({ item, index }) => <VendorCard item={item} index={index} />}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vendorList}
              scrollEnabled={true}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>No vendors available</ThemedText>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 20,
    color: '#2d8a34',
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messagesButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#f0f7f1',
    borderRadius: 14,
  },
  locationText: {
    fontSize: 11,
    color: '#50C878',
    fontWeight: '600',
  },
  cartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5821f',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#7d7d7d',
  },
  banner: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginHorizontal: 0,
  },
  bannerContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  bannerBadgeText: {
    fontSize: 12,
    color: '#FEFCE8',
    fontWeight: '600',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'left',
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  titleHighlightGreen: {
    color: '#50C878',
    fontSize: 26,
    fontWeight: '700',
  },
  titleHighlightOrange: {
    color: '#F5821F',
    fontSize: 26,
    fontWeight: '700',
  },
  discoverDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 36,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#50C878',
    fontWeight: '700',
    letterSpacing: 1.2,
    padding: 12,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 28,
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 2,
  },
  viewAllLink: {
    color: '#50C878',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  // Horizontal category strip (home)
  categoryStrip: {
    paddingVertical: 8,
    paddingRight: 20,
  },
  categoryStripItem: {
    width: 90,
    alignItems: 'center',
    marginRight: 16,
  },
  categoryCard: {
    width: '100%',
    alignItems: 'center',
  },
  categoryIconContainer: {
    marginBottom: 8,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    color: '#000',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryItemCount: {
    fontSize: 12,
    color: '#666',
  },
  categoryItemCountEmpty: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  categoryPager: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPagerTrack: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  categoryPagerThumb: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F97316',
  },
  productList: {
    gap: 16,
    paddingRight: 20,
  },
  productCardWrapper: {
    width: 180,
    marginRight: 0,
  },
  productCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
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
  productImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f8f8f8',
    position: 'relative',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#50C878',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noImageText: {
    color: '#999',
    fontSize: 12,
  },
  productInfo: {
    padding: 14,
  },
  productName: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 20,
    color: '#111827',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 18,
    color: '#50C878',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  productShopName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  vendorList: {
    gap: 16,
    paddingRight: 20,
  },
  vendorCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
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
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  vendorImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  promoCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  
  hero: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  heroText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
  },
  
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  
  badgeCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  
  badgeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  
  badgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
  },  
});
