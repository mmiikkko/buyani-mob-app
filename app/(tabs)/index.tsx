import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api, type Product, type Category, type Shop } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category colors for display
const CATEGORY_COLORS = ['#50C878', '#f5821f', '#50C878', '#f5821f', '#50C878', '#f5821f'];

function CategoryCard({ item, color }: { item: Category; color: string }) {
  return (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.7}
      onPress={() => {
        // TODO: Navigate to category page
        console.log(`Category ${item.categoryName} pressed`);
      }}
    >
      <View style={styles.categoryIconContainer}>
        <View style={[styles.categoryIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name="cube-outline" size={28} color={color} />
        </View>
      </View>
      <ThemedText type="defaultSemiBold" style={styles.categoryLabel}>
        {item.categoryName}
      </ThemedText>
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryDot, { backgroundColor: color }]} />
        <ThemedText style={styles.categoryItemCount}>
          {item.productCount || 0} {(item.productCount || 0) === 1 ? 'item' : 'items'}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function ProductCard({ item }: { item: Product }) {
  const router = useRouter();
  const imageUrl = item.images && item.images.length > 0 && item.images[0].image_url 
    ? item.images[0].image_url[0] 
    : null;

  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => {
        router.push(`/(tabs)/product/${item.id}`);
      }}
    >
      <View style={styles.productImageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="cover" />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#ccc" />
            <ThemedText style={styles.noImageText}>No image</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <ThemedText type="defaultSemiBold" style={styles.productName} numberOfLines={2}>
          {item.productName}
        </ThemedText>
        <ThemedText style={styles.productPrice}>P{Number(item.price).toFixed(2)}</ThemedText>
        <ThemedText style={styles.productShopName} numberOfLines={1}>
          {item.shopName}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function VendorCard({ item }: { item: Shop }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.vendorCard}
      activeOpacity={0.8}
      onPress={() => {
        router.push(`/(tabs)/shop/${item.id}`);
      }}
    >
      <LinearGradient
        colors={['#FFE082', '#C5E1A5', '#E8F5E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.vendorCardHeader}
      >
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.vendorImage} contentFit="cover" />
        )}
        <View style={styles.vendorIcon}>
          <Ionicons name="storefront-outline" size={36} color="#1976D2" />
        </View>
      </LinearGradient>
      <View style={styles.vendorCardBody}>
        <ThemedText type="defaultSemiBold" style={styles.vendorShopName} numberOfLines={1}>
          {item.shop_name}
        </ThemedText>
        {item.shop_rating && (
          <View style={styles.vendorRating}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <ThemedText style={styles.vendorRatingText}>{item.shop_rating}</ThemedText>
          </View>
        )}
        <ThemedText style={styles.vendorProductCount}>
          {item.products} {item.products === 1 ? 'product' : 'products'}
        </ThemedText>
        <ThemedText style={styles.vendorSellerName} numberOfLines={1}>
          by {item.owner_name}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isVisible, setIsVisible } = useTabBar();
  const scrollY = useRef(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  
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
          api.getCategories(true).catch(() => []),
          api.getProducts().catch(() => []),
          api.getShops('approved').catch(() => []),
        ]);

        setCategories(categoriesData);
        setProducts(productsData);
        setShops(shopsData);
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
                style={styles.cartButton}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/cart')}
              >
                <Ionicons name="cart" size={16} color="#fff" />
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

        {/* Green Banner */}
        <View style={styles.banner}>
          <ThemedText style={styles.bannerText}>
            ✨ Shop campus favorites and locally crafted products – all in one place! ✨
          </ThemedText>
        </View>

        {/* Background Section */}
        <View style={styles.carouselContainer}>
          <Image
            source={require('@/assets/images/background.jpg')}
            style={styles.carouselBackground}
            contentFit="cover"
          />
        </View>

        {/* Discover Fresh Picks Section - Full Width on Mobile */}
        <View style={styles.discoverSection}>
          <ThemedText type="title" style={styles.discoverTitle}>
            <ThemedText style={styles.discoverTitleText}>Discover fresh picks from</ThemedText>{' '}
            <ThemedText style={styles.titleHighlightGreen}>Campus Sellers</ThemedText>{' '}
            <ThemedText style={styles.discoverTitleText}>&</ThemedText>{' '}
            <ThemedText style={styles.titleHighlightOrange}>Local Makers</ThemedText>
          </ThemedText>
          <ThemedText style={styles.discoverDescription}>
            Explore curated goods crafted by CNSC students and trusted local producers. Simple,
            clean shopping designed for everyday cravings and useful essentials.
          </ThemedText>
          <View style={styles.discoverButtons}>
            <TouchableOpacity
              style={styles.shopButton}
              activeOpacity={0.8}
              onPress={() => {
                // Scroll to best sellers section or navigate to products
                console.log('Shop popular picks pressed');
              }}
            >
              <ThemedText style={styles.shopButtonText}>Shop popular picks</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exploreButton}
              activeOpacity={0.8}
              onPress={() => {
                // Scroll to categories section
                console.log('Explore categories pressed');
              }}
            >
              <ThemedText style={styles.exploreButtonText}>Explore categories</ThemedText>
            </TouchableOpacity>
          </View>
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
              onPress={() => router.push('/(tabs)/all-best-sellers')}
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
              data={products.slice(0, 10)}
              renderItem={({ item }) => <ProductCard item={item} />}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              scrollEnabled={true}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>No products available</ThemedText>
                </View>
              }
            />
          )}
        </View>

        {/* Shop by Category Section */}
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
          ) : (
            <FlatList
              data={categories}
              renderItem={({ item, index }) => (
                <CategoryCard item={item} color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              scrollEnabled={true}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>No categories available</ThemedText>
                </View>
              }
            />
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
              renderItem={({ item }) => <VendorCard item={item} />}
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
    backgroundColor: '#50C878',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 0,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  carouselContainer: {
    height: 200,
    width: '100%',
    marginVertical: 20,
    borderRadius: 0,
    overflow: 'hidden',
  },
  carouselBackground: {
    width: '100%',
    height: '100%',
  },
  discoverSection: {
    paddingHorizontal: 20,
    marginBottom: 36,
  },
  discoverTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
    lineHeight: 36,
  },
  discoverTitleText: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  titleHighlightGreen: {
    color: '#50C878',
    fontSize: 28,
    fontWeight: '700',
  },
  titleHighlightOrange: {
    color: '#F5821F',
    fontSize: 28,
    fontWeight: '700',
  },
  discoverDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  discoverButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  shopButton: {
    backgroundColor: '#50C878',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#50C878',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  exploreButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#50C878',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: '#50C878',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  discoverFooter: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
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
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 30,
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  viewAllLink: {
    color: '#50C878',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  categoryList: {
    gap: 16,
    paddingRight: 20,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    width: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  categoryIconContainer: {
    marginBottom: 12,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 16,
    marginBottom: 8,
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
  productList: {
    gap: 16,
    paddingRight: 20,
  },
  productCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  productImageContainer: {
    width: '100%',
    height: 180,
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
    marginBottom: 4,
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
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  vendorCardHeader: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
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
});
