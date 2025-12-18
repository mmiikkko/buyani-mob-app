import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCart } from '@/contexts/cart-context';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api, type CartItem } from '@/lib/api';

const SELECTED_CART_ITEMS_KEY = 'selected_cart_items';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://buyani-ecommerce-app-2kse.vercel.app/api';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const { refreshCart } = useCart();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'gcash'>('cod');
  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    apartment: '',
    city: '',
    province: '',
    zipcode: '',
    country: 'Philippines',
    contactNumber: '',
    deliveryNotes: '',
  });

  // Hide tab bar when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsVisible(false);
      return () => {
        setIsVisible(true);
      };
    }, [setIsVisible])
  );

  const loadCart = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Get selected item IDs from AsyncStorage FIRST
      const selectedIdsJson = await AsyncStorage.getItem(SELECTED_CART_ITEMS_KEY);
      
      if (!selectedIdsJson) {
        // If no selection stored, user shouldn't be on checkout - redirect back
        setError('No items selected for checkout');
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      const selectedIds: string[] = JSON.parse(selectedIdsJson);
      
      // Get all cart items
      const allItems = await api.getCart();
      
      // Filter to only include selected items - use strict comparison
      const selectedItems = allItems.filter(item => item.id && selectedIds.includes(item.id));
      
      if (selectedItems.length === 0) {
        setError('Selected items not found in cart');
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      // Only set cart items if we have valid selected items
      // DON'T clear AsyncStorage here - wait until order is successfully created
      setCartItems(selectedItems);
      
      console.log('Checkout: Loaded selected items', {
        selectedIdsCount: selectedIds.length,
        selectedItemsCount: selectedItems.length,
        allItemsCount: allItems.length,
      });
    } catch (err: any) {
      console.error('Checkout cart load error:', err);
      setError(err.message || 'Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
    [cartItems]
  );

  const handleSubmit = async () => {
    if (!cartItems.length) {
      Alert.alert('Checkout', 'No items to checkout.');
      return;
    }
    if (!address.fullName || !address.street || !address.city || !address.province || !address.zipcode || !address.contactNumber) {
      Alert.alert('Checkout', 'Please fill in all required fields (name, street, city, province, zipcode, and contact number).');
      return;
    }

    try {
      setSubmitting(true);
      
      // Double-check we have the correct selected items from AsyncStorage
      const selectedIdsJson = await AsyncStorage.getItem(SELECTED_CART_ITEMS_KEY);
      let itemsToCheckout = cartItems;
      
      if (selectedIdsJson) {
        const selectedIds: string[] = JSON.parse(selectedIdsJson);
        // Filter to ensure we only checkout selected items
        itemsToCheckout = cartItems.filter(item => item.id && selectedIds.includes(item.id));
        
        if (itemsToCheckout.length !== cartItems.length) {
          console.warn('Checkout: Cart items mismatch - using filtered items', {
            cartItemsCount: cartItems.length,
            filteredCount: itemsToCheckout.length,
            selectedIds,
          });
        }
      }
      
      if (itemsToCheckout.length === 0) {
        Alert.alert('Checkout', 'No valid items to checkout.');
        setSubmitting(false);
        return;
      }
      
      console.log('Checkout: Creating order with items', {
        itemsCount: itemsToCheckout.length,
        itemIds: itemsToCheckout.map(i => i.id),
      });
      
      // Create order(s) - one per shop - using only the selected items
      const result = await api.createOrder({
        address: {
          ...address,
          contactNumber: address.contactNumber,
        },
          paymentMethod,
          cartItems: itemsToCheckout.map((item) => ({
          id: item.id,
          productId: item.productId || '',
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // Handle GCash payment - redirect to PayMongo
      if (paymentMethod === 'gcash') {
        Alert.alert(
          'Redirecting to GCash',
          'You will be redirected to complete your payment.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setSubmitting(false),
            },
            {
              text: 'Continue',
              onPress: async () => {
                try {
                  // For multiple shop orders, combine them into one payment description
                  const orderCount = (result as any).orders?.length || 1;
                  const description = orderCount > 1
                    ? `Buyani Orders (${orderCount} shops) - Total: ₱${result.subtotal}`
                    : `Buyani Order #${result.orderId}`;

                  const gcashResult = await api.createGCashPayment({
                    orderId: result.orderId,
                    orderIds: (result as any).orders?.map((o: any) => o.orderId) || [result.orderId],
                    amount: result.subtotal,
                    description,
                  });
                  
                  // Clear the selected items from AsyncStorage after order is created
                  await AsyncStorage.removeItem(SELECTED_CART_ITEMS_KEY);

                  // Open GCash payment URL in browser
                  const canOpen = await Linking.canOpenURL(gcashResult.checkoutUrl);
                  if (canOpen) {
                    await Linking.openURL(gcashResult.checkoutUrl);
                    // Refresh cart after opening payment URL
                    await refreshCart();
                  } else {
                    Alert.alert('Error', 'Unable to open payment URL. Please try again.');
                    setSubmitting(false);
                  }
                } catch (gcashError: any) {
                  console.error('GCash payment error:', gcashError);
                  Alert.alert('Payment Error', gcashError.message || 'Failed to create payment session. Please try again.');
                  setSubmitting(false);
                }
              },
            },
          ]
        );
        return;
      }

      // For COD and other payment methods
      // Clear the selected items from AsyncStorage after successful order
      await AsyncStorage.removeItem(SELECTED_CART_ITEMS_KEY);
      await refreshCart();
      
      const orderCount = (result as any).orders?.length || 1;
      Alert.alert(
        'Order Placed!',
        orderCount > 1 
          ? `${orderCount} orders placed successfully!`
          : 'Order placed successfully!',
        [
          { text: 'OK', onPress: () => router.replace('/(tabs)/orders') },
        ]
      );
    } catch (err: any) {
      console.error('Checkout error:', err);
      Alert.alert('Checkout', err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.wrapper}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Checkout
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <ThemedText style={styles.emptySubtitle}>Loading cart...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#d0d0d0" />
            <ThemedText style={styles.emptySubtitle}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={loadCart} activeOpacity={0.8}>
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : !cartItems.length ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color="#d0d0d0" />
            <ThemedText style={styles.emptySubtitle}>No items selected for checkout.</ThemedText>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => router.back()} 
              activeOpacity={0.8}
            >
              <ThemedText style={styles.retryText}>Go Back to Cart</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Selected Items Summary */}
            <View style={styles.selectedItemsBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <ThemedText style={styles.selectedItemsText}>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} selected for checkout
              </ThemedText>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Shipping Details
            </ThemedText>
            <View style={styles.card}>
              {([
                ['Full Name', 'fullName', 'text', true],
                ['Contact Number', 'contactNumber', 'phone-pad', true],
                ['Street', 'street', 'text', true],
                ['Apt / Unit (optional)', 'apartment', 'text', false],
                ['City', 'city', 'text', true],
                ['Province', 'province', 'text', true],
                ['Zip Code', 'zipcode', 'number-pad', true],
                ['Country', 'country', 'text', true],
                ['Delivery Notes (optional)', 'deliveryNotes', 'text', false],
              ] as const).map(([label, key, keyboard, required]) => (
                <View key={key} style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>
                    {label} {required && <ThemedText style={styles.required}>*</ThemedText>}
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={(address as any)[key]}
                    onChangeText={(val) => setAddress((prev) => ({ ...prev, [key]: val }))}
                    placeholder={label}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboard === 'number-pad' || keyboard === 'phone-pad' ? keyboard : 'default'}
                    required={required}
                  />
                </View>
              ))}
            </View>

            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Payment Method
            </ThemedText>
            <View style={styles.cardRow}>
              {([
                { id: 'cod' as const, name: 'Cash on Delivery', icon: '💵', recommended: false },
                { id: 'gcash' as const, name: 'GCash', icon: '💙', recommended: true },
              ]).map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentOption,
                    paymentMethod === method.id && styles.paymentOptionActive,
                  ]}
                  onPress={() => setPaymentMethod(method.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.paymentIconContainer, method.id === 'gcash' && styles.gcashIconBg]}>
                    <ThemedText style={styles.paymentIcon}>{method.icon}</ThemedText>
                  </View>
                  <View style={styles.paymentLabelContainer}>
                    <View style={styles.paymentLabelRow}>
                      <ThemedText style={styles.paymentLabel}>{method.name}</ThemedText>
                      {method.recommended && (
                        <View style={styles.recommendedBadge}>
                          <ThemedText style={styles.recommendedText}>Recommended</ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.radioOuter}>
                    {paymentMethod === method.id && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Order Summary
            </ThemedText>
            <View style={styles.card}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.summaryRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.itemName} numberOfLines={1}>
                      {item.productName || 'Item'}
                    </ThemedText>
                    <ThemedText style={styles.itemMeta}>
                      Qty {item.quantity}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.itemPrice}>
                    ₱{((item.price || 0) * item.quantity).toFixed(2)}
                  </ThemedText>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <ThemedText style={styles.totalLabel}>Subtotal</ThemedText>
                <ThemedText style={styles.totalValue}>₱{subtotal.toFixed(2)}</ThemedText>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View>
          <ThemedText style={styles.totalLabel}>Total</ThemedText>
          <ThemedText style={styles.totalValue}>₱{subtotal.toFixed(2)}</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, (!cartItems.length || submitting) && styles.placeOrderDisabled]}
          onPress={handleSubmit}
          disabled={!cartItems.length || submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.placeOrderText}>Place Order</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectedItemsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  selectedItemsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 16,
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 18,
    gap: 12,
  },
  cardRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 18,
    gap: 10,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: '#6B7280',
    fontSize: 13,
  },
  required: {
    color: '#DC2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#f9fafb',
  },
  paymentOptionActive: {
    borderColor: '#10B981',
    backgroundColor: '#ecfdf3',
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gcashIconBg: {
    backgroundColor: '#E0F2FE',
  },
  paymentIcon: {
    fontSize: 24,
  },
  paymentLabelContainer: {
    flex: 1,
  },
  paymentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  recommendedBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E40AF',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    color: '#111827',
    fontWeight: '600',
  },
  itemMeta: {
    color: '#6B7280',
    fontSize: 12,
  },
  itemPrice: {
    color: '#111827',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  totalValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  placeOrderButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  placeOrderDisabled: {
    backgroundColor: '#9CA3AF',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptySubtitle: {
    color: '#6B7280',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
