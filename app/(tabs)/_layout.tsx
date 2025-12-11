import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TabBarProvider, useTabBar } from '@/contexts/tab-bar-context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function TabLayoutContent() {
  const colorScheme = useColorScheme();
  const { isVisible } = useTabBar();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isVisible]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#50C878',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 32 : 12,
          paddingTop: 12,
          marginBottom: 0,
          marginHorizontal: 0,
          borderRadius: 0,
          position: 'absolute',
          opacity: isVisible ? 1 : 0,
          transform: [{ translateY: isVisible ? 0 : 100 }],
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
            web: {
              boxShadow: '0px -2px 8px 0px rgba(0, 0, 0, 0.1)',
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
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <IconSymbol
              size={focused ? 26 : 24}
              name={focused ? 'house.fill' : 'house'}
              color={focused ? '#50C878' : '#9CA3AF'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="all-products"
        options={{
          title: 'Products',
          tabBarIcon: ({ focused }) => (
            <IconSymbol
              size={focused ? 26 : 24}
              name={focused ? 'square.grid.2x2.fill' : 'square.grid.2x2'}
              color={focused ? '#50C878' : '#9CA3AF'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="all-vendors"
        options={{
          title: 'Shops',
          tabBarIcon: ({ focused }) => (
            <IconSymbol
              size={focused ? 26 : 24}
              name={focused ? 'storefront.fill' : 'storefront'}
              color={focused ? '#50C878' : '#9CA3AF'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => (
            <IconSymbol
              size={focused ? 26 : 24}
              name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'}
              color={focused ? '#50C878' : '#9CA3AF'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="privacy-security"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="become-seller"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="shop-application-status"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="address"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="all-best-sellers"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="all-categories"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <TabBarProvider>
      <TabLayoutContent />
    </TabBarProvider>
  );
}
