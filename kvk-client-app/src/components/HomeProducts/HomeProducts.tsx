import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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

type Brand = {
  id?: number | string;
  name?: string;
};

type Product = {
  id: number | string;
  title?: string;
  name?: string;
  price?: number | string;
  discount_price?: number | string;
  oldPrice?: number | string;
  old_price?: number | string;
  original_price?: number | string;
  stock?: number | string;
  image?: string | null;
  images?: string[];
  brand?: Brand | string | null;
  brand_name?: string;
  rating?: number | string;
  category_name?: string;
  category?: {
    name?: string;
  };
};

type PopularCategory = {
  id?: number | string;
  name?: string;
  category_name?: string;
  products?: Product[];
};

function getImageUrl(image?: string | null) {
  if (!image) return '';

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${ASSET_BASE_URL}${
    image.startsWith('/') ? '' : '/'
  }${image}`;
}

function getProductImage(product: Product) {
  if (product.images?.length) {
    return getImageUrl(product.images[0]);
  }

  return getImageUrl(product.image);
}

function getProductTitle(product: Product) {
  return product.title || product.name || 'Product';
}

function getProductPrice(product: Product) {
  const value =
    product.discount_price ??
    product.price ??
    0;

  const price = Number(value);

  return Number.isFinite(price) ? price : 0;
}

function getOldPrice(product: Product) {
  const value =
    product.oldPrice ??
    product.old_price ??
    product.original_price;

  if (value === undefined || value === null || value === '') {
    return null;
  }

  const price = Number(value);

  return Number.isFinite(price) && price > getProductPrice(product)
    ? price
    : null;
}

function getDiscountPercent(product: Product) {
  const oldPrice = getOldPrice(product);
  const currentPrice = getProductPrice(product);

  if (!oldPrice || !currentPrice || oldPrice <= currentPrice) {
    return 0;
  }

  return Math.round(
    ((oldPrice - currentPrice) / oldPrice) * 100
  );
}

function getBrandName(product: Product) {
  if (!product.brand) {
    return product.brand_name || '';
  }

  if (typeof product.brand === 'string') {
    return product.brand;
  }

  return product.brand.name || product.brand_name || '';
}

function getCategoryName(product: Product) {
  return (
    product.category_name ||
    product.category?.name ||
    ''
  );
}

function isOutOfStock(product: Product) {
  if (
    product.stock === undefined ||
    product.stock === null ||
    product.stock === ''
  ) {
    return false;
  }

  return Number(product.stock) <= 0;
}

export default function HomeProducts() {
  const router = useRouter();

  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } =
    useWishlist();

  const [popularCategories, setPopularCategories] = useState<
    PopularCategory[]
  >([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await api.get(
          '/products/popular/by-category'
        );

        console.log(
          'KVK POPULAR PRODUCTS:',
          data
        );

        const categories = Array.isArray(data)
          ? data
          : [];

        setPopularCategories(categories);

        if (categories.length > 0) {
          setActiveTab(0);
        }
      } catch (err) {
        console.error(
          'Popular products fetch error:',
          err
        );

        setPopularCategories([]);
        setError(
          'Unable to load popular products.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  const activeCategory =
    popularCategories[activeTab];

  const products = useMemo(() => {
    if (!activeCategory) {
      return [];
    }

    return Array.isArray(activeCategory.products)
      ? activeCategory.products
      : [];
  }, [activeCategory]);

  const isInWishlist = (productId: number | string) => {
    return wishlistItems.some(
      (item) =>
        String(item.id ?? item.productId) ===
        String(productId)
    );
  };

  const handleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      return;
    }

    await addToWishlist({
      id: product.id,
      productId: product.id,
      title: getProductTitle(product),
      name: product.name,
      price: getProductPrice(product),
      image: getProductImage(product),
      images: product.images,
    });
  };

  const handleAddToCart = async (product: Product) => {
    if (isOutOfStock(product)) {
      return;
    }

    await addToCart({
      id: product.id,
      productId: product.id,
      title: getProductTitle(product),
      name: product.name,
      price: getProductPrice(product),
      quantity: 1,
      image: getProductImage(product),
      images: product.images,
    });
  };

  const handleProductPress = (product: Product) => {
    const category =
      getCategoryName(product) ||
      activeCategory?.name ||
      activeCategory?.category_name;

    if (category) {
      router.push(
        `/products-categories/${encodeURIComponent(
          category
        )}/${product.id}` as any
      );
      return;
    }

    router.push(
      `/product/${product.id}` as any
    );
  };

  const renderStars = (ratingValue?: number | string) => {
    const rating = Number(ratingValue ?? 3);
    const safeRating = Number.isFinite(rating)
      ? Math.max(0, Math.min(5, rating))
      : 3;

    return (
      <View style={styles.ratingRow}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Ionicons
            key={index}
            name={
              index < Math.round(safeRating)
                ? 'star'
                : 'star-outline'
            }
            size={13}
            color="#F4B400"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>
            TRENDING NOW
          </Text>
          <Text style={styles.sectionTitle}>
            Popular Products
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push('/featured-category' as any)
          }
        >
          <Text style={styles.viewAll}>
            View All
          </Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color="#2E7D32"
          />
          <Text style={styles.loadingText}>
            Loading popular products...
          </Text>
        </View>
      )}

      {!loading && error !== '' && (
        <View style={styles.messageBox}>
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color="#777777"
          />

          <Text style={styles.messageTitle}>
            Something went wrong
          </Text>

          <Text style={styles.messageText}>
            {error}
          </Text>
        </View>
      )}

      {!loading &&
        error === '' &&
        popularCategories.length === 0 && (
          <View style={styles.messageBox}>
            <Ionicons
              name="cube-outline"
              size={30}
              color="#777777"
            />

            <Text style={styles.messageTitle}>
              No popular products
            </Text>

            <Text style={styles.messageText}>
              Popular products will appear here.
            </Text>
          </View>
        )}

      {!loading &&
        error === '' &&
        popularCategories.length > 0 && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
            >
              {popularCategories.map(
                (category, index) => {
                  const categoryName =
                    category.name ||
                    category.category_name ||
                    `Category ${index + 1}`;

                  const active =
                    index === activeTab;

                  return (
                    <Pressable
                      key={
                        category.id ??
                        `${categoryName}-${index}`
                      }
                      style={[
                        styles.tab,
                        active &&
                          styles.activeTab,
                      ]}
                      onPress={() =>
                        setActiveTab(index)
                      }
                    >
                      <Text
                        style={[
                          styles.tabText,
                          active &&
                            styles.activeTabText,
                        ]}
                        numberOfLines={1}
                      >
                        {categoryName}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </ScrollView>

            {products.length === 0 ? (
              <View style={styles.emptyProducts}>
                <Text style={styles.emptyProductsText}>
                  No products available in this category.
                </Text>
              </View>
            ) : (
              <View style={styles.productGrid}>
                {products.map((product) => {
                  const image =
                    getProductImage(product);

                  const title =
                    getProductTitle(product);

                  const price =
                    getProductPrice(product);

                  const oldPrice =
                    getOldPrice(product);

                  const discount =
                    getDiscountPercent(product);

                  const brand =
                    getBrandName(product);

                  const category =
                    getCategoryName(product);

                  const outOfStock =
                    isOutOfStock(product);

                  const wished =
                    isInWishlist(product.id);

                  return (
                    <View
                      key={product.id}
                      style={styles.productCard}
                    >
                      <Pressable
                        onPress={() =>
                          handleProductPress(
                            product
                          )
                        }
                        style={styles.imageContainer}
                      >
                        {image ? (
                          <Image
                            source={{
                              uri: image,
                            }}
                            style={styles.productImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={
                              styles.imagePlaceholder
                            }
                          >
                            <Ionicons
                              name="image-outline"
                              size={34}
                              color="#AAAAAA"
                            />
                          </View>
                        )}

                        {discount > 0 && (
                          <View
                            style={
                              styles.discountBadge
                            }
                          >
                            <Text
                              style={
                                styles.discountText
                              }
                            >
                              {discount}% OFF
                            </Text>
                          </View>
                        )}

                        <Pressable
                          style={[
                            styles.wishlistButton,
                            wished &&
                              styles.wishlistButtonActive,
                          ]}
                          onPress={() =>
                            handleWishlist(
                              product
                            )
                          }
                        >
                          <Ionicons
                            name={
                              wished
                                ? 'heart'
                                : 'heart-outline'
                            }
                            size={19}
                            color={
                              wished
                                ? '#D32F2F'
                                : '#555555'
                            }
                          />
                        </Pressable>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          handleProductPress(
                            product
                          )
                        }
                      >
                        <View
                          style={
                            styles.productMeta
                          }
                        >
                          {category ? (
                            <Text
                              style={
                                styles.categoryText
                              }
                              numberOfLines={1}
                            >
                              {category}
                            </Text>
                          ) : null}

                          {brand ? (
                            <Text
                              style={
                                styles.brandText
                              }
                              numberOfLines={1}
                            >
                              {brand}
                            </Text>
                          ) : null}

                          <Text
                            style={
                              styles.productTitle
                            }
                            numberOfLines={2}
                          >
                            {title}
                          </Text>

                          {outOfStock ? (
                            <Text
                              style={
                                styles.outOfStock
                              }
                            >
                              Out of stock
                            </Text>
                          ) : (
                            <Text
                              style={
                                styles.stockText
                              }
                            >
                              In stock
                            </Text>
                          )}

                          {renderStars(
                            product.rating
                          )}

                          <View
                            style={
                              styles.priceRow
                            }
                          >
                            <Text
                              style={
                                styles.currentPrice
                              }
                            >
                              ₹
                              {price.toLocaleString(
                                'en-IN'
                              )}
                            </Text>

                            {oldPrice !== null && (
                              <Text
                                style={
                                  styles.oldPrice
                                }
                              >
                                ₹
                                {oldPrice.toLocaleString(
                                  'en-IN'
                                )}
                              </Text>
                            )}
                          </View>
                        </View>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.cartButton,
                          outOfStock &&
                            styles.cartButtonDisabled,
                        ]}
                        disabled={outOfStock}
                        onPress={() =>
                          handleAddToCart(
                            product
                          )
                        }
                      >
                        <Ionicons
                          name="cart-outline"
                          size={17}
                          color={
                            outOfStock
                              ? '#999999'
                              : '#FFFFFF'
                          }
                        />

                        <Text
                          style={[
                            styles.cartButtonText,
                            outOfStock &&
                              styles.cartButtonTextDisabled,
                          ]}
                        >
                          {outOfStock
                            ? 'Out of Stock'
                            : 'Add to Cart'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#2E7D32',
  },

  sectionTitle: {
    marginTop: 3,
    fontSize: 21,
    fontWeight: '700',
    color: '#222222',
  },

  viewAll: {
    marginBottom: 2,
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },

  loadingContainer: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#777777',
  },

  messageBox: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },

  messageTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  messageText: {
    marginTop: 5,
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
  },

  tabsContent: {
    paddingBottom: 14,
    gap: 8,
  },

  tab: {
    minWidth: 90,
    height: 36,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  activeTab: {
    borderColor: '#2E7D32',
    backgroundColor: '#2E7D32',
  },

  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productCard: {
    width: '48%',
    marginBottom: 18,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  imageContainer: {
    height: 170,
    position: 'relative',
    backgroundColor: '#F8F8F8',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },

  discountBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#D32F2F',
  },

  discountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  wishlistButtonActive: {
    backgroundColor: '#FFF5F5',
  },

  productMeta: {
    paddingHorizontal: 11,
    paddingTop: 10,
  },

  categoryText: {
    fontSize: 10,
    color: '#777777',
  },

  brandText: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },

  productTitle: {
    marginTop: 5,
    minHeight: 38,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: '#222222',
  },

  stockText: {
    marginTop: 5,
    fontSize: 10,
    color: '#388E3C',
  },

  outOfStock: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: '600',
    color: '#D32F2F',
  },

  ratingRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },

  priceRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  currentPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222222',
  },

  oldPrice: {
    fontSize: 11,
    color: '#999999',
    textDecorationLine: 'line-through',
  },

  cartButton: {
    height: 38,
    marginHorizontal: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 7,
    backgroundColor: '#2E7D32',
  },

  cartButtonDisabled: {
    backgroundColor: '#EEEEEE',
  },

  cartButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cartButtonTextDisabled: {
    color: '#999999',
  },

  emptyProducts: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },

  emptyProductsText: {
    fontSize: 13,
    color: '#777777',
  },
});
