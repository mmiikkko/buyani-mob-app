import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api } from '@/lib/api';

const MENU_ITEMS = [
  {
    id: 'orders',
    label: 'My Orders',
    icon: 'cube-outline',
    color: '#50C878',
    description: 'View order history',
  },
  {
    id: 'address',
    label: 'Shipping Address',
    icon: 'location-outline',
    color: '#4A90E2',
    description: 'Manage delivery addresses',
  },
  {
    id: 'payments',
    label: 'Payment Methods',
    icon: 'card-outline',
    color: '#F5A623',
    description: 'Add or edit payment cards',
  },
  {
    id: 'support',
    label: 'Help & Support',
    icon: 'help-circle-outline',
    color: '#FF6B6B',
    description: 'Get help and contact us',
  },
  {
    id: 'seller',
    label: 'Become a Seller',
    icon: 'storefront-outline',
    color: '#9B59B6',
    description: 'Start selling your products',
  },
];

const STATS = [
  { label: 'Orders', icon: 'receipt-outline' },
  { label: 'Saved', icon: 'heart-outline' },
  { label: 'Reviews', icon: 'star-outline' },
];

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { isVisible, setIsVisible } = useTabBar();
  const scrollY = useRef(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const fadeOpacity = useSharedValue(1);
  const [userName, setUserName] = useState('Buyani Customer');
  const [userEmail, setUserEmail] = useState('customer@buyani.app');
  const [userInitials, setUserInitials] = useState('B');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setUserName(user.name || user.email?.split('@')[0] || 'Buyani Customer');
          setUserEmail(user.email || 'customer@buyani.app');
          
          // Generate initials from name or email
          const name = user.name || user.email?.split('@')[0] || '';
          if (name) {
            const nameParts = name.trim().split(' ');
            if (nameParts.length >= 2) {
              setUserInitials(
                (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
              );
            } else {
              setUserInitials(name.substring(0, 1).toUpperCase());
            }
          } else {
            setUserInitials('B');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Smooth fade-out transition before navigation
      fadeOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });

      // Clear the authentication token
      const { api } = await import('@/lib/api');
      await api.clearToken();

      // Navigate to login screen after animation
      setTimeout(() => {
        router.replace('/login');
      }, 300);
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Smooth fade-out even on error
      fadeOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });

      setTimeout(() => {
        router.replace('/login');
      }, 300);
    }
  };

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeOpacity.value,
  }));

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
      <Animated.View style={[{ flex: 1 }, fadeStyle]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={['#50C878', '#40B068', '#35A05A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.profileHeader, { paddingTop: insets.top + 48 }]}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText type="title" style={styles.avatarText}>
                  {userInitials}
                </ThemedText>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="title" style={styles.profileName}>
                {userName}
              </ThemedText>
              <ThemedText style={styles.profileEmail}>{userEmail}</ThemedText>
              <View style={styles.profileStats}>
                {STATS.map((stat, index) => (
                  <View key={stat.label} style={styles.statItem}>
                    <Ionicons name={stat.icon as any} size={18} color="#fff" />
                    <View style={styles.statContent}>
                      <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
                    </View>
                    {index < STATS.length - 1 && <View style={styles.statDivider} />}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActions}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickActionCard}
                activeOpacity={0.8}
                onPress={() => {
                  if (item.id === 'support') {
                    router.push('/(tabs)/support');
                  } else if (item.id === 'seller') {
                    router.push('/(tabs)/become-seller');
                  } else if (item.id === 'orders') {
                    router.push('/(tabs)/orders');
                  } else if (item.id === 'address') {
                    router.push('/(tabs)/address');
                  } else if (item.id === 'payments') {
                    router.push('/(tabs)/payments');
                  }
                }}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={styles.quickActionContent}>
                  <ThemedText type="defaultSemiBold" style={styles.quickActionLabel}>
                    {item.label}
                  </ThemedText>
                  <ThemedText style={styles.quickActionDescription}>
                    {item.description}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/edit-profile')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="person-outline" size={22} color="#666" />
                <ThemedText style={styles.settingLabel}>Edit Profile</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="settings-outline" size={22} color="#666" />
                <ThemedText style={styles.settingLabel}>Settings</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/privacy-security')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#666" />
                <ThemedText style={styles.settingLabel}>Privacy & Security</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <ThemedText type="defaultSemiBold" style={styles.logoutText}>
            Log out
          </ThemedText>
        </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileHeader: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  profileContent: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A90E2',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileEmail: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 12,
  },
  statContent: {
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  quickActions: {
    gap: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
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
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionContent: {
    flex: 1,
    gap: 4,
  },
  quickActionLabel: {
    fontSize: 16,
    color: '#333',
  },
  quickActionDescription: {
    fontSize: 13,
    color: '#999',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px 0px rgba(255, 107, 107, 0.3)',
      },
    }),
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
