import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import api, { ASSET_BASE_URL } from '@/api/axios';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCustomerAuth } from '@/context/CustomerContext';
type Category = {
  id: number | string;
  name?: string;
  category_name?: string;
  image?: string;
};

type Product = {
  id: number | string;
  title?: string;
  name?: string;
  category_id?: number | string;
  category_name?: string;
  brand?: string;
  price?: number | string;
  discount_price?: number | string;
  oldPrice?: number | string;
  old_price?: number | string;
  orgprice?: number | string;
  stock?: number | string;
  images?: string[];
  image?: string;
  pimage?: string;
  rating?: number | string;
  average_rating?: number | string;
  [key: string]: any;
};

const getImageUrl = (url?: string | null) => {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${ASSET_BASE_URL}${
    url.startsWith('/') ? '' : '/'
  }${url}`;
};

const getCategoryName = (category: Category) => {
  return (
    category.name ||
    category.category_name ||
    ''
  );
};

const getProductImage = (product: Product) => {
  if (
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    return getImageUrl(product.images[0]);
  }

  if (product.image) {
    return getImageUrl(product.image);
  }

  if (product.pimage) {
    return getImageUrl(product.pimage);
  }

  return '';
};

export const AllCategories = () => {
  const router = useRouter();

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
const { customer } = useCustomerAuth();
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [productsByCategory, setProductsByCategory] =
    useState<Record<string, Product[]>>({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [toast, setToast] =
    useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          categoriesResponse,
          productsResponse,
        ] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
        ]);

        if (!mounted) {
          return;
        }

        /*
         * Backend can return either:
         *
         * [...]
         *
         * OR
         *
         * {
         *   value: [...],
         *   Count: ...
         * }
         */

        const categoryData =
          Array.isArray(categoriesResponse.data)
            ? categoriesResponse.data
            : Array.isArray(
                categoriesResponse.data?.value
              )
              ? categoriesResponse.data.value
              : [];

        const productData =
          Array.isArray(productsResponse.data)
            ? productsResponse.data
            : Array.isArray(
                productsResponse.data?.value
              )
              ? productsResponse.data.value
              : [];

        setCategories(categoryData);

        /*
         * GROUP PRODUCTS BY CATEGORY ID
         */

        const grouped: Record<
          string,
          Product[]
        > = {};

        productData.forEach(
          (product: Product) => {
            if (
              product.category_id ===
                undefined ||
              product.category_id === null
            ) {
              return;
            }

            const categoryId =
              String(product.category_id);

            if (!grouped[categoryId]) {
              grouped[categoryId] = [];
            }

            grouped[categoryId].push(product);
          }
        );

        setProductsByCategory(grouped);
      } catch (err: any) {
        console.error(
          'All Categories fetch error:',
          err?.response?.data ||
            err?.message ||
            err
        );

        if (mounted) {
          setError(
            'Unable to load categories and products.'
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

  const openCategory = (
    categoryName: string
  ) => {
    if (!categoryName) {
      return;
    }

    router.push({
      pathname:
        '/products-categories/[categoryName]',
      params: {
        categoryName,
      },
    });
  };

  const openProduct = (
    product: Product,
    categoryName: string
  ) => {
    if (!product?.id) {
      return;
    }

    router.push({
      pathname:
        '/products-categories/[categoryName]/[productId]',
      params: {
        categoryName,
        productId: String(product.id),
      },
    });
  };

  const handleAddToCart = (
    product: Product
  ) => {
    const stock = Number(
      product.stock ?? 0
    );

    if (stock <= 0) {
      return;
    }

    const productName =
      product.name ||
      product.title ||
      'Product';

    addToCart({
      ...product,
      quantity: 1,
    });

    showToast(
      `${productName} added to cart!`
    );
  };

  const handleAddToWishlist = (
    product: Product
  ) => {
    const productName =
      product.name ||
      product.title ||
      'Product';

    addToWishlist({
      ...product,
      quantity: 1,
    });

    showToast(
      `${productName} added to wishlist!`
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />

        <Text style={styles.loadingText}>
          Loading categories...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color="#D32F2F"
        />

        <Text style={styles.emptyTitle}>
          Something went wrong
        </Text>

        <Text style={styles.emptyText}>
          {error}
        </Text>
      </View>
    );
  }

  if (!categories.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="grid-outline"
          size={42}
          color="#999999"
        />

        <Text style={styles.emptyTitle}>
          No categories available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {categories.map((category) => {
          const categoryName =
            getCategoryName(category);

          const categoryProducts =
            productsByCategory[
              String(category.id)
            ] || [];

          return (
            <View
              key={String(category.id)}
              style={styles.categoryBlock}
            >
              {/* CATEGORY HEADER */}

              <View style={styles.categoryHeader}>
                <View style={styles.categoryTitleWrap}>
                  <Text
                    style={styles.categoryTitle}
                    numberOfLines={1}
                  >
                    {categoryName}
                  </Text>
                </View>

                <Pressable
                  style={styles.viewAllButton}
                  onPress={() =>
                    openCategory(categoryName)
                  }
                >
                  <Text
                    style={styles.viewAllText}
                  >
                    View All
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color="#2E7D32"
                  />
                </Pressable>
              </View>

              {/* CATEGORY PRODUCTS */}

              {categoryProducts.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.productsRow
                  }
                >
                  {categoryProducts.map(
                    (product) => {
                      const productName =
                        product.name ||
                        product.title ||
                        'Product';

                      const productImage =
                        getProductImage(product);

                      const sellingPrice =
                        Number(
                          product.discount_price ??
                            product.price ??
                            0
                        );

                      const originalPrice =
                        Number(
                          product.oldPrice ??
                            product.old_price ??
                            product.orgprice ??
                            product.price ??
                            0
                        );

                      const stock =
                        Number(
                          product.stock ?? 0
                        );

                      const inStock =
                        stock > 0;

                      return (
                        <View
                          key={String(
                            product.id
                          )}
                          style={styles.productCard}
                        >
                          {/* IMAGE */}

                          <Pressable
                            style={
                              styles.imageContainer
                            }
                            onPress={() =>
                              openProduct(
                                product,
                                categoryName
                              )
                            }
                          >
                            {productImage ? (
                              <Image
                                source={{
                                  uri: productImage,
                                }}
                                style={
                                  styles.productImage
                                }
                                resizeMode="contain"
                              />
                            ) : (
                              <View
                                style={
                                  styles.noImage
                                }
                              >
                                <Ionicons
                                  name="image-outline"
                                  size={34}
                                  color="#AAAAAA"
                                />

                                <Text
                                  style={
                                    styles.noImageText
                                  }
                                >
                                  No Image
                                </Text>
                              </View>
                            )}

                            {/* PREVIEW */}

                            <View
                              style={
                                styles.previewButton
                              }
                            >
                              <Ionicons
                                name="eye-outline"
                                size={18}
                                color="#333333"
                              />
                            </View>

                            {/* WISHLIST */}

                            <Pressable
                              style={
                                styles.wishlistButton
                              }
                              onPress={() =>
                                handleAddToWishlist(
                                  product
                                )
                              }
                            >
                              <Ionicons
                                name="heart-outline"
                                size={21}
                                color="#333333"
                              />
                            </Pressable>
                          </Pressable>

                          {/* DETAILS */}

                          <View
                            style={
                              styles.productContent
                            }
                          >
                            <Text
                              style={
                                styles.productCategory
                              }
                              numberOfLines={1}
                            >
                              {product.category_name ||
                                categoryName}
                            </Text>

                            <Pressable
                              onPress={() =>
                                openProduct(
                                  product,
                                  categoryName
                                )
                              }
                            >
                              <Text
                                style={
                                  styles.productName
                                }
                                numberOfLines={2}
                              >
                                {productName}
                              </Text>
                            </Pressable>

                            {product.brand ? (
                              <Text
                                style={
                                  styles.brand
                                }
                                numberOfLines={1}
                              >
                                {product.brand}
                              </Text>
                            ) : null}

                            {/* STOCK */}

                            <View
                              style={
                                styles.stockRow
                              }
                            >
                              <View
                                style={[
                                  styles.stockDot,
                                  !inStock &&
                                    styles.stockDotOut,
                                ]}
                              />

                              <Text
                                style={[
                                  styles.stockText,
                                  !inStock &&
                                    styles.stockTextOut,
                                ]}
                              >
                                {inStock
                                  ? `In Stock (${stock})`
                                  : 'Out of Stock'}
                              </Text>
                            </View>

                            {/* RATING */}

                            <View
                              style={
                                styles.ratingRow
                              }
                            >
                              {[1, 2, 3, 4, 5].map(
                                (star) => (
                                  <Ionicons
                                    key={star}
                                    name="star"
                                    size={14}
                                    color="#F5A623"
                                  />
                                )
                              )}
                            </View>

                            {/* PRICE */}

                            <View
                              style={
                                styles.priceRow
                              }
                            >
                              {originalPrice >
                                sellingPrice ? (
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
                                style={
                                  styles.sellingPrice
                                }
                              >
                                ₹
                                {sellingPrice.toLocaleString(
                                  'en-IN'
                                )}
                              </Text>
                            </View>

                            {/* CART */}

                            <Pressable
                              style={[
                                styles.cartButton,
                                !inStock &&
                                  styles.cartButtonDisabled,
                              ]}
                              disabled={!inStock}
                              onPress={() =>
                                handleAddToCart(
                                  product
                                )
                              }
                            >
                              <Ionicons
                                name="cart-outline"
                                size={17}
                                color="#FFFFFF"
                              />

                              <Text
                                style={
                                  styles.cartButtonText
                                }
                              >
                                {inStock
                                  ? 'Add to Cart'
                                  : 'Out of Stock'}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    }
                  )}
                </ScrollView>
              ) : (
                <View
                  style={
                    styles.noProductsContainer
                  }
                >
                  <Text
                    style={
                      styles.noProductsText
                    }
                  >
                    No products available
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* TOAST */}

      {toast ? (
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
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  center: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
  },

  categoryBlock: {
    marginTop: 24,
  },

  categoryHeader: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },

  categoryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F1F1F',
  },

  viewAllButton: {
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

  productsRow: {
    paddingLeft: 16,
    paddingRight: 4,
    paddingTop: 13,
  },

  productCard: {
    width: 210,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  imageContainer: {
    height: 175,
    backgroundColor: '#F8F9F8',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productImage: {
    width: '88%',
    height: '88%',
  },

  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  noImageText: {
    marginTop: 5,
    fontSize: 11,
    color: '#AAAAAA',
  },

  previewButton: {
    position: 'absolute',
    top: 10,
    right: 48,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  productContent: {
    padding: 12,
  },

  productCategory: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 5,
  },

  productName: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    minHeight: 40,
  },

  brand: {
    color: '#666666',
    fontSize: 12,
    marginTop: 5,
  },

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginRight: 6,
  },

  stockDotOut: {
    backgroundColor: '#D32F2F',
  },

  stockText: {
    color: '#4A4A4A',
    fontSize: 11,
  },

  stockTextOut: {
    color: '#D32F2F',
  },

  ratingRow: {
    flexDirection: 'row',
    marginTop: 7,
    gap: 2,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  originalPrice: {
    color: '#999999',
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginRight: 7,
  },

  sellingPrice: {
    color: '#1B5E20',
    fontSize: 17,
    fontWeight: '800',
  },

  cartButton: {
    height: 40,
    marginTop: 10,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  cartButtonDisabled: {
    backgroundColor: '#AAAAAA',
  },

  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  noProductsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  noProductsText: {
    color: '#999999',
    fontSize: 13,
  },

  emptyState: {
    margin: 16,
    padding: 30,
    borderRadius: 12,
    backgroundColor: '#F8F9F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 10,
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
  },

  emptyText: {
    marginTop: 6,
    color: '#777777',
    fontSize: 13,
    textAlign: 'center',
  },

  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 15,
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
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});