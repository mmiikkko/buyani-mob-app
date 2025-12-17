import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, LayoutAnimation, Platform, UIManager, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TabBarProvider, useTabBar } from '@/contexts/tab-bar-context';
import { api } from '@/lib/api';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function SellerTabLayoutContent() {
  const colorScheme = useColorScheme();
  const { isVisible } = useTabBar();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isVisible]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: 'rgba(0, 0, 0, 0.6)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'rgba(232, 248, 232, 0.75)',
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          height: Platform.OS === 'ios' ? 80 : 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 14,
          paddingTop: 12,
          marginBottom: Platform.OS === 'ios' ? 30 : 20,
          marginHorizontal: 16,
          borderRadius: 24,
          position: 'absolute',
          opacity: isVisible ? 1 : 0,
          transform: [{ translateY: isVisible ? 0 : 100 }],
          ...Platform.select({
            ios: {
              shadowColor: '#50C878',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
            },
            android: {
              elevation: 12,
            },
            web: {
              boxShadow: '0px 4px 16px 0px rgba(80, 200, 120, 0.3)',
            },
          }),
          // @ts-ignore - pointerEvents should be in style for web compatibility
          pointerEvents: isVisible ? 'auto' : 'none',
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              size={focused ? 28 : 26}
              color={focused ? '#2E7D32' : 'rgba(0, 0, 0, 0.6)'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={focused ? 28 : 26}
              color={focused ? '#2E7D32' : 'rgba(0, 0, 0, 0.6)'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'mail' : 'mail-outline'}
              size={focused ? 28 : 26}
              color={focused ? '#2E7D32' : 'rgba(0, 0, 0, 0.6)'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={focused ? 28 : 26}
              color={focused ? '#2E7D32' : 'rgba(0, 0, 0, 0.6)'}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function SellerAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await api.getToken();

        // No token -> force login as seller
        if (!token || token === 'demo-token-offline-mode') {
          setCheckingAuth(false);
          router.replace('/login?role=seller' as any);
          return;
        }

        try {
          const user = await api.getCurrentUser();

          // Only users with an approved shop (or explicit SELLER role)
          // are allowed into the seller area. Everyone else goes to
          // the customer home UI.
          const shopStatus = user?.shop?.status;
          const isSeller =
            (typeof user.role === 'string' && user.role.toLowerCase() === 'seller') ||
            shopStatus === 'approved';

          if (!isSeller) {
            router.replace('/(tabs)' as any);
            return;
          }

          setCheckingAuth(false);
        } catch (error: any) {
          // Invalid or expired token - clear and go to seller login
          console.log('Seller auth token invalid, redirecting to login:', error?.message);
          await api.clearToken();
          setCheckingAuth(false);
          router.replace('/login?role=seller' as any);
        }
      } catch (error) {
        console.error('Error checking seller auth:', error);
        setCheckingAuth(false);
        router.replace('/login?role=seller' as any);
      }
    };

    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function SellerTabLayout() {
  return (
    <TabBarProvider>
      <SellerAuthGate>
        <SellerTabLayoutContent />
      </SellerAuthGate>
    </TabBarProvider>
  );
}


