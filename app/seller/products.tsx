import React, { useRef, useState } from 'react';
import { StyleSheet, FlatList, View, Platform, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

// Mock product data - replace with actual API call
const PRODUCTS = [
  {
    id: '1',
    name: 'Fresh Kale Bundle',
    price: '₱220',
    stock: 45,
    status: 'active',
    image: 'https://via.placeholder.com/150',
    category: 'Vegetables',
    sales: 120,
  },
  {
    id: '2',
    name: 'Dried Pineapple Pack',
    price: '₱95',
    stock: 5,
    status: 'active',
    image: 'https://via.placeholder.com/150',
    category: 'Fruits',
    sales: 89,
  },
  {
    id: '3',
    name: 'Organic Tomatoes',
    price: '₱150',
    stock: 0,
    status: 'out_of_stock',
    image: 'https://via.placeholder.com/150',
    category: 'Vegetables',
    sales: 67,
  },
  {
    id: '4',
    name: 'Fresh Carrots',
    price: '₱180',
    stock: 23,
    status: 'active',
    image: 'https://via.placeholder.com/150',
    category: 'Vegetables',
    sales: 45,
  },
];

export default function SellerProductsScreen() {
  const { isVisible, setIsVisible } = useTabBar();
  const scrollY = useRef(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [filter, setFilter] = useState<'all' | 'active' | 'out_of_stock' | 'low_stock'>('all');

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDifference = currentScrollY - lastScrollY;

    // Always show at the top
    if (currentScrollY <= 10) {
      if (!isVisible) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
      scrollY.current = currentScrollY;
      return;
    }

    // Show tab bar when scrolling up, hide when scrolling down
    if (Math.abs(scrollDifference) > 5) {
      if (scrollDifference > 0 && isVisible) {
        setIsVisible(false);
      } else if (scrollDifference < 0 && !isVisible) {
        setIsVisible(true);
      }
    }

    setLastScrollY(currentScrollY);
    scrollY.current = currentScrollY;
  };

  const filteredProducts = PRODUCTS.filter((product) => {
    if (filter === 'all') return true;
    if (filter === 'active') return product.status === 'active' && product.stock > 0;
    if (filter === 'out_of_stock') return product.status === 'out_of_stock' || product.stock === 0;
    if (filter === 'low_stock') return product.stock > 0 && product.stock < 10;
    return true;
  });

  const renderProduct = ({ item }: { item: typeof PRODUCTS[0] }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.7}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={[styles.statusBadge, styles[`statusBadge${item.status}`]]}>
          <ThemedText style={styles.statusText}>
            {item.status === 'out_of_stock' || item.stock === 0 ? 'Out of Stock' : 'Active'}
          </ThemedText>
        </View>
      </View>
      <View style={styles.productInfo}>
        <ThemedText type="defaultSemiBold" style={styles.productName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.productCategory}>{item.category}</ThemedText>
        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Price:</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.productPrice}>
              {item.price}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Stock:</ThemedText>
            <ThemedText
              style={[
                styles.stockText,
                item.stock === 0 && styles.stockTextEmpty,
                item.stock > 0 && item.stock < 10 && styles.stockTextLow,
              ]}
            >
              {item.stock} units
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Sales:</ThemedText>
            <ThemedText style={styles.salesText}>{item.sales} sold</ThemedText>
          </View>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={18} color="#2E7D32" />
            <ThemedText style={styles.editButtonText}>Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={18} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText type="title" style={styles.headerTitle}>
              My Products
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'low_stock', label: 'Low Stock' },
            { key: 'out_of_stock', label: 'Out of Stock' },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[styles.filterTab, filter === filterOption.key && styles.filterTabActive]}
              onPress={() => setFilter(filterOption.key as any)}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.filterTabText,
                  filter === filterOption.key && styles.filterTabTextActive,
                ]}
              >
                {filterOption.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>No products found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Start by adding your first product
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
    backgroundColor: '#F5F7FA',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  addButton: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#2E7D32',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#F0F0F0',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeactive: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeout_of_stock: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  productInfo: {
    padding: 16,
    gap: 12,
  },
  productName: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  productCategory: {
    fontSize: 13,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productDetails: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  productPrice: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '700',
  },
  stockText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  stockTextLow: {
    color: '#F5821F',
  },
  stockTextEmpty: {
    color: '#D32F2F',
  },
  salesText: {
    fontSize: 14,
    color: '#666',
  },
  productActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  editButtonText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

