import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SplashScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
    router.replace('/role-select');
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        BUYANI
      </ThemedText>
      <ThemedText style={styles.subtitle}>Connecting communities</ThemedText>
      <ActivityIndicator size="large" style={styles.loader} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    letterSpacing: 2,
  },
  subtitle: {
    opacity: 0.8,
  },
  loader: {
    marginTop: 16,
  },
});


