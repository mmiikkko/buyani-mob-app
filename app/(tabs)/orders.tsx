import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api } from '@/lib/api';

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'shipped' | 'delivered' | 'rejected' | 'cancelled'>('all');

  const STATUS_TABS: { value: typeof statusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const statusColor = (status?: string) => {
    const key = (status || '').toLowerCase();
    if (['delivered', 'completed', 'shipped', 'accepted', 'confirmed'].includes(key)) return '#10B981';
    if (['pending'].includes(key)) return '#F59E0B';
    if (['cancelled', 'rejected'].includes(key)) return '#EF4444';
    return '#6B7280';
  };

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  // Hide tab bar immediately when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsVisible(false);
      fetchOrders();
      return () => {
        setIsVisible(true);
      };
    }, [setIsVisible, fetchOrders])
  );

  const grouped = useMemo(() => {
    return orders
      .map((o) => ({
        ...o,
        status: (o.status || o.payment?.status || 'pending').toLowerCase(),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: grouped.length };
    grouped.forEach((o) => {
      const key = o.status || 'pending';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [grouped]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return grouped;
    return grouped.filter((o) => {
      const status = o.status || 'pending';
      if (statusFilter === 'accepted') {
        return status === 'accepted' || status === 'confirmed';
      }
      return status === statusFilter;
    });
  }, [grouped, statusFilter]);

  return (
    <ThemedView style={styles.container}>
      {/* Back Button */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/account')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          My Orders
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* Status tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.tabsContainer,
          { paddingTop: 8, paddingBottom: 8 },
        ]}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
              onPress={() => setStatusFilter(tab.value)}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </ThemedText>
              <View style={styles.tabCountBadge}>
                <ThemedText style={styles.tabCountText}>
                  {statusCounts[tab.value] ?? 0}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#50C878" />
            <ThemedText style={styles.emptySubtitle}>Loading orders...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#d0d0d0" />
            <ThemedText type="title" style={styles.emptyTitle}>Unable to load orders</ThemedText>
            <ThemedText style={styles.emptySubtitle}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh} activeOpacity={0.8}>
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : grouped.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="receipt-outline" size={64} color="#d0d0d0" />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
              No orders yet
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Your order history will appear here
            </ThemedText>
          </View>
        ) : (
          filtered.map((order) => (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                    Order #{order.id?.slice(0, 6) || '----'}
                  </ThemedText>
                  <ThemedText style={styles.cardDate}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor(order.status)}20` }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor(order.status) }]} />
                  <ThemedText style={[styles.statusText, { color: statusColor(order.status) }]}>
                    {order.status || 'pending'}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.items}>
                {order.items?.map((item: any) => (
                  <View key={`${order.id}-${item.productId}`} style={styles.itemRow}>
                    <ThemedText style={styles.itemName} numberOfLines={1}>
                      {item.productName || 'Item'}
                    </ThemedText>
                    <ThemedText style={styles.itemQty}>x{item.quantity}</ThemedText>
                    <ThemedText style={styles.itemPrice}>₱{Number(item.subtotal || 0).toFixed(2)}</ThemedText>
                  </View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <ThemedText style={styles.totalLabel}>Total</ThemedText>
                <ThemedText style={styles.totalValue}>₱{Number(order.total || 0).toFixed(2)}</ThemedText>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const ORANGE = '#F5821F';
const EMERALD = '#10B981';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  /* ---------- HEADER ---------- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    padding: 8,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  placeholder: {
    width: 32,
  },

  /* ---------- STATUS TABS ---------- */
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },

  tabChipActive: {
    borderColor: EMERALD,
    backgroundColor: '#ECFDF3',
  },

  tabLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginRight: 6,
  },

  tabLabelActive: {
    color: EMERALD,
    fontWeight: '700',
  },

  tabCountBadge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },

  /* ---------- LIST ---------- */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexGrow: 1,
  },

  /* ---------- EMPTY / LOADING ---------- */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: EMERALD,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  /* ---------- ORDER CARD ---------- */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  cardDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  /* ---------- ITEMS ---------- */
  items: {
    marginBottom: 12,
    gap: 6,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },

  itemQty: {
    fontSize: 13,
    color: '#6B7280',
    width: 28,
    textAlign: 'right',
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    width: 80,
    textAlign: 'right',
  },

  /* ---------- FOOTER ---------- */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  totalLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: ORANGE,
  },
});

