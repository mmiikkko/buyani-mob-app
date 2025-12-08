import React, { useRef, useState } from 'react';
import { StyleSheet, FlatList, View, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

const MESSAGES = [
  { 
    id: '1', 
    customerName: 'Maria Santos',
    lastMessage: 'Hi, when will my order be delivered?',
    time: '2 hours ago',
    unread: true,
    avatar: 'MS',
    orderId: 'SO-1045'
  },
  { 
    id: '2', 
    customerName: 'Juan Dela Cruz',
    lastMessage: 'Thank you for the fast delivery!',
    time: '5 hours ago',
    unread: false,
    avatar: 'JD',
    orderId: 'SO-1046'
  },
  { 
    id: '3', 
    customerName: 'Anna Garcia',
    lastMessage: 'Is this product still available?',
    time: '1 day ago',
    unread: true,
    avatar: 'AG',
    orderId: null
  },
  {
    id: '4',
    customerName: 'Carlos Reyes',
    lastMessage: 'Can I change my delivery address?',
    time: '2 days ago',
    unread: false,
    avatar: 'CR',
    orderId: 'SO-1047'
  },
];

export default function SellerInboxScreen() {
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
      scrollY.current = currentScrollY;
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

  const unreadCount = MESSAGES.filter((msg) => msg.unread).length;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={MESSAGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.messageCard, styles.messageCardPadding]} activeOpacity={0.7}>
            <View style={styles.messageContent}>
              <View style={[styles.avatar, item.unread && styles.avatarUnread]}>
                <ThemedText style={styles.avatarText}>{item.avatar}</ThemedText>
              </View>
              <View style={styles.messageInfo}>
                <View style={styles.messageHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.customerName}>
                    {item.customerName}
                  </ThemedText>
                  {item.unread && <View style={styles.unreadDot} />}
                  <ThemedText style={styles.time}>{item.time}</ThemedText>
                </View>
                <ThemedText 
                  style={[styles.lastMessage, item.unread && styles.lastMessageUnread]} 
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </ThemedText>
                {item.orderId && (
                  <View style={styles.orderBadge}>
                    <Ionicons name="receipt-outline" size={12} color="#2E7D32" />
                    <ThemedText style={styles.orderId}>{item.orderId}</ThemedText>
                  </View>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000000" />
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <LinearGradient
            colors={['#2E7D32', '#4CAF50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
              <View style={styles.headerRow}>
                <View>
                  <ThemedText type="title" style={styles.header}>
                    Inbox
                  </ThemedText>
                  <ThemedText style={styles.subtitle}>
                    Messages from customers
                  </ThemedText>
                </View>
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <ThemedText style={styles.unreadBadgeText}>{unreadCount}</ThemedText>
                  </View>
                )}
              </View>
            </LinearGradient>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-outline" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>No messages yet</ThemedText>
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
  list: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 40,
    gap: 12,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '700',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageCardPadding: {
    marginHorizontal: 20,
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
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  messageContent: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarUnread: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  messageInfo: {
    flex: 1,
    gap: 6,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  lastMessageUnread: {
    color: '#1A1A1A',
    fontWeight: '500',
  },
  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    marginTop: 4,
  },
  orderId: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

