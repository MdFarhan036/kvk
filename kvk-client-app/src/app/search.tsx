import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    const query = search.trim();

    if (!query) {
      return;
    }

    // Product search API will be connected here.
    console.log('Search:', query);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Search Products</Text>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            placeholderTextColor="#888888"
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoFocus
          />

          {search.length > 0 && (
            <Pressable
              style={styles.clearButton}
              onPress={() => setSearch('')}
            >
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          )}
        </View>

        {/* Search Button */}
        <Pressable
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>
            Search
          </Text>
        </Pressable>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            Find KVK Products
          </Text>

          <Text style={styles.emptyText}>
            Search for seeds, nutrients, insecticides,
            herbicides, fungicides, machinery and other
            agricultural products.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 40,
  },

  headerTitle: {
    marginLeft: 4,
    fontSize: 21,
    fontWeight: '700',
    color: '#222222',
  },

  searchBox: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
  },

  searchIcon: {
    fontSize: 24,
    marginRight: 8,
    color: '#555555',
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#222222',
  },

  clearButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearText: {
    fontSize: 25,
    color: '#777777',
  },

  searchButton: {
    height: 50,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#666666',
    textAlign: 'center',
  },
});