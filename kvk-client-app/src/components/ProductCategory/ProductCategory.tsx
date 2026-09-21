import { useRouter } from 'expo-router';

import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import api, { ASSET_BASE_URL } from '@/api/axios';

type Category = {
  id: number | string;
  name: string;
  image?: string | null;
};

export default function ProductCategory() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');

        console.log('KVK AXIOS SUCCESS:', data);
        console.log('KVK API BASE URL:', api.defaults.baseURL);

        const formattedCategories = (
          Array.isArray(data) ? data : []
        ).map((cat) => ({
          ...cat,
          image: cat.image
            ? /^https?:\/\//i.test(cat.image)
              ? cat.image
              : `${ASSET_BASE_URL}${
                  cat.image.startsWith('/') ? '' : '/'
                }${cat.image}`
            : '',
        }));

        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.error(
          'KVK API BASE URL:',
          api.defaults.baseURL
        );
        console.error('KVK API ERROR DETAILS:', {
          message:
            error instanceof Error
              ? error.message
              : error,
        });

        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryPress = (categoryName: string) => {
    router.push(
      `/products-categories/${encodeURIComponent(categoryName)}` as any
    );
  };

  return (
    <View style={styles.categorySection}>
      {/* Title */}
      <View style={styles.categoriesTitle}>
        <Text style={styles.categoriesEyebrow}>
          Fresh & Local
        </Text>

        <Text style={styles.title}>
          Shop by Category
        </Text>

        <View style={styles.line} />
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator
            size="small"
            color="#2E7D32"
          />
        </View>
      )}

      {/* Categories */}
      {!loading && categories.length > 0 && (
        <View style={styles.categoriesWrapper}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(cat.name)}
            >
              <View style={styles.categoryImage}>
                <View style={styles.categoryRing} />

                {cat.image ? (
                  <Image
                    source={{ uri: cat.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.categoryPlaceholder}>
                    <Text style={styles.placeholderText}>
                      No Image
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={styles.categoryName}
                numberOfLines={2}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Empty */}
      {!loading && categories.length === 0 && (
        <Text style={styles.noCategories}>
          No categories available
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  categorySection: {
    marginTop: 26,
  },

  categoriesTitle: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  categoriesEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#2E7D32',
  },

  title: {
    marginTop: 5,
    fontSize: 22,
    fontWeight: '700',
    color: '#222222',
  },

  line: {
    width: 45,
    height: 3,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: '#2E7D32',
  },

  loading: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoriesWrapper: {
    marginTop: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  categoryCard: {
    width: '23%',
    marginBottom: 20,
    alignItems: 'center',
  },

  categoryImage: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  categoryRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  categoryPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F1F1',
  },

  placeholderText: {
    fontSize: 8,
    color: '#777777',
    textAlign: 'center',
  },

  categoryName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: '#333333',
    textAlign: 'center',
  },

  noCategories: {
    marginTop: 30,
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },
});
