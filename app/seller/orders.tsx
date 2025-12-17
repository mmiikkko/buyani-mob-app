import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api, SellerOrder } from '@/lib/api';

type Filter = 'all' | 'pending' | 'accepted' | 'rejected' | 'shipped';

export default function SellerOrdersScreen() {
  const { isVisible, setIsVisible } = useTabBar();
  const scrollY = useRef(0);

  const [lastScrollY, setLastScrollY] = useState(0);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getSellerOrders();
        setOrders(data);
      } catch (err: any) {
        console.error('Error fetching seller orders:', err);
        setError(err?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDifference = currentScrollY - lastScrollY;

    if (currentScrollY <= 10) {
      if (!isVisible) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
      scrollY.current = currentScrollY;
      return;
    }

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

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return '#2E7D32';
      case 'pending':
        return '#F5821F';
      case 'rejected':
        return '#D32F2F';
      case 'shipped':
        return '#1565C0';
      default:
        return '#757575';
    }
  };

  const handleUpdateStatus = async (orderId: string, status: 'accepted' | 'rejected' | 'shipped') => {
    try {
      setUpdating(orderId);
      await api.updateSellerOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err?.message || 'Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const renderOrder = ({ item }: { item: SellerOrder }) => {
    const statusColor = getStatusColor(item.status);
    const amount = item.total ?? 0;
    const amountText = `₱${Number(amount).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const primaryProduct = item.items?.[0]?.product;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <ThemedText type="defaultSemiBold" style={styles.orderId}>
              {item.id}
            </ThemedText>
            <ThemedText style={styles.orderBuyer}>
              {item.buyerName || 'Customer'}
            </ThemedText>
          </View>
          <ThemedText type="defaultSemiBold" style={styles.orderAmount}>
            {amountText}
          </ThemedText>
        </View>

        <View style={styles.orderBody}>
          {primaryProduct && (
            <ThemedText style={styles.orderProduct} numberOfLines={2}>
              {primaryProduct.productName}
              {item.items.length > 1 && ` + ${item.items.length - 1} more`}
            </ThemedText>
          )}
          <ThemedText style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleString()}
          </ThemedText>
        </View>

        <View style={styles.orderFooter}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <ThemedText style={[styles.statusText, { color: statusColor }]}>
              {item.status}
            </ThemedText>
          </View>

          <View style={styles.actionsRow}>
            {item.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleUpdateStatus(item.id, 'accepted')}
                  disabled={updating === item.id}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.actionButtonText}>Accept</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleUpdateStatus(item.id, 'rejected')}
                  disabled={updating === item.id}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.actionButtonText}>Reject</ThemedText>
                </TouchableOpacity>
              </>
            )}
            {item.status === 'accepted' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.shipButton]}
                onPress={() => handleUpdateStatus(item.id, 'shipped')}
                disabled={updating === item.id}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.actionButtonText}>Mark Shipped</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Orders
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Manage your online and in-store orders
          </ThemedText>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'shipped', label: 'Shipped' },
          { key: 'rejected', label: 'Rejected' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              filter === f.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.key as Filter)}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                filter === f.key && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            {error}
          </ThemedText>
        </View>
      )}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ThemedText style={styles.emptyText}>
                Loading orders...
              </ThemedText>
            ) : (
              <>
                <Ionicons name="file-tray-outline" size={64} color="#ccc" />
                <ThemedText style={styles.emptyText}>
                  No orders found
                </ThemedText>
              </>
            )}
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#2E7D32',
  },
  filterChipText: {
    fontSize: 13,
    color: '#424242',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#D32F2F',
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
      },
    }),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  orderId: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  orderBuyer: {
    fontSize: 13,
    color: '#757575',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  orderBody: {
    marginBottom: 12,
    gap: 4,
  },
  orderProduct: {
    fontSize: 14,
    color: '#424242',
  },
  orderDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  acceptButton: {
    backgroundColor: '#E8F5E9',
  },
  rejectButton: {
    backgroundColor: '#FFEBEE',
  },
  shipButton: {
    backgroundColor: '#E3F2FD',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});


