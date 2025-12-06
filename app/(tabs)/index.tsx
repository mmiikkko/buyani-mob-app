import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data - Replace with API calls later
const CATEGORIES = [
  { id: 'fruits', label: 'Fruits', itemCount: 1, color: '#50C878' },
  { id: 'novelty', label: 'Novelty', itemCount: 3, color: '#f5821f' },
  { id: 'snacks', label: 'Snacks', itemCount: 5, color: '#50C878' },
  { id: 'handmade', label: 'Handmade', itemCount: 2, color: '#f5821f' },
];

const BEST_SELLERS = [
  {
    id: '1',
    name: 'test67',
    price: 'P123.00',
    shopName: 'My Shop Name',
    image: require('@/assets/images/react-logo.png'),
  },
  {
    id: '2',
    name: 'test product',
    price: 'P1.00',
    shopName: 'Martin Shop',
    image: null,
  },
  {
    id: '3',
    name: 'test 8',
    price: 'P89.00',
    shopName: 'My Shop Name',
    image: null,
  },
  {
    id: '4',
    name: 'test 5',
    price: 'P123.00',
    shopName: 'My Shop Name',
    image: null,
  },
];

const FEATURED_VENDORS = [
  {
    id: '1',
    shopName: 'Martin Shop',
    rating: 4.9,
    productCount: 1,
    sellerName: 'Martin Salamat',
  },
  {
    id: '2',
    shopName: 'My Shop Name',
    rating: null,
    productCount: 3,
    sellerName: 'Azied',
  },
  {
    id: '3',
    shopName: 'kmart shop',
    rating: null,
    productCount: 0,
    sellerName: 'kmart',
  },
];

function CategoryCard({ item }: { item: (typeof CATEGORIES)[number] }) {
  return (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.7}
      onPress={() => {
        // TODO: Navigate to category page
        console.log(`Category ${item.label} pressed`);
      }}
    >
      <View style={styles.categoryIconContainer}>
        <View style={[styles.categoryIcon, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name="cube-outline" size={28} color={item.color} />
        </View>
      </View>
      <ThemedText type="defaultSemiBold" style={styles.categoryLabel}>
        {item.label}
      </ThemedText>
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
        <ThemedText style={styles.categoryItemCount}>
          {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function ProductCard({ item }: { item: (typeof BEST_SELLERS)[number] }) {
  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => {
        // TODO: Navigate to product detail page
        console.log(`Product ${item.name} pressed`);
      }}
    >
      <View style={styles.productImageContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.productImage} contentFit="cover" />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#ccc" />
            <ThemedText style={styles.noImageText}>No image</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <ThemedText type="defaultSemiBold" style={styles.productName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.productPrice}>{item.price}</ThemedText>
        <ThemedText style={styles.productShopName} numberOfLines={1}>
          {item.shopName}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function VendorCard({ item }: { item: (typeof FEATURED_VENDORS)[number] }) {
  return (
    <TouchableOpacity
      style={styles.vendorCard}
      activeOpacity={0.8}
      onPress={() => {
        // TODO: Navigate to vendor/shop page
        console.log(`Vendor ${item.shopName} pressed`);
      }}
    >
      <LinearGradient
        colors={['#FFE082', '#C5E1A5', '#E8F5E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.vendorCardHeader}
      >
        <View style={styles.vendorIcon}>
          <Ionicons name="storefront-outline" size={36} color="#1976D2" />
        </View>
      </LinearGradient>
      <View style={styles.vendorCardBody}>
        <ThemedText type="defaultSemiBold" style={styles.vendorShopName} numberOfLines={1}>
          {item.shopName}
        </ThemedText>
        {item.rating && (
          <View style={styles.vendorRating}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <ThemedText style={styles.vendorRatingText}>{item.rating}</ThemedText>
          </View>
        )}
        <ThemedText style={styles.vendorProductCount}>
          {item.productCount} {item.productCount === 1 ? 'product' : 'products'}
        </ThemedText>
        <ThemedText style={styles.vendorSellerName} numberOfLines={1}>
          by {item.sellerName}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isVisible, setIsVisible } = useTabBar();
  const scrollY = useRef(0);
  const [lastScrollY, setLastScrollY] = useState(0);

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
          <FlatList
            data={BEST_SELLERS}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            scrollEnabled={true}
          />
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
          <FlatList
            data={CATEGORIES}
            renderItem={({ item }) => <CategoryCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            scrollEnabled={true}
          />
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
          <FlatList
            data={FEATURED_VENDORS}
            renderItem={({ item }) => <VendorCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vendorList}
            scrollEnabled={true}
          />
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
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#7d7d7d',
  },
  banner: {
    backgroundColor: '#50C878',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  bannerText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  carouselContainer: {
    height: 220,
    width: '100%',
    marginVertical: 24,
    borderRadius: 0,
    overflow: 'hidden',
  },
  carouselBackground: {
    width: '100%',
    height: '100%',
  },
  discoverSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  discoverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 40,
  },
  discoverTitleText: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
  },
  titleHighlightGreen: {
    color: '#50C878',
    fontSize: 32,
    fontWeight: 'bold',
  },
  titleHighlightOrange: {
    color: '#f5821f',
    fontSize: 32,
    fontWeight: 'bold',
  },
  discoverDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  discoverButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  shopButton: {
    backgroundColor: '#50C878',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  exploreButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#50C878',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: '#50C878',
    fontSize: 14,
    fontWeight: '600',
  },
  discoverFooter: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  sectionHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#50C878',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 32,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  viewAllLink: {
    color: '#50C878',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  categoryList: {
    gap: 16,
    paddingRight: 20,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: 140,
    alignItems: 'center',
    borderWidth: 1.5,
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
      web: {
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
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
    backgroundColor: '#fff',
    borderRadius: 16,
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
      web: {
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
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
    color: '#000',
  },
  productPrice: {
    fontSize: 18,
    color: '#50C878',
    fontWeight: '700',
    marginBottom: 4,
  },
  productShopName: {
    fontSize: 12,
    color: '#000',
  },
  vendorList: {
    gap: 16,
    paddingRight: 20,
  },
  vendorCard: {
    width: 200,
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
      web: {
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
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
});
