import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { api, type Category } from '@/lib/api';

const CATEGORY_COLORS = ['#50C878', '#f5821f', '#50C878', '#f5821f', '#50C878', '#f5821f'];

export default function AllCategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hide tab bar when component mounts
  useEffect(() => {
    setIsVisible(false);
    return () => {
      setIsVisible(true);
    };
  }, [setIsVisible]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getCategories(true);
        setCategories(data);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to load categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Back Button */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          All Categories
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#50C878" />
            <ThemedText style={styles.loadingText}>Loading categories...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#d0d0d0" />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
              Error loading categories
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {error}
            </ThemedText>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="grid-outline" size={64} color="#d0d0d0" />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
              No categories found
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Check back later for new categories.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { borderLeftColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  // TODO: Navigate to category products page
                  console.log(`Category ${category.categoryName} pressed`);
                }}
              >
                <View style={styles.categoryContent}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}20` },
                    ]}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={32}
                      color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.categoryName}>
                    {category.categoryName}
                  </ThemedText>
                  <ThemedText style={styles.categoryCount}>
                    {category.productCount || 0} {(category.productCount || 0) === 1 ? 'product' : 'products'}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryContent: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#000',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
});

