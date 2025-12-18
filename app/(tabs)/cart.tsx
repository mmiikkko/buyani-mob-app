import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { useCart } from '@/contexts/cart-context';
import { api, type CartItem, type Product } from '@/lib/api';

const SELECTED_CART_ITEMS_KEY = 'selected_cart_items';

interface CartItemWithShop extends CartItem {
  shopId?: string;
  shopName?: string;
}

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const { refreshCart: refreshCartContext } = useCart();
  const [items, setItems] = useState<CartItemWithShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const fetchCart = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Check if user is logged in
      const token = await api.getToken();
      if (!token || token === 'demo-token-offline-mode') {
        setError('Please log in to view your cart');
        setItems([]);
        setLoading(false);
        return;
      }
      
      // Get cart items
      const cartData = await api.getCart();
      
      // Fetch product details to get shop information
      const itemsWithShop: CartItemWithShop[] = await Promise.all(
        cartData.map(async (item) => {
          if (!item.productId) {
            return { ...item, shopId: undefined, shopName: undefined };
          }
          
          try {
            const product: Product = await api.getProduct(item.productId);
            return {
              ...item,
              shopId: product.shopId,
              shopName: product.shopName,
            };
          } catch (err) {
            console.error(`Failed to fetch product ${item.productId}:`, err);
            return { ...item, shopId: undefined, shopName: undefined };
          }
        })
      );
      
      setItems(itemsWithShop);
      // Select all items by default
      setSelectedItems(new Set(itemsWithShop.map(item => item.id)));
      // Also refresh cart context to sync badge count
      refreshCartContext();
    } catch (err: any) {
      console.error('Failed to load cart:', err);
      const errorMsg = err.message || 'Failed to load cart';
      
      // Check if it's an auth error
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
        setError('Please log in to view your cart');
      } else {
        setError(errorMsg);
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [refreshCartContext]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCart();
    } finally {
      setRefreshing(false);
    }
  }, [fetchCart]);

  // Hide tab bar immediately when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Hide tab bar when cart screen is focused
      setIsVisible(false);
      fetchCart();
      
      // Show tab bar again when screen loses focus
      return () => {
        setIsVisible(true);
      };
    }, [setIsVisible, fetchCart])
  );

  const handleIncrement = async (item: CartItem) => {
    try {
      await api.updateCartItem(item.id, item.quantity + 1);
      await fetchCart();
    } catch (err: any) {
      console.error('Failed to update cart:', err);
      Alert.alert('Cart', err.message || 'Failed to update item');
    }
  };

  const handleDecrement = async (item: CartItem) => {
    if (item.quantity <= 1) {
      await handleRemove(item);
      return;
    }
    try {
      await api.updateCartItem(item.id, item.quantity - 1);
      await fetchCart();
    } catch (err: any) {
      console.error('Failed to update cart:', err);
      Alert.alert('Cart', err.message || 'Failed to update item');
    }
  };

  const handleRemove = async (item: CartItem) => {
    try {
      await api.removeCartItem(item.id);
      // Remove from selected items
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
      await fetchCart();
    } catch (err: any) {
      console.error('Failed to remove item:', err);
      Alert.alert('Cart', err.message || 'Failed to remove item');
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const isAllSelected = items.length > 0 && selectedItems.size === items.length;
  const selectedCount = selectedItems.size;

  const selectedTotal = useMemo(() => {
    return items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  }, [items, selectedItems]);

  const handleCheckout = async () => {
    if (selectedItems.size === 0) {
      Alert.alert('Checkout', 'Please select at least one item to checkout.');
      return;
    }

    // Save selected item IDs to AsyncStorage for checkout page to read
    try {
      await AsyncStorage.setItem(SELECTED_CART_ITEMS_KEY, JSON.stringify(Array.from(selectedItems)));
      router.push('/(tabs)/checkout');
    } catch (err) {
      console.error('Failed to save selected items:', err);
      Alert.alert('Error', 'Failed to proceed to checkout. Please try again.');
    }
  };

  // Group items by shop
  const itemsByShop = useMemo(() => {
    const grouped = new Map<string, CartItemWithShop[]>();
    
    items.forEach(item => {
      const shopId = item.shopId || 'unknown';
      if (!grouped.has(shopId)) {
        grouped.set(shopId, []);
      }
      grouped.get(shopId)!.push(item);
    });
    
    return grouped;
  }, [items]);

  const shopSections = useMemo(() => {
    return Array.from(itemsByShop.entries()).map(([shopId, shopItems]) => ({
      shopId,
      shopName: shopItems[0]?.shopName || 'Unknown Shop',
      items: shopItems,
    }));
  }, [itemsByShop]);

  const renderItem = ({ item }: { item: CartItemWithShop }) => {
    const isSelected = selectedItems.has(item.id);
    
    return (
      <View style={styles.cartItem}>
        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleItemSelection(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkboxInner, isSelected && styles.checkboxChecked]}>
            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.itemImageContainer}
          onPress={() => item.productId && router.push(`/(tabs)/product/${item.productId}`)}
          activeOpacity={0.8}
        >
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
          ) : (
            <View style={styles.itemPlaceholder}>
              <Ionicons name="image-outline" size={28} color="#ccc" />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.itemInfo}>
          <ThemedText type="defaultSemiBold" style={styles.itemName} numberOfLines={2}>
            {item.productName || 'Product'}
          </ThemedText>
          <ThemedText style={styles.itemPrice}>P{Number(item.price || 0).toFixed(2)}</ThemedText>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => handleDecrement(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={18} color="#111" />
            </TouchableOpacity>
            <ThemedText style={styles.qtyValue}>{item.quantity}</ThemedText>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => handleIncrement(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#111" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item)} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={styles.wrapper}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Shopping Cart
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <ThemedText style={styles.loadingText}>Loading your cart...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.emptyCartContainer}>
            <View style={styles.cartIconContainer}>
              <Ionicons name="alert-circle-outline" size={80} color="#d0d0d0" />
            </View>
            <ThemedText type="title" style={styles.emptyCartTitle}>
              Unable to load cart
            </ThemedText>
            <ThemedText style={styles.emptyCartSubtitle}>{error}</ThemedText>
            {error.includes('log in') || error.includes('Unauthorized') ? (
              <TouchableOpacity
                style={styles.continueShoppingButton}
                onPress={() => router.push('/login')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.continueShoppingText}>Log In</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.continueShoppingButton} onPress={onRefresh} activeOpacity={0.8}>
                <ThemedText style={styles.continueShoppingText}>Retry</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <View style={styles.cartIconContainer}>
              <Ionicons name="cart-outline" size={80} color="#d0d0d0" />
            </View>
            <ThemedText type="title" style={styles.emptyCartTitle}>
              Your cart is empty
            </ThemedText>
            <ThemedText style={styles.emptyCartSubtitle}>
              Add some items on the website or app to see them here.
            </ThemedText>
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.continueShoppingText}>Continue Shopping</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Select All Row */}
            <View style={styles.selectAllRow}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={toggleSelectAll}
                activeOpacity={0.7}
              >
                <View style={[styles.checkboxInner, isAllSelected && styles.checkboxChecked]}>
                  {isAllSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <ThemedText style={styles.selectAllText}>
                  {isAllSelected ? 'Deselect All' : 'Select All'}
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.selectedCountText}>
                {selectedCount} of {items.length} selected
              </ThemedText>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: insets.bottom + 280 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              {shopSections.map((section) => (
                <View key={section.shopId} style={styles.shopSection}>
                  {/* Shop Header */}
                  <TouchableOpacity
                    style={styles.shopHeader}
                    onPress={() => section.shopId !== 'unknown' && router.push(`/(tabs)/shop/${section.shopId}`)}
                    activeOpacity={section.shopId !== 'unknown' ? 0.7 : 1}
                  >
                    <Ionicons name="storefront-outline" size={18} color="#10B981" />
                    <ThemedText style={styles.shopHeaderText}>{section.shopName}</ThemedText>
                    {section.shopId !== 'unknown' && (
                      <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                  
                  {/* Shop Items */}
                  {section.items.map((item) => (
                    <View key={item.id}>
                      {renderItem({ item })}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
            <View style={[styles.summaryCard, { paddingBottom: insets.bottom + 20 }]}>
              {/* Price breakdown for selected items - grouped by shop - Scrollable */}
              {selectedCount > 0 && (
                <ScrollView 
                  style={styles.breakdownScrollView}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  <View style={styles.priceBreakdown}>
                    <ThemedText style={styles.breakdownTitle}>Order Summary</ThemedText>
                    {shopSections.map((section) => {
                      const selectedShopItems = section.items.filter(item => selectedItems.has(item.id));
                      if (selectedShopItems.length === 0) return null;
                      
                      const shopSubtotal = selectedShopItems.reduce(
                        (sum, item) => sum + (item.price || 0) * item.quantity,
                        0
                      );
                      
                      return (
                        <View key={section.shopId} style={styles.breakdownShopSection}>
                          {/* Shop Name in breakdown */}
                          <View style={styles.breakdownShopHeader}>
                            <Ionicons name="storefront-outline" size={14} color="#6B7280" />
                            <ThemedText style={styles.breakdownShopName}>{section.shopName}</ThemedText>
                          </View>
                          
                          {selectedShopItems.map(item => {
                            const unitPrice = Number(item.price || 0);
                            const itemTotal = unitPrice * item.quantity;
                            return (
                              <View key={item.id} style={styles.breakdownRow}>
                                {/* Product Image */}
                                {item.image ? (
                                  <Image source={{ uri: item.image }} style={styles.breakdownImage} contentFit="cover" />
                                ) : (
                                  <View style={styles.breakdownImagePlaceholder}>
                                    <Ionicons name="image-outline" size={16} color="#CBD5E1" />
                                  </View>
                                )}
                                
                                <View style={styles.breakdownLeft}>
                                  <ThemedText style={styles.breakdownName} numberOfLines={1}>
                                    {item.productName || 'Product'}
                                  </ThemedText>
                                  <ThemedText style={styles.breakdownCalc}>
                                    P{unitPrice.toFixed(2)} × {item.quantity}
                                  </ThemedText>
                                </View>
                                <ThemedText style={styles.breakdownTotal}>
                                  P{itemTotal.toFixed(2)}
                                </ThemedText>
                              </View>
                            );
                          })}
                          
                          {/* Shop subtotal */}
                          <View style={styles.breakdownShopSubtotal}>
                            <ThemedText style={styles.breakdownShopSubtotalText}>
                              {section.shopName} Subtotal: P{shopSubtotal.toFixed(2)}
                            </ThemedText>
                          </View>
                        </View>
                      );
                    })}
                    <View style={styles.breakdownDivider} />
                  </View>
                </ScrollView>
              )}
              
              {/* Fixed bottom section with subtotal and checkout button */}
              <View style={styles.summaryBottom}>
                <View style={styles.summaryRow}>
                  <View>
                    <ThemedText style={styles.summaryLabel}>
                      Subtotal ({selectedCount} {selectedCount === 1 ? 'item' : 'items'})
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.summaryValue}>P{selectedTotal.toFixed(2)}</ThemedText>
                </View>
                <TouchableOpacity
                  style={[styles.checkoutButton, selectedCount === 0 && styles.checkoutButtonDisabled]}
                  activeOpacity={0.85}
                  onPress={handleCheckout}
                  disabled={selectedCount === 0}
                >
                  <ThemedText style={styles.checkoutText}>
                    {selectedCount === 0 ? 'Select Items to Checkout' : `Checkout (${selectedCount})`}
                  </ThemedText>
                  {selectedCount > 0 && <Ionicons name="arrow-forward" size={18} color="#fff" />}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  selectedCountText: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkbox: {
    padding: 4,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  emptyCartContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  cartIconContainer: {
    marginBottom: 24,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  continueShoppingButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px 0px rgba(16, 185, 129, 0.3)',
      },
    }),
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
        boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
      },
    }),
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    fontSize: 15,
    color: '#111827',
  },
  itemPrice: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  removeButton: {
    padding: 6,
  },
  summaryCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    maxHeight: '60%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  breakdownScrollView: {
    flexShrink: 1,
    maxHeight: 250,
  },
  priceBreakdown: {
    gap: 8,
    paddingBottom: 8,
  },
  summaryBottom: {
    gap: 12,
    marginTop: 8,
    flexShrink: 0,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  breakdownImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  breakdownImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownLeft: {
    flex: 1,
    marginRight: 12,
  },
  breakdownName: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  breakdownCalc: {
    fontSize: 12,
    color: '#6B7280',
  },
  breakdownTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
  },
  breakdownShopSection: {
    marginBottom: 12,
  },
  breakdownShopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  breakdownShopName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  breakdownShopSubtotal: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  breakdownShopSubtotalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  shopSection: {
    marginBottom: 20,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    borderRadius: 8,
    marginBottom: 12,
  },
  shopHeaderText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6B7280',
  },
});
