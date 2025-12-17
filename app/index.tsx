import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { api } from '@/lib/api';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Fade in animation
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });

    // Check if user is already logged in
    const checkAuthAndNavigate = async () => {
      try {
        const token = await api.getToken();
        
        // If no token, go to login
        if (!token || token === 'demo-token-offline-mode') {
          // Fade out and navigate to login
          containerOpacity.value = withTiming(0, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          });
          
          setTimeout(() => {
            router.replace('/login');
          }, 500);
          return;
        }

        // If token exists, verify it's valid and get user info
        try {
          // If token is valid and user can be fetched, always send them to
          // the customer home tabs first, even if they are a seller.
          await api.getCurrentUser();

          // Fade out and navigate to customer home
          containerOpacity.value = withTiming(0, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          });

          setTimeout(() => {
            router.replace('/(tabs)' as any);
          }, 500);
        } catch (error: any) {
          // Token is invalid, clear it and go to login
          console.log('Token invalid, redirecting to login:', error.message);
          await api.clearToken();
          
          containerOpacity.value = withTiming(0, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          });
          
          setTimeout(() => {
            router.replace('/login');
          }, 500);
        }
      } catch (error) {
        // Error checking auth, go to login
        console.error('Error checking auth:', error);
        containerOpacity.value = withTiming(0, {
          duration: 500,
          easing: Easing.inOut(Easing.ease),
        });
        
        setTimeout(() => {
          router.replace('/login');
        }, 500);
      }
    };

    // Wait a bit for splash screen, then check auth
    const fadeOutTimeout = setTimeout(() => {
      checkAuthAndNavigate();
    }, 1800);

    return () => {
      clearTimeout(fadeOutTimeout);
    };
  }, [router]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <LinearGradient
        colors={['#81C784', '#AED581', '#C5E1A5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.content, animatedStyle]}>
        <Image 
          source={require('@/assets/images/nobglogo.png')} 
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText type="title" style={styles.title}>
          BUYANI
        </ThemedText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 290,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    letterSpacing: 4,
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
        elevation: 4,
      },
      web: {
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
});


