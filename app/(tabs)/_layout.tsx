import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TabBarProvider, useTabBar } from '@/contexts/tab-bar-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function TabLayoutContent() {
  const colorScheme = useColorScheme();
  const { isVisible } = useTabBar();
  const hiddenScreenOptions = {
    // Hide this route from the visible tab bar while keeping the screen usable
    href: null,
  } as const;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isVisible]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#50C878',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
            backgroundColor: '#FFFFFF',
            height: Platform.OS === 'ios' ? 80 : 68,
            paddingBottom: Platform.OS === 'ios' ? 22 : 12,
            paddingTop: 10,
            marginBottom: 18,
            marginHorizontal: 18,
            borderRadius: 26,
            borderTopWidth: 0,
            position: 'absolute',
            opacity: isVisible ? 1 : 0,
            transform: [{ translateY: isVisible ? 0 : 100 }],
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 18,
              },
              android: {
                elevation: 10,
              },
              web: {
                boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.25)',
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
          tabBarButton: HapticTab,
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
          tabBarButton: HapticTab,
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
          tabBarButton: HapticTab,
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
          tabBarButton: HapticTab,
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
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="checkout"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="search"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="edit-profile"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="support"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="privacy-security"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="become-seller"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="shop-application-status"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="orders"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="address"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="payments"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="settings"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="all-categories"
        options={hiddenScreenOptions}
      />
      <Tabs.Screen
        name="notifications"
        options={hiddenScreenOptions}
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
