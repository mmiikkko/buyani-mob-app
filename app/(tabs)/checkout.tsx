import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api, type CartItem } from '@/lib/api';
import { useTabBar } from '@/contexts/tab-bar-context';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();

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
    deliveryNotes: '',
  });

  useEffect(() => {
    setIsVisible(false);
    return () => setIsVisible(true);
  }, [setIsVisible]);

  const loadCart = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.getCart();
      setCartItems(data);
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
      Alert.alert('Checkout', 'Your cart is empty.');
      return;
    }
    if (!address.fullName || !address.street || !address.city || !address.province || !address.zipcode) {
      Alert.alert('Checkout', 'Please fill in name, street, city, province, and zipcode.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createOrder({
        address,
        paymentMethod,
        cartItems: cartItems.map((item) => ({
          id: item.id,
          productId: item.productId || '',
          quantity: item.quantity,
          price: item.price,
        })),
      });
      Alert.alert('Checkout', 'Order placed successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/orders') },
      ]);
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#50C878" />
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
            <ThemedText style={styles.emptySubtitle}>Your cart is empty.</ThemedText>
          </View>
        ) : (
          <>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Shipping Details
            </ThemedText>
            <View style={styles.card}>
              {([
                ['Full Name', 'fullName', 'text'],
                ['Street', 'street', 'text'],
                ['Apt / Unit (optional)', 'apartment', 'text'],
                ['City', 'city', 'text'],
                ['Province', 'province', 'text'],
                ['Zip Code', 'zipcode', 'number'],
                ['Country', 'country', 'text'],
                ['Delivery Notes (optional)', 'deliveryNotes', 'text'],
              ] as const).map(([label, key, keyboard]) => (
                <View key={key} style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>{label}</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={(address as any)[key]}
                    onChangeText={(val) => setAddress((prev) => ({ ...prev, [key]: val }))}
                    placeholder={label}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboard === 'number' ? 'number-pad' : 'default'}
                  />
                </View>
              ))}
            </View>

            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Payment Method
            </ThemedText>
            <View style={styles.cardRow}>
              {(['cod', 'gcash'] as const).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentOption,
                    paymentMethod === method && styles.paymentOptionActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                  activeOpacity={0.8}
                >
                  <View style={styles.radioOuter}>
                    {paymentMethod === method && <View style={styles.radioInner} />}
                  </View>
                  <ThemedText style={styles.paymentLabel}>
                    {method === 'cod' ? 'Cash on Delivery' : 'GCash'}
                  </ThemedText>
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

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
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
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: '#6B7280',
    fontSize: 13,
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
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#f9fafb',
  },
  paymentOptionActive: {
    borderColor: '#50C878',
    backgroundColor: '#ecfdf3',
  },
  paymentLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#50C878',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#50C878',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  placeOrderButton: {
    backgroundColor: '#50C878',
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
    backgroundColor: '#50C878',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});


