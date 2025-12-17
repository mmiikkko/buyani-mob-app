import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';

type Conversation = {
  id: string;
  customerId: string;
  sellerId: string;
  productId: string | null;
  lastMessageAt: string;
  customerName: string;
  sellerName: string;
  productName: string | null;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ChatFab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Animation values for position (relative to container)
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const panAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const fetchUser = async () => {
    try {
      const token = await api.getToken();
      if (token) {
        const user = await api.getCurrentUser();
        setCurrentUserId(user?.id || null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchConversations = useCallback(async () => {
    try {
      const token = await api.getToken();
      if (!token) return;

      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://buyani-ecommerce-app-2kse.vercel.app/api';
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  const fetchUnreadCounts = useCallback(async (convs: Conversation[]) => {
    if (!currentUserId || convs.length === 0) return;

    try {
      const token = await api.getToken();
      if (!token) return;

      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://buyani-ecommerce-app-2kse.vercel.app/api';
      const counts: Record<string, number> = {};
      await Promise.all(
        convs.map(async (conv) => {
          try {
            const response = await fetch(`${API_BASE_URL}/conversations/${conv.id}/messages`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (response.ok) {
              const msgs = await response.json();
              const unread = msgs.filter(
                (m: Message) => m.senderId !== currentUserId && !m.isRead
              ).length;
              counts[conv.id] = unread;
            }
          } catch (error) {
            console.error(`Error fetching unread count for conversation ${conv.id}:`, error);
          }
        })
      );
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchUser();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      fetchUnreadCounts(conversations);
      const interval = setInterval(() => {
        fetchUnreadCounts(conversations);
        fetchConversations();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [conversations, fetchUnreadCounts, fetchConversations]);

  const totalUnreadCount = useMemo(() => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  }, [unreadCounts]);

  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Stop any ongoing animations
        if (panAnimation.current) {
          panAnimation.current.stop();
          panAnimation.current = null;
        }
        
        // Scale down slightly when pressed
        Animated.spring(scale, {
          toValue: 0.9,
          useNativeDriver: true,
        }).start();
        
        // Store the starting position
        const startX = (pan.x as any)._value;
        const startY = (pan.y as any)._value;
        
        // Set offset to current position
        pan.setOffset({
          x: startX,
          y: startY,
        });
        // Reset the value to zero for the gesture
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        // Scale back up
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        // Get the final position (value + offset)
        const finalX = (pan.x as any)._value + ((pan.x as any)._offset || 0);
        const finalY = (pan.y as any)._value + ((pan.y as any)._offset || 0);

        // Constrain to screen bounds (relative to container position)
        const fabWidth = 64;
        const fabHeight = 64;
        const containerRight = SCREEN_WIDTH - 20; // Container is at right: 20
        const containerBottom = SCREEN_HEIGHT - 20 - (insets.bottom || 0);
        
        const maxX = containerRight - fabWidth;
        const maxY = containerBottom - fabHeight;
        const minX = -20; // Can go slightly left of container
        const minY = -(SCREEN_HEIGHT - containerBottom); // Can go up to top

        const constrainedX = Math.max(minX, Math.min(maxX, finalX));
        const constrainedY = Math.max(minY, Math.min(maxY, finalY));

        // Flatten offset and set to constrained position
        pan.flattenOffset();
        pan.setValue({ x: constrainedX, y: constrainedY });
      },
    })
  ).current;

  const handlePress = () => {
    router.push('/(tabs)/messages');
  };

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
        {totalUnreadCount > 0 && (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{totalUnreadCount > 99 ? '99+' : totalUnreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 1000,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  fabBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
