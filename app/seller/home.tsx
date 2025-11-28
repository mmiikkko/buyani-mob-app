import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

const METRICS = [
  { id: 'sales', label: "Today's Sales", value: '₱4,520' },
  { id: 'orders', label: 'Pending Orders', value: '12' },
  { id: 'inventory', label: 'Low Stock Items', value: '4' },
];

const ORDERS = [
  { id: 'SO-1045', item: 'Fresh Kale Bundle', amount: '₱220', status: 'Ready to ship' },
  { id: 'SO-1046', item: 'Dried Pineapple Pack', amount: '₱95', status: 'Awaiting pickup' },
];

export default function SellerHomeScreen() {
  return (
    <ThemedView style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ThemedText type="title">Seller Dashboard</ThemedText>
        <ThemedText style={styles.subtitle}>Monitor store performance at a glance.</ThemedText>

        <View style={styles.metricRow}>
          {METRICS.map((metric) => (
            <View key={metric.id} style={styles.metricCard}>
              <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
              <ThemedText type="title" style={styles.metricValue}>
                {metric.value}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Recent Orders</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.linkText}>See all</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {ORDERS.map((order) => (
            <View key={order.id} style={styles.orderRow}>
              <View>
                <ThemedText type="defaultSemiBold">{order.item}</ThemedText>
                <ThemedText style={styles.orderMeta}>
                  {order.id} • {order.amount}
                </ThemedText>
                <ThemedText style={styles.orderStatus}>{order.status}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#aaa" />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton}>
          <ThemedText type="defaultSemiBold" style={styles.ctaText}>
            Add New Product
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f3f6f1',
  },
  container: {
    padding: 20,
    gap: 20,
  },
  subtitle: {
    color: '#616161',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 120,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7a7a7a',
    marginBottom: 8,
  },
  metricValue: {
    color: '#2d8a34',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    color: '#2d8a34',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 10,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ececec',
  },
  orderMeta: {
    fontSize: 12,
    color: '#777',
  },
  orderStatus: {
    fontSize: 12,
    color: '#f5821f',
  },
  ctaButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#2d8a34',
  },
  ctaText: {
    color: '#fff',
  },
});


