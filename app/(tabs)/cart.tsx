import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api, type CartItem } from '@/lib/api';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      // Use the same simple pattern as products/shops
      const data = await api.getCart();
      setItems(data);
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
  }, []);

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
      await fetchCart();
    } catch (err: any) {
      console.error('Failed to remove item:', err);
      Alert.alert('Cart', err.message || 'Failed to remove item');
    }
  };

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  }, [items]);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
        ) : (
          <View style={styles.itemPlaceholder}>
            <Ionicons name="image-outline" size={28} color="#ccc" />
          </View>
        )}
      </View>
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
            <ActivityIndicator size="large" color="#50C878" />
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
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
            <View style={[styles.summaryCard, { paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
                <ThemedText style={styles.summaryValue}>P{total.toFixed(2)}</ThemedText>
              </View>
              <TouchableOpacity
                style={styles.checkoutButton}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/checkout')}
              >
                <ThemedText style={styles.checkoutText}>Proceed to Checkout</ThemedText>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
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
    backgroundColor: '#50C878',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#50C878',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px 0px rgba(80, 200, 120, 0.3)',
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
    color: '#50C878',
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
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
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
    backgroundColor: '#50C878',
    paddingVertical: 14,
    borderRadius: 12,
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

