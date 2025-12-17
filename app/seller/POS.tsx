import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api, SellerProduct } from '@/lib/api';

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
};

export default function SellerPOSScreen() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash' | 'Maya'>('Cash');
  const [paymentReceived, setPaymentReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setError(null);
        const data = await api.getSellerProducts();
        setProducts(
          data.filter((p) => (p.stock ?? 0) > 0 && (p.status || '').toLowerCase() !== 'removed')
        );
      } catch (err: any) {
        console.error('Error fetching POS products:', err);
        setError(err?.message || 'Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.productName.toLowerCase().includes(q) ||
      (p.SKU || '').toLowerCase().includes(q)
    );
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const change =
    paymentMethod === 'Cash' && paymentReceived
      ? Math.max(0, Number(paymentReceived) - subtotal)
      : 0;

  const handleAddToCart = (product: SellerProduct) => {
    const stock = product.stock ?? 0;
    if (stock <= 0) return;

    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.qty >= stock) {
          return prev;
        }
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.productName,
          price: product.price,
          qty: 1,
          stock,
        },
      ];
    });
  };

  const handleUpdateQty = (id: string, qty: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = Math.max(1, Math.min(qty, item.stock));
            return { ...item, qty: nextQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      Alert.alert('POS', 'Cart is empty');
      return;
    }

    if (paymentMethod === 'Cash' && (!paymentReceived || Number(paymentReceived) < subtotal)) {
      Alert.alert('POS', 'Payment received must be at least the total amount.');
      return;
    }

    try {
      setIsProcessing(true);
      const token = await api.getToken();
      if (!token) {
        Alert.alert('Authentication', 'Please log in again.');
        return;
      }

      const API_BASE_URL =
        process.env.EXPO_PUBLIC_API_URL || 'https://buyani-ecommerce-app-2kse.vercel.app/api';

      const res = await fetch(`${API_BASE_URL}/sellers/pos/complete-sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.qty,
            price: item.price,
          })),
          paymentMethod: paymentMethod.toLowerCase(),
          paymentReceived:
            paymentMethod === 'Cash' ? Number(paymentReceived) : subtotal,
          change: paymentMethod === 'Cash' ? change : 0,
        }),
      });

      if (!res.ok) {
        let message = 'Failed to complete sale';
        try {
          const data = await res.json();
          message = data.error || data.message || message;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      Alert.alert('POS', 'Sale completed successfully!');
      setCartItems([]);
      setPaymentMethod('Cash');
      setPaymentReceived('');
    } catch (err: any) {
      console.error('Error completing POS sale:', err);
      Alert.alert('POS Error', err?.message || 'Failed to complete sale');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerRow}>
          <View>
            <ThemedText type="title" style={styles.headerTitle}>
              POS
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Process in-store transactions
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      <View style={styles.contentRow}>
        {/* Products List */}
        <View style={styles.productsColumn}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            style={styles.productsList}
            contentContainerStyle={styles.productsListContent}
            showsVerticalScrollIndicator={false}
          >
            {loadingProducts ? (
              <ThemedText style={styles.emptyText}>
                Loading products...
              </ThemedText>
            ) : filteredProducts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="cube-outline" size={48} color="#ccc" />
                <ThemedText style={styles.emptyText}>
                  No available products
                </ThemedText>
              </View>
            ) : (
              filteredProducts.map((product) => {
                const stock = product.stock ?? 0;
                const isOutOfStock = stock <= 0;
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={[
                      styles.productRow,
                      isOutOfStock && styles.productRowDisabled,
                    ]}
                    onPress={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    activeOpacity={0.8}
                  >
                    <View style={styles.productInfo}>
                      <ThemedText
                        style={styles.productName}
                        numberOfLines={2}
                      >
                        {product.productName}
                      </ThemedText>
                      <ThemedText style={styles.productSku}>
                        {product.SKU || 'No SKU'}
                      </ThemedText>
                    </View>
                    <View style={styles.productMeta}>
                      <ThemedText style={styles.productPrice}>
                        ₱{Number(product.price).toFixed(2)}
                      </ThemedText>
                      <ThemedText style={styles.productStock}>
                        Stock: {stock}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Cart / Transaction Summary */}
        <View style={styles.cartColumn}>
          <View style={styles.cartCard}>
            <ThemedText type="title" style={styles.cartTitle}>
              Current Sale
            </ThemedText>

            <ScrollView
              style={styles.cartItems}
              contentContainerStyle={styles.cartItemsContent}
              showsVerticalScrollIndicator={false}
            >
              {cartItems.length === 0 ? (
                <ThemedText style={styles.cartEmptyText}>
                  No items yet.
                </ThemedText>
              ) : (
                cartItems.map((item) => (
                  <View key={item.id} style={styles.cartItemRow}>
                    <View style={styles.cartItemInfo}>
                      <ThemedText style={styles.cartItemName}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={styles.cartItemMeta}>
                        ₱{item.price.toFixed(2)} × {item.qty}
                      </ThemedText>
                    </View>
                    <View style={styles.cartItemActions}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => handleUpdateQty(item.id, item.qty - 1)}
                      >
                        <ThemedText style={styles.qtyButtonText}>-</ThemedText>
                      </TouchableOpacity>
                      <ThemedText style={styles.qtyText}>{item.qty}</ThemedText>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => handleUpdateQty(item.id, item.qty + 1)}
                      >
                        <ThemedText style={styles.qtyButtonText}>+</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(item.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#D32F2F"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Totals */}
            <View style={styles.totalRow}>
              <ThemedText style={styles.totalLabel}>Total:</ThemedText>
              <ThemedText style={styles.totalValue}>
                ₱{subtotal.toFixed(2)}
              </ThemedText>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>
                Payment Method
              </ThemedText>
              <View style={styles.paymentMethodsRow}>
                {(['Cash', 'GCash', 'Maya'] as const).map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentChip,
                      paymentMethod === method && styles.paymentChipActive,
                    ]}
                    onPress={() => {
                      setPaymentMethod(method);
                      if (method === 'Cash') {
                        setPaymentReceived('');
                      } else {
                        setPaymentReceived(subtotal.toFixed(2));
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.paymentChipText,
                        paymentMethod === method && styles.paymentChipTextActive,
                      ]}
                    >
                      {method}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Received for Cash */}
            {paymentMethod === 'Cash' && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionLabel}>
                  Payment Received
                </ThemedText>
                <View style={styles.paymentInputRow}>
                  <TextInput
                    style={styles.paymentInput}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    value={paymentReceived}
                    onChangeText={setPaymentReceived}
                  />
                </View>
                {paymentReceived &&
                  Number(paymentReceived) >= subtotal && (
                    <ThemedText style={styles.changeText}>
                      Change: ₱{change.toFixed(2)}
                    </ThemedText>
                  )}
              </View>
            )}

            {/* Complete Sale */}
            <TouchableOpacity
              style={[
                styles.completeButton,
                (isProcessing ||
                  (paymentMethod === 'Cash' &&
                    (!paymentReceived ||
                      Number(paymentReceived) < subtotal)) ||
                  cartItems.length === 0) &&
                  styles.completeButtonDisabled,
              ]}
              onPress={handleCompleteSale}
              disabled={
                isProcessing ||
                cartItems.length === 0 ||
                (paymentMethod === 'Cash' &&
                  (!paymentReceived ||
                    Number(paymentReceived) < subtotal))
              }
              activeOpacity={0.8}
            >
              <ThemedText style={styles.completeButtonText}>
                {isProcessing ? 'Processing...' : 'Complete Sale'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#D32F2F',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  productsColumn: {
    flex: 3,
    marginRight: 4,
  },
  cartColumn: {
    flex: 2,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  productsList: {
    flex: 1,
  },
  productsListContent: {
    paddingBottom: 40,
    gap: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 6px rgba(0,0,0,0.06)',
      },
    }),
  },
  productRowDisabled: {
    opacity: 0.45,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  productSku: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  productMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  productStock: {
    fontSize: 12,
    color: '#616161',
  },
  cartCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 3px 10px rgba(0,0,0,0.08)',
      },
    }),
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  cartItems: {
    maxHeight: 240,
    marginBottom: 8,
  },
  cartItemsContent: {
    paddingBottom: 8,
    gap: 8,
  },
  cartEmptyText: {
    fontSize: 14,
    color: '#999',
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 6,
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cartItemMeta: {
    fontSize: 12,
    color: '#757575',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  qtyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  removeButton: {
    padding: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#424242',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  section: {
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 6,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F1F1',
  },
  paymentChipActive: {
    backgroundColor: '#2E7D32',
  },
  paymentChipText: {
    fontSize: 12,
    color: '#424242',
  },
  paymentChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paymentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  paymentInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  changeText: {
    marginTop: 4,
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  completeButton: {
    marginTop: 14,
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});


