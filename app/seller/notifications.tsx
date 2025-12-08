import React, { useRef, useState } from 'react';
import { StyleSheet, FlatList, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

const DATA = [
  { 
    id: '1', 
    title: 'Order SO-1045 ready', 
    body: 'Courier pickup scheduled for 3 PM.',
    icon: 'checkmark-circle',
    iconColor: '#2E7D32',
    bgColor: '#E8F5E9',
    time: '2 hours ago',
    type: 'success'
  },
  { 
    id: '2', 
    title: 'Stock alert', 
    body: 'Dried pineapple only has 5 packs left.',
    icon: 'alert-circle',
    iconColor: '#F5821F',
    bgColor: '#FFF3E0',
    time: '5 hours ago',
    type: 'warning'
  },
  { 
    id: '3', 
    title: 'Payout released', 
    body: '₱2,450 was sent to your bank account.',
    icon: 'wallet',
    iconColor: '#1976D2',
    bgColor: '#E3F2FD',
    time: '1 day ago',
    type: 'info'
  },
  {
    id: '4',
    title: 'New order received',
    body: 'Order SO-1047 for Fresh Kale Bundle worth ₱320.',
    icon: 'notifications',
    iconColor: '#7B1FA2',
    bgColor: '#F3E5F5',
    time: '2 days ago',
    type: 'info'
  },
];

export default function SellerNotificationsScreen() {
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

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.cardPadding]}>
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
              </View>
              <View style={styles.textContent}>
                <ThemedText type="defaultSemiBold" style={styles.title}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.body}>{item.body}</ThemedText>
                <ThemedText style={styles.time}>{item.time}</ThemedText>
              </View>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <LinearGradient
            colors={['#2E7D32', '#4CAF50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
              <View>
                <ThemedText type="title" style={styles.header}>
                  Notifications
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Stay updated with your store activities
                </ThemedText>
              </View>
            </LinearGradient>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>No notifications yet</ThemedText>
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
    gap: 16,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
  },
  cardPadding: {
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
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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


