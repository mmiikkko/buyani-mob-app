import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const DATA = [
  { id: '1', title: 'Order SO-1045 ready', body: 'Courier pickup scheduled for 3 PM.' },
  { id: '2', title: 'Stock alert', body: 'Dried pineapple only has 5 packs left.' },
  { id: '3', title: 'Payout released', body: '₱2,450 was sent to your bank account.' },
];

export default function SellerNotificationsScreen() {
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
            <ThemedText style={styles.body}>{item.body}</ThemedText>
          </View>
        )}
        ListHeaderComponent={
          <ThemedText type="title" style={styles.header}>
            Notifications
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  list: {
    padding: 20,
    gap: 16,
  },
  header: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 6,
  },
  body: {
    color: '#555',
  },
});


