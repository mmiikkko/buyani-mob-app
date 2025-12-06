import React, { useRef, useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

const NOTIFICATIONS = [
  {
    id: '1',
    type: 'order',
    icon: 'checkmark-circle',
    title: 'Order Delivered',
    body: 'Your dried pineapple has arrived. Rate your experience!',
    time: '2 hours ago',
    isRead: false,
    color: '#50C878',
  },
  {
    id: '2',
    type: 'price',
    icon: 'pricetag',
    title: 'Price Drop Alert',
    body: 'Crochet keychain is now ₱45. Save ₱5 on this item!',
    time: '5 hours ago',
    isRead: false,
    color: '#FF6B6B',
  },
  {
    id: '3',
    type: 'collection',
    icon: 'sparkles',
    title: 'New Collection',
    body: 'Check out fresh vegetables from local farmers near you.',
    time: '1 day ago',
    isRead: true,
    color: '#4A90E2',
  },
  {
    id: '4',
    type: 'order',
    icon: 'cube',
    title: 'Order Shipped',
    body: 'Your order #1234 is on the way! Expected delivery: Tomorrow',
    time: '2 days ago',
    isRead: true,
    color: '#50C878',
  },
  {
    id: '5',
    type: 'promo',
    icon: 'gift',
    title: 'Special Offer',
    body: 'Get 20% off on all handmade items this weekend only!',
    time: '3 days ago',
    isRead: true,
    color: '#F5A623',
  },
];

function NotificationCard({ item }: { item: (typeof NOTIFICATIONS)[number] }) {
  return (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <ThemedText type="defaultSemiBold" style={styles.notificationTitle}>
            {item.title}
          </ThemedText>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <ThemedText style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </ThemedText>
        <ThemedText style={styles.notificationTime}>{item.time}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { isVisible, setIsVisible } = useTabBar();
  const scrollY = useRef(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const unreadCount = NOTIFICATIONS.filter((n) => !n.isRead).length;

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
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 28 }]}>
        <View>
          <ThemedText type="title" style={styles.headerTitle}>
            Notifications
          </ThemedText>
          {unreadCount > 0 && (
            <ThemedText style={styles.headerSubtitle}>
              {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
            </ThemedText>
          )}
        </View>
        <TouchableOpacity style={styles.markAllButton} activeOpacity={0.7}>
          <ThemedText style={styles.markAllText}>Mark all read</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {NOTIFICATIONS.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="notifications-outline" size={64} color="#ccc" />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
              No notifications
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              You're all caught up! Check back later for updates.
            </ThemedText>
          </View>
        ) : (
          NOTIFICATIONS.map((item) => <NotificationCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#50C878',
    fontWeight: '600',
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  markAllText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  list: {
    padding: 20,
    gap: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  unreadCard: {
    borderColor: '#50C878',
    borderWidth: 2,
    backgroundColor: '#f0fdf4',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 6,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#50C878',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
