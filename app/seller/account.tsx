import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api } from '@/lib/api';

const MENU_ITEMS = [
  { id: 'profile', label: 'Store Profile', icon: 'storefront-outline', color: '#2E7D32' },
  { id: 'products', label: 'Manage Products', icon: 'cube-outline', color: '#F5821F' },
  { id: 'payouts', label: 'Payout Settings', icon: 'wallet-outline', color: '#1976D2' },
  { id: 'support', label: 'Seller Support', icon: 'help-circle-outline', color: '#7B1FA2' },
];

export default function SellerAccountScreen() {
  const router = useRouter();
  const { isVisible, setIsVisible } = useTabBar();
  const scrollY = useRef(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userName, setUserName] = useState('Buyani Seller');
  const [userEmail, setUserEmail] = useState('seller@buyani.app');
  const [userInitials, setUserInitials] = useState('BS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setUserName(user.name || user.email?.split('@')[0] || 'Buyani Seller');
          setUserEmail(user.email || 'seller@buyani.app');
          
          // Generate initials from name or email
          const name = user.name || user.email?.split('@')[0] || '';
          if (name) {
            const nameParts = name.trim().split(' ');
            if (nameParts.length >= 2) {
              setUserInitials(
                (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
              );
            } else {
              setUserInitials(name.substring(0, 2).toUpperCase());
            }
          } else {
            setUserInitials('BS');
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
      await api.clearToken();
    } catch (error) {
      console.error('Error clearing token:', error);
    }
    router.replace('/login');
  };

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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Card with Gradient */}
        <LinearGradient
          colors={['#2E7D32', '#4CAF50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatar}>
              <ThemedText type="title" style={styles.avatarText}>
                {userInitials}
              </ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="title" style={styles.profileName}>
                {userName}
              </ThemedText>
              <ThemedText style={styles.profileEmail}>{userEmail}</ThemedText>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <ThemedText style={styles.verifiedText}>Verified Seller</ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.menuItem,
                index !== MENU_ITEMS.length - 1 && styles.menuItemBorder
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#000000" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.7}
          >
            <Ionicons name="storefront-outline" size={20} color="#2E7D32" />
            <ThemedText type="defaultSemiBold" style={styles.switchButtonText}>
              Switch to Customer View
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.logoutText}>
              Log out
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    gap: 20,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
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
        boxShadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  profileContent: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
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
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
  switchButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#D32F2F',
    ...Platform.select({
      ios: {
        shadowColor: '#D32F2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(211, 47, 47, 0.3)',
      },
    }),
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


