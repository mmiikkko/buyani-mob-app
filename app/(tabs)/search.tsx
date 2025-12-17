import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api, type Product } from '@/lib/api';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await api.getProducts();
        setProducts(data);
      } catch (err: any) {
        console.error('Search load error:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return products.filter((p) =>
      (p.productName || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.shopName || '').toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <ThemedView style={styles.wrapper}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7d7d7d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search local treats and shops..."
            placeholderTextColor="#7d7d7d"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color="#7d7d7d" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
      >
        {searchQuery.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <ThemedText style={styles.emptyStateText}>
              Start typing to search for products and shops
            </ThemedText>
          </View>
        ) : loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="small" color="#50C878" />
            <ThemedText style={styles.emptyStateText}>Searching...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
            <ThemedText style={styles.emptyStateText}>{error}</ThemedText>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.resultsContainer}>
            <ThemedText style={styles.resultsText}>
              Search results for "{searchQuery}"
            </ThemedText>
            <ThemedText style={styles.noResultsText}>
              No results found. Try a different search term.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <ThemedText style={styles.resultsText}>
              {filtered.length} result{filtered.length === 1 ? '' : 's'} for "{searchQuery}"
            </ThemedText>
            {filtered.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.resultRow}
                onPress={() => router.push(`/(tabs)/product/${item.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.resultIcon}>
                  <Ionicons name="cube-outline" size={20} color="#50C878" />
                </View>
                <View style={styles.resultInfo}>
                  <ThemedText style={styles.resultName} numberOfLines={1}>
                    {item.productName}
                  </ThemedText>
                  <ThemedText style={styles.resultMeta} numberOfLines={1}>
                    {item.shopName} • ₱{Number(item.price).toFixed(2)}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0f7f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    color: '#111827',
    fontWeight: '600',
  },
  resultMeta: {
    color: '#6B7280',
    fontSize: 13,
  },
  resultsContainer: {
    paddingTop: 20,
  },
  resultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

