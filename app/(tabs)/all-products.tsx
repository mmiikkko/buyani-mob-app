import React, { useRef, useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

// Mock data - Replace with API calls later
const ALL_PRODUCTS = [
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
  {
    id: '5',
    name: 'Fresh Kale Bundle',
    price: 'P220.00',
    shopName: 'Farm Fresh',
    image: null,
  },
  {
    id: '6',
    name: 'Dried Pineapple Pack',
    price: 'P95.00',
    shopName: 'Tropical Treats',
    image: null,
  },
  {
    id: '7',
    name: 'Crochet Keychain',
    price: 'P45.00',
    shopName: 'Handmade Crafts',
    image: null,
  },
  {
    id: '8',
    name: 'Organic Bananas',
    price: 'P150.00',
    shopName: 'Green Market',
    image: null,
  },
];

function ProductCard({ item }: { item: (typeof ALL_PRODUCTS)[number] }) {
  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.85}
      onPress={() => {
        // TODO: Navigate to product detail page
        console.log(`Product ${item.name} pressed`);
      }}
    >
      <View style={styles.productImageContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.productImage} contentFit="cover" />
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
          {item.name}
        </ThemedText>
        <View style={styles.priceContainer}>
          <ThemedText style={styles.productPrice}>{item.price}</ThemedText>
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
        style={[styles.headerGradient, { paddingTop: insets.top + 28 }]}
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
                {ALL_PRODUCTS.length} amazing products
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={ALL_PRODUCTS}
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
    paddingBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#50C878',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(80, 200, 120, 0.3)',
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
});

