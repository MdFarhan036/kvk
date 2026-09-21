import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import api, { ASSET_BASE_URL } from '@/api/axios';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';

type Category = {
  id?: number | string;
  name?: string;
  category_name?: string;
};

type Product = {
  id: number | string;
  title?: string;
  name?: string;

  brand?: string | { name?: string };

  category_name?: string;

  category?: {
    name?: string;
  };

  image?: string;

  images?: string[];

  price?: number | string;
  discount_price?: number | string;

  oldPrice?: number | string;
  old_price?: number | string;

  stock?: number | string;

  rating?: number | string;
};

const getImageUrl = (
  image?: string | null
) => {
  if (!image) return '';

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${ASSET_BASE_URL}${
    image.startsWith('/') ? '' : '/'
  }${image}`;
};

const getCategoryName = (
  category: Category
) => {
  return (
    category.name ||
    category.category_name ||
    ''
  );
};

const getProductCategory = (
  product: Product
) => {
  return (
    product.category_name ||
    product.category?.name ||
    ''
  );
};

export default function FeaturedCategoryScreen() {
  const router = useRouter();

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [activeCategory, setActiveCategory] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [addingProductId, setAddingProductId] =
    useState<number | string | null>(null);

  const [wishlistProductId, setWishlistProductId] =
    useState<number | string | null>(null);

  // =========================================================
  // FETCH POPULAR PRODUCTS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          api.get(
            '/products/popular/by-category'
          ),
          api.get('/categories'),
        ]);

        if (!mounted) return;

        const productData =
          productsResponse.data;

        let flattenedProducts: Product[] = [];

        const apiCategories: Category[] = [];

        /*
         * GROUPED RESPONSE
         */

        if (Array.isArray(productData)) {
          const groupedData =
            productData.some(
              (item) =>
                item &&
                Array.isArray(item.products)
            );

          if (groupedData) {
            productData.forEach(
              (group: any) => {
                const groupCategory =
                  group?.category ||
                  group?.category_name ||
                  group?.name ||
                  '';

                if (groupCategory) {
                  apiCategories.push({
                    name: groupCategory,
                  });
                }

                if (
                  Array.isArray(
                    group?.products
                  )
                ) {
                  flattenedProducts.push(
                    ...group.products.map(
                      (
                        product: Product
                      ) => ({
                        ...product,
                        category_name:
                          product.category_name ||
                          groupCategory,
                      })
                    )
                  );
                }
              }
            );
          } else {
            /*
             * PLAIN PRODUCT ARRAY
             */

            flattenedProducts =
              productData;
          }
        }

        /*
         * BACKEND CATEGORIES
         */

        const backendCategories =
          Array.isArray(
            categoriesResponse.data
          )
            ? categoriesResponse.data
            : [];

        /*
         * POPULAR API CATEGORIES
         * ARE PREFERRED WHEN AVAILABLE.
         */

        let finalCategories: Category[] =
          [];

        if (apiCategories.length > 0) {
          finalCategories =
            Array.from(
              new Map(
                apiCategories
                  .filter(
                    (item) =>
                      getCategoryName(item)
                  )
                  .map((item) => [
                    getCategoryName(
                      item
                    )
                      .toLowerCase()
                      .trim(),
                    item,
                  ])
              ).values()
            );
        } else {
          /*
           * DERIVE FROM PRODUCTS
           */

          finalCategories =
            Array.from(
              new Set(
                flattenedProducts
                  .map(
                    (product) =>
                      getProductCategory(
                        product
                      )
                  )
                  .filter(Boolean)
              )
            ).map((name) => ({
              name,
            }));
        }

        /*
         * If neither source produced
         * categories, fall back to
         * backend categories.
         */

        if (
          finalCategories.length === 0
        ) {
          finalCategories =
            backendCategories;
        }

        setProducts(
          flattenedProducts
        );

        setCategories(
          finalCategories
        );

        /*
         * FIRST CATEGORY ACTIVE
         */

        const firstCategory =
          finalCategories.length > 0
            ? getCategoryName(
                finalCategories[0]
              )
            : '';

        setActiveCategory(
          firstCategory
        );
      } catch (err) {
        console.error(
          'Failed to load popular products:',
          err
        );

        if (mounted) {
          setProducts([]);
          setCategories([]);
          setError(
            'Unable to load popular products.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    if (!activeCategory) {
      return products;
    }

    const selectedCategory =
      activeCategory
        .toLowerCase()
        .trim();

    return products.filter(
      (product) => {
        const category =
          getProductCategory(
            product
          );

        return (
          category
            .toLowerCase()
            .trim() ===
          selectedCategory
        );
      }
    );
  }, [
    products,
    activeCategory,
  ]);

  // =========================================================
  // PRODUCT NAVIGATION
  // =========================================================

  const handleProductPress = (
    product: Product
  ) => {
    const category =
      getProductCategory(
        product
      ) || activeCategory;

    if (!category) {
      return;
    }

router.push(
  `/featured-category/${encodeURIComponent(category)}/${product.id}` as any
);
  };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = async (
    product: Product
  ) => {
    try {
      setAddingProductId(
        product.id
      );

      const title =
        product.title ||
        product.name ||
        'Product';

      const price = Number(
        product.discount_price ??
          product.price ??
          0
      );

      const image =
        product.images?.[0] ||
        product.image ||
        '';

      await addToCart({
        id: product.id,
        productId: product.id,
        title,
        name: product.name,
        price,
        quantity: 1,
        image: getImageUrl(image),
        images: product.images,
      });
    } catch (error) {
      console.error(
        'Failed to add popular product to cart:',
        error
      );
    } finally {
      setAddingProductId(
        null
      );
    }
  };

  // =========================================================
  // WISHLIST
  // =========================================================

  const handleWishlist = async (
    product: Product
  ) => {
    try {
      setWishlistProductId(
        product.id
      );

      const title =
        product.title ||
        product.name ||
        'Product';

      const price = Number(
        product.discount_price ??
          product.price ??
          0
      );

      const image =
        product.images?.[0] ||
        product.image ||
        '';

      await addToWishlist({
        id: product.id,
        productId: product.id,
        title,
        name: product.name,
        price,
        quantity: 1,
        image: getImageUrl(image),
        images: product.images,
      });
    } catch (error) {
      console.error(
        'Failed to add popular product to wishlist:',
        error
      );
    } finally {
      setWishlistProductId(
        null
      );
    }
  };

  // =========================================================
  // PRODUCT CARD
  // =========================================================

  const renderProduct = ({
    item,
  }: {
    item: Product;
  }) => {
    const title =
      item.title ||
      item.name ||
      'Product';

    const price = Number(
      item.discount_price ??
        item.price ??
        0
    );

    const originalPrice = Number(
      item.oldPrice ??
        item.old_price ??
        0
    );

    const stock = Number(
      item.stock ?? 0
    );

    const rating = Number(
      item.rating ?? 0
    );

    const image =
      item.images?.[0] ||
      item.image ||
      '';

    const imageUrl =
      getImageUrl(image);

    const isAdding =
      addingProductId === item.id;

    const isWishlistLoading =
      wishlistProductId === item.id;

    return (
      <View style={styles.productCard}>

        {/* IMAGE */}

        <Pressable
          onPress={() =>
            handleProductPress(
              item
            )
          }
          style={styles.imageWrapper}
        >
          {imageUrl ? (
            <Image
              source={{
                uri: imageUrl,
              }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View
              style={
                styles.imagePlaceholder
              }
            >
              <Ionicons
                name="image-outline"
                size={42}
                color="#BDBDBD"
              />
            </View>
          )}

          {/* WISHLIST */}

          <Pressable
            onPress={() =>
              handleWishlist(
                item
              )
            }
            style={
              styles.wishlistButton
            }
          >
            {isWishlistLoading ? (
              <ActivityIndicator
                size="small"
                color="#2E7D32"
              />
            ) : (
              <Ionicons
                name="heart-outline"
                size={20}
                color="#2E7D32"
              />
            )}
          </Pressable>
        </Pressable>

        {/* DETAILS */}

        <Pressable
          onPress={() =>
            handleProductPress(
              item
            )
          }
        >
          <Text
            style={
              styles.productTitle
            }
            numberOfLines={2}
          >
            {title}
          </Text>

          {item.brand ? (
            <Text
              style={styles.brand}
              numberOfLines={1}
            >
              {typeof item.brand ===
              'object'
                ? item.brand.name
                : item.brand}
            </Text>
          ) : null}

          {/* RATING */}

          <View
            style={styles.ratingRow}
          >
            <Ionicons
              name="star"
              size={14}
              color="#F4B400"
            />

            <Text
              style={styles.rating}
            >
              {rating > 0
                ? rating.toFixed(1)
                : '4.5'}
            </Text>
          </View>

          {/* PRICE */}

          <View
            style={styles.priceRow}
          >
            {originalPrice > 0 ? (
              <Text
                style={
                  styles.originalPrice
                }
              >
                ₹
                {originalPrice.toLocaleString(
                  'en-IN'
                )}
              </Text>
            ) : null}

            <Text
              style={styles.price}
            >
              ₹
              {price.toLocaleString(
                'en-IN'
              )}
            </Text>
          </View>

          {/* STOCK */}

          <Text
            style={[
              styles.stock,
              {
                color:
                  stock > 0
                    ? '#2E7D32'
                    : '#D32F2F',
              },
            ]}
          >
            {stock > 0
              ? 'In Stock'
              : 'Out of Stock'}
          </Text>
        </Pressable>

        {/* CART */}

        <Pressable
          onPress={() =>
            handleAddToCart(
              item
            )
          }
          disabled={
            stock <= 0 ||
            isAdding
          }
          style={[
            styles.addButton,
            (stock <= 0 ||
              isAdding) &&
              styles.disabledButton,
          ]}
        >
          {isAdding ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="cart-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.addButtonText
                }
              >
                Add to Cart
              </Text>
            </>
          )}
        </Pressable>

      </View>
    );
  };

  // =========================================================
  // FOOTER
  // =========================================================

  const renderFooter = () => {
    return (
      <View style={styles.footerWrapper}>
        <Footer />
      </View>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <Header />

        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#2E7D32"
          />

          <Text
            style={styles.loadingText}
          >
            Loading popular products...
          </Text>
        </View>
      </View>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <Header />

        <View
          style={
            styles.errorContainer
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={50}
            color="#D32F2F"
          />

          <Text
            style={styles.errorTitle}
          >
            Something went wrong
          </Text>

          <Text
            style={styles.errorText}
          >
            {error}
          </Text>
        </View>

        <Footer />
      </View>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <View style={styles.container}>

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* =====================================================
          GLOBAL HEADER
      ===================================================== */}

      <Header />

      {/* =====================================================
          PRODUCT LIST
      ===================================================== */}

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) =>
          String(item.id)
        }
        numColumns={2}
        showsVerticalScrollIndicator={
          false
        }

        ListHeaderComponent={
          <>
            {/* PAGE TITLE */}

            <View
              style={
                styles.pageHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.eyebrow
                  }
                >
                  TRENDING NOW
                </Text>

                <Text
                  style={
                    styles.pageTitle
                  }
                >
                  Popular Products
                </Text>

                <Text
                  style={
                    styles.pageSubtitle
                  }
                >
                  Featured products from KVK
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  router.push(
                    '/cart'
                  )
                }
                style={
                  styles.cartIcon
                }
              >
                <Ionicons
                  name="cart-outline"
                  size={24}
                  color="#222222"
                />
              </Pressable>
            </View>

            {/* CATEGORY TABS */}

            {categories.length >
              0 && (
              <FlatList
                data={categories}
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={
                  false
                }
                keyExtractor={(
                  item,
                  index
                ) =>
                  String(
                    item.id ??
                      getCategoryName(
                        item
                      ) ??
                      index
                  )
                }
                contentContainerStyle={
                  styles.categoryList
                }
                renderItem={({
                  item,
                }) => {
                  const name =
                    getCategoryName(
                      item
                    );

                  const isActive =
                    name
                      .toLowerCase()
                      .trim() ===
                    activeCategory
                      .toLowerCase()
                      .trim();

                  return (
                    <Pressable
                      onPress={() =>
                        setActiveCategory(
                          name
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
                        {name}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            )}

            {/* RESULT HEADER */}

            <View
              style={
                styles.resultHeader
              }
            >
              <Text
                style={
                  styles.resultTitle
                }
              >
                {activeCategory ||
                  'Featured Products'}
              </Text>

              <Text
                style={
                  styles.resultCount
                }
              >
                {filteredProducts.length}{' '}
                {filteredProducts.length ===
                1
                  ? 'Product'
                  : 'Products'}
              </Text>
            </View>
          </>
        }

        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Ionicons
              name="cube-outline"
              size={55}
              color="#BDBDBD"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No popular products found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              There are currently no
              featured products in this
              category.
            </Text>
          </View>
        }

        ListFooterComponent={
          renderFooter
        }

        contentContainerStyle={
          styles.productList
        }

        columnWrapperStyle={
          filteredProducts.length >
          1
            ? styles.productRow
            : undefined
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F7',
  },

  pageHeader: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2E7D32',
  },

  pageTitle: {
    marginTop: 3,
    fontSize: 21,
    fontWeight: '800',
    color: '#222222',
  },

  pageSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#777777',
  },

  cartIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7F5',
  },

  categoryList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },

  categoryButton: {
    minHeight: 38,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  categoryButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },

  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  resultHeader: {
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#222222',
  },

  resultCount: {
    fontSize: 12,
    color: '#777777',
  },

  productList: {
    paddingHorizontal: 10,
    paddingBottom: 0,
  },

  productRow: {
    justifyContent: 'space-between',
  },

  productCard: {
    width: '48.5%',
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  imageWrapper: {
    height: 165,
    borderRadius: 9,
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  productTitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: '#222222',
  },

  brand: {
    marginTop: 4,
    fontSize: 12,
    color: '#777777',
  },

  ratingRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666666',
  },

  priceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  originalPrice: {
    marginRight: 6,
    fontSize: 12,
    color: '#999999',
    textDecorationLine:
      'line-through',
  },

  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
  },

  stock: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '600',
  },

  addButton: {
    minHeight: 40,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  disabledButton: {
    backgroundColor: '#AAAAAA',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#333333',
    textAlign: 'center',
  },

  errorText: {
    marginTop: 7,
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
  },

  emptyContainer: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '800',
    color: '#333333',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: '#777777',
    textAlign: 'center',
  },

  footerWrapper: {
    marginTop: 10,
    marginHorizontal: -10,
  },
});