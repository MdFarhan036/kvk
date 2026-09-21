import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header/Header';

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <Header />

      <SafeAreaView edges={['bottom']} style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Categories</Text>

          <Text style={styles.subtitle}>
            Explore agricultural products
          </Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            Categories coming next
          </Text>

          <Text style={styles.emptyText}>
            Product categories will be connected to the KVK
            backend in the next step.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
  },

  headerSection: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222222',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#666666',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#666666',
    textAlign: 'center',
  },
});