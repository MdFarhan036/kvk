import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import api from '@/api/axios';

import { DailyDealsCard } from './DailyDealsCard';

type Category = {
  id: number | string;
  name?: string;
  category_name?: string;
};

type DailyDealProduct = {
  id: number | string;
  title?: string;
  name?: string;
  category_id?: number | string;
  category_name?: string;
  brand?: string;
  daily_deal_price?: number | string;
  price?: number | string;
  stock?: number | string;
  [key: string]: any;
};

const getCategoryName = (category: Category) => {
  return (
    category.name ||
    category.category_name ||
    ''
  );
};

export const DailyDeals = () => {
  const router = useRouter();

  const [ddproducts, setDdProducts] =
    useState<DailyDealProduct[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [activeCategory, setActiveCategory] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState('');

  const [priceSort, setPriceSort] =
    useState('');

  const [toast, setToast] =
    useState<string | null>(null);

  // =========================================================
  // TOAST
  // =========================================================

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // =========================================================
  // FETCH DAILY DEALS + CATEGORIES
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          dealsResponse,
          categoriesResponse,
        ] = await Promise.all([
          api.get('/products/deals/daily'),
          api.get('/categories'),
        ]);

        if (!mounted) return;

      const deals =
  Array.isArray(dealsResponse.data)
    ? dealsResponse.data
    : Array.isArray(dealsResponse.data?.value)
      ? dealsResponse.data.value
      : [];

const cats =
  Array.isArray(categoriesResponse.data)
    ? categoriesResponse.data
    : Array.isArray(categoriesResponse.data?.value)
      ? categoriesResponse.data.value
      : [];
        setDdProducts(deals);
        setCategories(cats);

        // First category is active by default
        if (cats.length > 0) {
          setActiveCategory((previous) => {
            return (
              previous ||
              String(cats[0].id)
            );
          });
        }
      } catch (err: any) {
        console.error(
          'Error fetching daily deals:',
          err?.response?.data ||
            err?.message ||
            err
        );

        if (mounted) {
          setError(
            "We couldn't load today's deals. Please try again shortly."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // FILTER + SEARCH + SORT
  // =========================================================

  const filteredProducts = useMemo(() => {
    return [...ddproducts]
      .filter((product) => {
        if (activeCategory === '') {
          return true;
        }

        return (
          String(product.category_id) ===
          String(activeCategory)
        );
      })
      .filter((product) => {
        const query =
          search.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return (
          product.title
            ?.toLowerCase()
            .includes(query) ||
          product.name
            ?.toLowerCase()
            .includes(query) ||
          product.brand
            ?.toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => {
        const priceA = Number(
          a.daily_deal_price ??
            a.price ??
            0
        );

        const priceB = Number(
          b.daily_deal_price ??
            b.price ??
            0
        );

        if (priceSort === 'low') {
          return priceA - priceB;
        }

        if (priceSort === 'high') {
          return priceB - priceA;
        }

        return 0;
      });
  }, [
    ddproducts,
    activeCategory,
    search,
    priceSort,
  ]);

  // =========================================================
  // SKELETON
  // =========================================================

  const renderSkeleton = () => {
    return (
      <View style={styles.skeletonRow}>
        {Array.from({ length: 3 }).map(
          (_, index) => (
            <View
              key={index}
              style={styles.skeletonCard}
            >
              <View
                style={styles.skeletonImage}
              />

              <View
                style={styles.skeletonLine}
              />

              <View
                style={[
                  styles.skeletonLine,
                  styles.skeletonShort,
                ]}
              />

              <View
                style={[
                  styles.skeletonLine,
                  styles.skeletonButton,
                ]}
              />
            </View>
          )
        )}
      </View>
    );
  };

  // =========================================================
  // ERROR
  // =========================================================

  if (!loading && error) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              Today only
            </Text>

            <Text style={styles.title}>
              Daily deals
            </Text>
          </View>
        </View>

        <View style={styles.emptyState}>
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color="#D32F2F"
          />

          <Text style={styles.emptyTitle}>
            Something went wrong
          </Text>

          <Text style={styles.emptyText}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            Today only
          </Text>

          <Text style={styles.title}>
            Daily deals
          </Text>

          <Text style={styles.subtitle}>
            Fresh discounts, refreshed every day.
          </Text>
        </View>

        <Pressable
          style={styles.viewAllButton}
          onPress={() =>
            router.push('/daily-deals')
          }
        >
          <Text style={styles.viewAllText}>
            View all
          </Text>

          <Ionicons
            name="chevron-forward"
            size={15}
            color="#2E7D32"
          />
        </Pressable>
      </View>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={19}
          color="#777777"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search deals..."
          placeholderTextColor="#999999"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch('')}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color="#999999"
            />
          </Pressable>
        )}
      </View>

      {/* =====================================================
          CATEGORY FILTER
      ===================================================== */}

      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.categoryScroll
          }
        >
          {categories.map((category) => {
            const categoryName =
              getCategoryName(category);

            const isActive =
              activeCategory ===
              String(category.id);

            return (
              <Pressable
                key={category.id}
                onPress={() =>
                  setActiveCategory(
                    String(category.id)
                  )
                }
                style={[
                  styles.categoryButton,
                  isActive &&
                    styles.categoryButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive &&
                      styles.categoryTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {categoryName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* =====================================================
          SORT
      ===================================================== */}

      <View style={styles.sortRow}>
        <Text style={styles.resultText}>
          {loading
            ? 'Loading deals...'
            : `${filteredProducts.length} deals`}
        </Text>

        <View style={styles.sortButtons}>

          <Pressable
            style={[
              styles.sortButton,
              priceSort === 'low' &&
                styles.sortButtonActive,
            ]}
            onPress={() =>
              setPriceSort(
                priceSort === 'low'
                  ? ''
                  : 'low'
              )
            }
          >
            <Ionicons
              name="arrow-down-outline"
              size={14}
              color={
                priceSort === 'low'
                  ? '#FFFFFF'
                  : '#555555'
              }
            />

            <Text
              style={[
                styles.sortButtonText,
                priceSort === 'low' &&
                  styles.sortButtonTextActive,
              ]}
            >
              Low
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.sortButton,
              priceSort === 'high' &&
                styles.sortButtonActive,
            ]}
            onPress={() =>
              setPriceSort(
                priceSort === 'high'
                  ? ''
                  : 'high'
              )
            }
          >
            <Ionicons
              name="arrow-up-outline"
              size={14}
              color={
                priceSort === 'high'
                  ? '#FFFFFF'
                  : '#555555'
              }
            />

            <Text
              style={[
                styles.sortButtonText,
                priceSort === 'high' &&
                  styles.sortButtonTextActive,
              ]}
            >
              High
            </Text>
          </Pressable>

        </View>
      </View>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      {loading ? (
        renderSkeleton()
      ) : filteredProducts.length > 0 ? (
        <FlatList
          horizontal
          data={filteredProducts}
          keyExtractor={(item) =>
            String(item.id)
          }
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.productsList
          }
          renderItem={({ item }) => (
            <DailyDealsCard
              ddproduct={item}
              onToast={showToast}
            />
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="pricetag-outline"
            size={36}
            color="#999999"
          />

          <Text style={styles.emptyTitle}>
            No deals match your filters
          </Text>

          <Text style={styles.emptyText}>
            Try a different category or clear
            your search.
          </Text>

          {(search || priceSort) && (
            <Pressable
              style={styles.clearButton}
              onPress={() => {
                setSearch('');
                setPriceSort('');
              }}
            >
              <Text
                style={styles.clearButtonText}
              >
                Clear filters
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <View style={styles.toast}>
          <Ionicons
            name="checkmark-circle"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.toastText}>
            {toast}
          </Text>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    marginBottom: 20,
  },

  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  headerText: {
    flex: 1,
    paddingRight: 10,
  },

  eyebrow: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  title: {
    color: '#1F1F1F',
    fontSize: 24,
    fontWeight: '800',
  },

  subtitle: {
    color: '#777777',
    fontSize: 12,
    marginTop: 4,
  },

  viewAllButton: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 8,
  },

  viewAllText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '700',
  },

  searchContainer: {
    height: 44,
    marginHorizontal: 16,
    marginTop: 15,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#222222',
    fontSize: 13,
    paddingVertical: 0,
  },

  categoryScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },

  categoryButton: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F2F4F2',
    marginRight: 8,
  },

  categoryButtonActive: {
    backgroundColor: '#2E7D32',
  },

  categoryText: {
    color: '#555555',
    fontSize: 12,
    fontWeight: '600',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  sortRow: {
    marginTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultText: {
    color: '#777777',
    fontSize: 12,
  },

  sortButtons: {
    flexDirection: 'row',
    gap: 6,
  },

  sortButton: {
    minWidth: 57,
    height: 30,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  sortButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },

  sortButtonText: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '600',
  },

  sortButtonTextActive: {
    color: '#FFFFFF',
  },

  productsList: {
    paddingLeft: 16,
    paddingRight: 4,
    paddingTop: 14,
  },

  skeletonRow: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingTop: 14,
  },

  skeletonCard: {
    width: 210,
    height: 330,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginRight: 12,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },

  skeletonImage: {
    height: 170,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
  },

  skeletonLine: {
    height: 13,
    width: '90%',
    borderRadius: 5,
    backgroundColor: '#EEEEEE',
    marginTop: 15,
  },

  skeletonShort: {
    width: '60%',
    marginTop: 8,
  },

  skeletonButton: {
    width: '100%',
    height: 38,
    marginTop: 20,
  },

  emptyState: {
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F8F9F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },

  emptyText: {
    color: '#777777',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 18,
  },

  clearButton: {
    marginTop: 14,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },

  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },

  toastText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
});