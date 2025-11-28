import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const CATEGORIES = [
  { id: 'snacks', label: 'Local Snacks', image: require('@/assets/images/react-logo.png') },
  { id: 'handmade', label: 'Handmade', image: require('@/assets/images/partial-react-logo.png') },
  { id: 'veggies', label: 'Vegetables', image: require('@/assets/images/react-logo.png') },
  { id: 'essentials', label: 'Essentials', image: require('@/assets/images/icon.png') },
];

const BEST_SELLERS = [
  {
    id: 'pineapple',
    title: 'Dried Pineapple',
    price: '₱95',
    rating: '4.8 | 832 sold',
    image: require('@/assets/images/react-logo.png'),
  },
  {
    id: 'keychain',
    title: 'Crochet Keychain',
    price: '₱50',
    rating: '4.9 | 356 sold',
    image: require('@/assets/images/partial-react-logo.png'),
  },
];

function CategoryCard({ item }: { item: (typeof CATEGORIES)[number] }) {
  return (
    <View style={styles.categoryCard}>
      <Image source={item.image} style={styles.categoryImage} />
      <ThemedText type="defaultSemiBold" style={styles.categoryLabel}>
        {item.label.toUpperCase()}
      </ThemedText>
    </View>
  );
}

function ProductCard({ item }: { item: (typeof BEST_SELLERS)[number] }) {
  return (
    <View style={styles.productCard}>
      <Image source={item.image} style={styles.productImage} />
      <ThemedText type="defaultSemiBold" style={styles.productTitle}>
        {item.title}
      </ThemedText>
      <ThemedText style={styles.price}>{item.price}</ThemedText>
      <ThemedText style={styles.rating}>{item.rating}</ThemedText>
      <TouchableOpacity style={styles.cartButton}>
        <ThemedText type="defaultSemiBold" style={styles.cartButtonText}>
          Add to Cart
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ThemedView style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#7d7d7d" />
            <TextInput placeholder="Search for products" placeholderTextColor="#7d7d7d" />
          </View>
          <View style={styles.cartIcon}>
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>3</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Shop by Category</ThemedText>
          <ThemedText style={styles.linkText}>View All</ThemedText>
        </View>
        <FlatList
          data={CATEGORIES}
          renderItem={({ item }) => <CategoryCard item={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="trending-up" size={16} color="#2d8a34" />
            <ThemedText type="subtitle">Best Sellers</ThemedText>
          </View>
          <ThemedText style={styles.linkText}>See All</ThemedText>
        </View>
        <FlatList
          data={BEST_SELLERS}
          renderItem={({ item }) => <ProductCard item={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f4f8f4',
  },
  container: {
    padding: 20,
    gap: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cartIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5821f',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    color: '#f5821f',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    color: '#2d8a34',
  },
  categoryList: {
    paddingVertical: 4,
    gap: 12,
  },
  categoryCard: {
    width: 90,
    height: 110,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  categoryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productList: {
    paddingVertical: 4,
    gap: 16,
  },
  productCard: {
    width: 180,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 12,
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
  },
  productTitle: {
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#f5821f',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  cartButton: {
    borderRadius: 16,
    paddingVertical: 10,
    backgroundColor: '#2d8a34',
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
  },
});
