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
        tabBarActiveTintColor: '#2E7D32',
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
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <IconSymbol
              size={focused ? 28 : 26}
              name={focused ? 'house.fill' : 'house'}
              color={focused ? '#2E7D32' : 'rgba(0, 0, 0, 0.6)'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="all-products"
        options={{
          title: 'All Products',
          tabBarIcon: ({ focused }) => (
            <IconSymbol
              size={focused ? 28 : 26}
              name={focused ? 'square.grid.2x2.fill' : 'square.grid.2x2'}
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
            <IconSymbol
              size={focused ? 28 : 26}
              name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'}
              color={focused ? '#2E7D32' : 'rgba(0, 0, 0, 0.6)'}
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
        name="all-vendors"
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
