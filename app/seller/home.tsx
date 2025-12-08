import React, { useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTabBar } from '@/contexts/tab-bar-context';

const METRICS = [
  { 
    id: 'sales', 
    label: "Today's Sales", 
    value: '₱4,520',
    icon: 'cash-outline',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    trend: '+12%'
  },
  { 
    id: 'orders', 
    label: 'Pending Orders', 
    value: '12',
    icon: 'receipt-outline',
    color: '#F5821F',
    bgColor: '#FFF3E0',
    trend: '3 new'
  },
  { 
    id: 'inventory', 
    label: 'Low Stock Items', 
    value: '4',
    icon: 'alert-circle-outline',
    color: '#D32F2F',
    bgColor: '#FFEBEE',
    trend: 'Action needed'
  },
];

const ORDERS = [
  { 
    id: 'SO-1045', 
    item: 'Fresh Kale Bundle', 
    amount: '₱220', 
    status: 'Ready to ship',
    statusColor: '#2E7D32',
    customer: 'Maria Santos',
    time: '2 hours ago'
  },
  { 
    id: 'SO-1046', 
    item: 'Dried Pineapple Pack', 
    amount: '₱95', 
    status: 'Awaiting pickup',
    statusColor: '#F5821F',
    customer: 'Juan Dela Cruz',
    time: '5 hours ago'
  },
];

export default function SellerHomeScreen() {
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
    <ThemedView style={styles.wrapper}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={['#2E7D32', '#4CAF50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <ThemedText type="title" style={styles.headerTitle}>
                Seller Dashboard
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Monitor your store performance at a glance
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.7}
            >
              <Ionicons name="storefront-outline" size={16} color="#fff" />
              <ThemedText style={styles.switchButtonTextWhite}>Customer View</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Metrics Cards */}
        <View style={styles.metricRow}>
          {METRICS.map((metric) => (
            <View key={metric.id} style={[styles.metricCard, { borderLeftColor: metric.color }]}>
              <View style={[styles.metricIconContainer, { backgroundColor: metric.bgColor }]}>
                <Ionicons name={metric.icon as any} size={24} color={metric.color} />
              </View>
              <View style={styles.metricContent}>
                <ThemedText style={styles.metricLabel} numberOfLines={2}>
                  {metric.label}
                </ThemedText>
                <ThemedText type="title" style={[styles.metricValue, { color: metric.color }]}>
                  {metric.value}
                </ThemedText>
                <ThemedText style={[styles.metricTrend, { color: metric.color }]} numberOfLines={1}>
                  {metric.trend}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Orders Section */}
        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Orders</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Manage your pending orders</ThemedText>
          </View>
          <TouchableOpacity style={styles.seeAllButton}>
            <ThemedText style={styles.linkText}>See all</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {ORDERS.map((order, index) => (
            <TouchableOpacity 
              key={order.id} 
              style={[
                styles.orderRow,
                index !== ORDERS.length - 1 && styles.orderRowBorder
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.orderContent}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.orderItem}>
                      {order.item}
                    </ThemedText>
                    <ThemedText style={styles.orderId}>{order.id}</ThemedText>
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.orderAmount}>
                    {order.amount}
                  </ThemedText>
                </View>
                <View style={styles.orderFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: `${order.statusColor}15` }]}>
                    <View style={[styles.statusDot, { backgroundColor: order.statusColor }]} />
                    <ThemedText style={[styles.orderStatus, { color: order.statusColor }]}>
                      {order.status}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.orderTime}>{order.time}</ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#000000" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.viewAllButton} 
            activeOpacity={0.8}
            onPress={() => router.push('/seller/products')}
          >
            <Ionicons name="grid-outline" size={20} color="#2E7D32" />
            <ThemedText type="defaultSemiBold" style={styles.viewAllButtonText}>
              View All Products
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['#2E7D32', '#4CAF50']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <ThemedText type="defaultSemiBold" style={styles.ctaText}>
                Add New Product
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  switchButtonTextWhite: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 24,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 100,
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  metricIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricContent: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  metricTrend: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  orderRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderContent: {
    flex: 1,
    gap: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
    gap: 4,
  },
  orderItem: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  orderId: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  orderAmount: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '700',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderTime: {
    fontSize: 11,
    color: '#999',
  },
  actionButtonsContainer: {
    marginTop: 24,
    marginHorizontal: 20,
    gap: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2E7D32',
    ...Platform.select({
      ios: {
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px 0px rgba(46, 125, 50, 0.1)',
      },
    }),
  },
  viewAllButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
  ctaButton: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(46, 125, 50, 0.3)',
      },
    }),
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});


