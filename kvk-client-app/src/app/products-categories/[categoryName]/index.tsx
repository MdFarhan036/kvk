import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import api, {
  ASSET_BASE_URL,
} from '@/api/axios';

import {
  useCart,
} from '@/context/CartContext';

import {
  useWishlist,
} from '@/context/WishlistContext';

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

  brand?:
    | string
    | {
        name?: string;
        brand_name?: string;
      }
    | null;

  brand_name?: string;

  rating?: number | string;

  category_name?: string;

  category?: {
    name?: string;
  };

  createdAt?: string;
  created_at?: string;
};

type SortOption =
  | ''
  | 'PriceLowToHigh'
  | 'PriceHighToLow'
  | 'AvgRating'
  | 'Release';

const getImageUrl = (
  image?: string | null
) => {
  if (!image) {
    return '';
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${ASSET_BASE_URL}${
    image.startsWith('/') ? '' : '/'
  }${image}`;
};

const getProductImage = (
  product: Product
) => {
  if (
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    return getImageUrl(
      product.images[0]
    );
  }

  return getImageUrl(product.image);
};

const getProductTitle = (
  product: Product
) => {
  return (
    product.title ||
    product.name ||
    'Product'
  );
};

const getProductPrice = (
  product: Product
) => {
  const value =
    product.discount_price ??
    product.price ??
    0;

  const price = Number(value);

  return Number.isFinite(price)
    ? price
    : 0;
};

const getProductOldPrice = (
  product: Product
) => {
  const value =
    product.oldPrice ??
    product.old_price ??
    product.original_price;

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  const oldPrice = Number(value);

  return Number.isFinite(oldPrice)
    ? oldPrice
    : null;
};

const getBrandName = (
  product: Product
) => {
  if (!product.brand) {
    return product.brand_name || '';
  }

  if (
    typeof product.brand === 'string'
  ) {
    return product.brand;
  }

  return (
    product.brand.name ||
    product.brand.brand_name ||
    product.brand_name ||
    ''
  );
};

const getCategoryName = (
  product: Product
) => {
  return (
    product.category_name ||
    product.category?.name ||
    ''
  );
};

const isOutOfStock = (
  product: Product
) => {
  if (
    product.stock === undefined ||
    product.stock === null ||
    product.stock === ''
  ) {
    return false;
  }

  return Number(product.stock) <= 0;
};

const getDiscountPercent = (
  product: Product
) => {
  const oldPrice =
    getProductOldPrice(product);

  const currentPrice =
    getProductPrice(product);

  if (
    !oldPrice ||
    !currentPrice ||
    oldPrice <= currentPrice
  ) {
    return 0;
  }

  return Math.round(
    ((oldPrice - currentPrice) /
      oldPrice) *
      100
  );
};

export default function CategoryProductsScreen() {
  const router = useRouter();

  const {
    categoryName,
  } = useLocalSearchParams<{
    categoryName?: string;
  }>();

  const {
    addToCart,
  } = useCart();

  const {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [brands, setBrands] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [
    filterVisible,
    setFilterVisible,
  ] = useState(false);

  const [
    selectedBrands,
    setSelectedBrands,
  ] = useState<string[]>([]);

  const [
    selectedStock,
    setSelectedStock,
  ] = useState<
    '' | 'in' | 'out'
  >('');

  const [
    minPrice,
    setMinPrice,
  ] = useState(0);

  const [
    maxPrice,
    setMaxPrice,
  ] = useState(1000000);

  const [
    sortOption,
    setSortOption,
  ] = useState<SortOption>('');

  // =====================================================
  // CATEGORY NAME
  // =====================================================

  const displayCategoryName =
    categoryName
      ? categoryName
          .charAt(0)
          .toUpperCase() +
        categoryName.slice(1)
      : 'Products';

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  useEffect(() => {
    let mounted = true;

   const fetchProducts =
  async () => {
    try {
      setLoading(true);
      setError('');

      const { data } =
        await api.get('/products');

      if (!mounted) {
        return;
      }

      const productList =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : [];

      setProducts(productList);

    } catch (err) {
      console.error(
        'Category products fetch error:',
        err
      );

      if (mounted) {
        setProducts([]);
        setError(
          'Unable to load products.'
        );
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // FETCH BRANDS
  // =====================================================

  useEffect(() => {
    if (!categoryName) {
      setBrands([]);
      return;
    }

    let mounted = true;

    const fetchBrands =
      async () => {
        try {
          const encodedCategory =
            encodeURIComponent(
              categoryName
            );

          const { data } =
            await api.get(
              `/brands/category/${encodedCategory}`
            );

          if (!mounted) {
            return;
          }

          let brandData = data;

          if (
            brandData &&
            !Array.isArray(
              brandData
            ) &&
            Array.isArray(
              brandData.brands
            )
          ) {
            brandData =
              brandData.brands;
          }

          if (
            !Array.isArray(
              brandData
            )
          ) {
            setBrands([]);
            return;
          }

          const normalizedBrands =
            brandData
              .map(
                (
                  brand: any
                ) => {
                  if (
                    typeof brand ===
                    'string'
                  ) {
                    return brand;
                  }

                  return (
                    brand?.name ||
                    brand?.brand_name ||
                    ''
                  );
                }
              )
              .filter(Boolean);

          setBrands(
            Array.from(
              new Set(
                normalizedBrands
              )
            )
          );
        } catch (err) {
          console.error(
            'Brands fetch error:',
            err
          );

          if (mounted) {
            setBrands([]);
          }
        }
      };

    fetchBrands();

    return () => {
      mounted = false;
    };
  }, [categoryName]);

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredProducts =
    useMemo(() => {
      if (!products.length) {
        return [];
      }

      const normalizedCategory =
        (
          categoryName || ''
        )
          .toLowerCase()
          .trim();

      let result =
        products.filter(
          (product) => {
            const productCategory =
              getCategoryName(
                product
              )
                .toLowerCase()
                .trim();

            return (
              productCategory ===
              normalizedCategory
            );
          }
        );

      // -------------------------------------------------
      // PRICE
      // -------------------------------------------------

      result =
        result.filter(
          (product) => {
            const price =
              getProductPrice(
                product
              );

            return (
              price >= minPrice &&
              price <= maxPrice
            );
          }
        );

      // -------------------------------------------------
      // BRAND
      // -------------------------------------------------

      if (
        selectedBrands.length >
        0
      ) {
        result =
          result.filter(
            (product) =>
              selectedBrands.includes(
                getBrandName(
                  product
                )
              )
          );
      }

      // -------------------------------------------------
      // STOCK
      // -------------------------------------------------

      if (
        selectedStock ===
        'in'
      ) {
        result =
          result.filter(
            (product) =>
              Number(
                product.stock
              ) > 0
          );
      }

      if (
        selectedStock ===
        'out'
      ) {
        result =
          result.filter(
            (product) =>
              Number(
                product.stock
              ) === 0
          );
      }

      // -------------------------------------------------
      // SORT
      // -------------------------------------------------

      if (
        sortOption ===
        'PriceLowToHigh'
      ) {
        result.sort(
          (a, b) =>
            getProductPrice(
              a
            ) -
            getProductPrice(
              b
            )
        );
      }

      if (
        sortOption ===
        'PriceHighToLow'
      ) {
        result.sort(
          (a, b) =>
            getProductPrice(
              b
            ) -
            getProductPrice(
              a
            )
        );
      }

      if (
        sortOption ===
        'AvgRating'
      ) {
        result.sort(
          (a, b) =>
            Number(
              b.rating || 0
            ) -
            Number(
              a.rating || 0
            )
        );
      }

      if (
        sortOption ===
        'Release'
      ) {
        result.sort(
          (a, b) =>
            new Date(
              b.createdAt ||
                b.created_at ||
                0
            ).getTime() -
            new Date(
              a.createdAt ||
                a.created_at ||
                0
            ).getTime()
        );
      }

      return result;
    }, [
      products,
      categoryName,
      minPrice,
      maxPrice,
      selectedBrands,
      selectedStock,
      sortOption,
    ]);

  // =====================================================
  // STOCK COUNTS
  // =====================================================

  const categoryProducts =
    useMemo(() => {
      const normalized =
        (
          categoryName || ''
        )
          .toLowerCase()
          .trim();

      return products.filter(
        (product) =>
          getCategoryName(
            product
          )
            .toLowerCase()
            .trim() ===
          normalized
      );
    }, [
      products,
      categoryName,
    ]);

  const inStockCount =
    categoryProducts.filter(
      (product) =>
        Number(
          product.stock
        ) > 0
    ).length;

  const outStockCount =
    categoryProducts.filter(
      (product) =>
        Number(
          product.stock
        ) === 0
    ).length;

  // =====================================================
  // WISHLIST
  // =====================================================

  const isInWishlist = (
    productId:
      | number
      | string
  ) => {
    return wishlistItems.some(
      (item) =>
        String(
          item.id ??
            item.productId
        ) ===
        String(productId)
    );
  };

  const handleWishlist = async (
    product: Product
  ) => {
    try {
      if (
        isInWishlist(
          product.id
        )
      ) {
        await removeFromWishlist(
          product.id
        );

        return;
      }

      await addToWishlist({
        id: product.id,
        productId:
          product.id,
        title:
          getProductTitle(
            product
          ),
        name: product.name,
        price:
          getProductPrice(
            product
          ),
        image:
          getProductImage(
            product
          ),
        images:
          product.images,
      });
    } catch (err) {
      console.error(
        'Wishlist error:',
        err
      );
    }
  };

  // =====================================================
  // CART
  // =====================================================

  const handleAddToCart = async (
    product: Product
  ) => {
    if (
      isOutOfStock(
        product
      )
    ) {
      return;
    }

    try {
      await addToCart({
        id: product.id,
        productId:
          product.id,
        title:
          getProductTitle(
            product
          ),
        name: product.name,
        price:
          getProductPrice(
            product
          ),
        quantity: 1,
        image:
          getProductImage(
            product
          ),
        images:
          product.images,
      });

      Alert.alert(
        'Added to Cart',
        `${getProductTitle(
          product
        )} has been added to your cart.`
      );
    } catch (err) {
      console.error(
        'Add to cart error:',
        err
      );
    }
  };

// =====================================================
// PRODUCT PRESS
// =====================================================

const handleProductPress = (
  product: Product
) => {
  if (!categoryName || !product?.id) {
    return;
  }

  router.push({
    pathname:
      '/products-categories/[categoryName]/[productId]',
    params: {
      categoryName: String(categoryName),
      productId: String(product.id),
    },
  });
};
  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedStock('');
    setMinPrice(0);
    setMaxPrice(1000000);
    setSortOption('');
  };

  // =====================================================
  // RATING
  // =====================================================

  const renderStars = (
    ratingValue?:
      | number
      | string
  ) => {
    const rating =
      Number(
        ratingValue ?? 0
      );

    return (
      <View
        style={
          styles.ratingRow
        }
      >
        {Array.from({
          length: 5,
        }).map(
          (_, index) => (
            <Ionicons
              key={index}
              name={
                index <
                Math.round(
                  rating
                )
                  ? 'star'
                  : 'star-outline'
              }
              size={13}
              color="#F4B400"
            />
          )
        )}
      </View>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="large"
            color="#2E7D32"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading products...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={styles.header}
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={
            styles.headerButton
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#222222"
          />
        </Pressable>

        <View
          style={
            styles.headerTitleContainer
          }
        >
          <Text
            style={
              styles.headerTitle
            }
            numberOfLines={1}
          >
            {displayCategoryName}
          </Text>

          <Text
            style={
              styles.headerCount
            }
          >
            {filteredProducts.length}{' '}
            products
          </Text>
        </View>

        <Pressable
          onPress={() =>
            setFilterVisible(
              true
            )
          }
          style={
            styles.headerButton
          }
        >
          <Ionicons
            name="options-outline"
            size={24}
            color="#222222"
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <View
          style={
            styles.breadcrumb
          }
        >
          <Text
            style={
              styles.breadcrumbHome
            }
          >
            Home
          </Text>

          <Ionicons
            name="chevron-forward"
            size={13}
            color="#999999"
          />

          <Text
            style={
              styles.breadcrumbCurrent
            }
          >
            {displayCategoryName}
          </Text>
        </View>

        {/* =================================================
            SORT BAR
        ================================================= */}

        <View
          style={styles.toolbar}
        >
          <Pressable
            style={
              styles.toolbarButton
            }
            onPress={() =>
              setFilterVisible(
                true
              )
            }
          >
            <Ionicons
              name="filter-outline"
              size={17}
              color="#333333"
            />

            <Text
              style={
                styles.toolbarButtonText
              }
            >
              Filters
            </Text>
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.sortRow
            }
          >
            {[
              {
                label:
                  'Default',
                value:
                  '',
              },
              {
                label:
                  'Price ↑',
                value:
                  'PriceLowToHigh',
              },
              {
                label:
                  'Price ↓',
                value:
                  'PriceHighToLow',
              },
              {
                label:
                  'Rating',
                value:
                  'AvgRating',
              },
              {
                label:
                  'Latest',
                value:
                  'Release',
              },
            ].map(
              (option) => {
                const active =
                  sortOption ===
                  option.value;

                return (
                  <Pressable
                    key={
                      option.value ||
                      'default'
                    }
                    onPress={() =>
                      setSortOption(
                        option.value as SortOption
                      )
                    }
                    style={[
                      styles.sortChip,
                      active &&
                        styles.sortChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortChipText,
                        active &&
                          styles.sortChipTextActive,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>
                  </Pressable>
                );
              }
            )}
          </ScrollView>
        </View>

        {/* =================================================
            ERROR
        ================================================= */}

        {error ? (
          <View
            style={
              styles.messageBox
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={35}
              color="#777777"
            />

            <Text
              style={
                styles.messageTitle
              }
            >
              Something went wrong
            </Text>

            <Text
              style={
                styles.messageText
              }
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error &&
        filteredProducts.length ===
          0 ? (
          <View
            style={
              styles.messageBox
            }
          >
            <Ionicons
              name="cube-outline"
              size={40}
              color="#888888"
            />

            <Text
              style={
                styles.messageTitle
              }
            >
              No products found
            </Text>

            <Text
              style={
                styles.messageText
              }
            >
              Try changing your filters.
            </Text>

            <Pressable
              onPress={
                clearFilters
              }
              style={
                styles.clearButton
              }
            >
              <Text
                style={
                  styles.clearButtonText
                }
              >
                Clear Filters
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* =================================================
            PRODUCT GRID
        ================================================= */}

        {!error &&
        filteredProducts.length >
          0 ? (
          <View
            style={
              styles.productGrid
            }
          >
            {filteredProducts.map(
              (product) => {
                const image =
                  getProductImage(
                    product
                  );

                const title =
                  getProductTitle(
                    product
                  );

                const price =
                  getProductPrice(
                    product
                  );

                const oldPrice =
                  getProductOldPrice(
                    product
                  );

                const discount =
                  getDiscountPercent(
                    product
                  );

                const brand =
                  getBrandName(
                    product
                  );

                const outOfStock =
                  isOutOfStock(
                    product
                  );

                const wished =
                  isInWishlist(
                    product.id
                  );

                return (
                  <View
                    key={
                      product.id
                    }
                    style={
                      styles.productCard
                    }
                  >
                    {/* IMAGE */}

                    <Pressable
                      onPress={() =>
                        handleProductPress(
                          product
                        )
                      }
                      style={
                        styles.imageContainer
                      }
                    >
                      {image ? (
                        <Image
                          source={{
                            uri: image,
                          }}
                          style={
                            styles.productImage
                          }
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
                            size={35}
                            color="#AAAAAA"
                          />
                        </View>
                      )}

                      {discount >
                        0 ? (
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
                            {discount}%
                            OFF
                          </Text>
                        </View>
                      ) : null}

                      <Pressable
                        onPress={() =>
                          handleWishlist(
                            product
                          )
                        }
                        style={
                          styles.wishlistButton
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

                    {/* INFO */}

                    <Pressable
                      onPress={() =>
                        handleProductPress(
                          product
                        )
                      }
                    >
                      <View
                        style={
                          styles.productInfo
                        }
                      >
                        {brand ? (
                          <Text
                            style={
                              styles.brand
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {brand}
                          </Text>
                        ) : null}

                        <Text
                          style={
                            styles.productTitle
                          }
                          numberOfLines={
                            2
                          }
                        >
                          {title}
                        </Text>

                        {outOfStock ? (
                          <Text
                            style={
                              styles.outOfStock
                            }
                          >
                            Out of Stock
                          </Text>
                        ) : (
                          <Text
                            style={
                              styles.inStock
                            }
                          >
                            In Stock
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

                          {oldPrice !==
                            null &&
                          oldPrice >
                            price ? (
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
                          ) : null}
                        </View>
                      </View>
                    </Pressable>

                    {/* CART */}

                    <Pressable
                      disabled={
                        outOfStock
                      }
                      onPress={() =>
                        handleAddToCart(
                          product
                        )
                      }
                      style={[
                        styles.cartButton,
                        outOfStock &&
                          styles.cartButtonDisabled,
                      ]}
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
              }
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* =================================================
          FILTER MODAL
      ================================================= */}

      <Modal
        visible={
          filterVisible
        }
        animationType="slide"
        transparent
        onRequestClose={() =>
          setFilterVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.filterModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                Filter Products
              </Text>

              <Pressable
                onPress={() =>
                  setFilterVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#222222"
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              {/* PRICE */}

              <Text
                style={
                  styles.filterTitle
                }
              >
                Price Range
              </Text>

              <View
                style={
                  styles.priceFilterRow
                }
              >
                <Pressable
                  onPress={() =>
                    setMinPrice(
                      minPrice ===
                        0
                        ? 500
                        : 0
                    )
                  }
                  style={[
                    styles.priceOption,
                    minPrice >
                      0 &&
                      styles.priceOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.priceOptionText,
                      minPrice >
                        0 &&
                        styles.priceOptionTextActive,
                    ]}
                  >
                    {minPrice >
                    0
                      ? `₹${minPrice}+`
                      : 'Any Price'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    setMaxPrice(
                      maxPrice ===
                        1000000
                        ? 5000
                        : 1000000
                    )
                  }
                  style={[
                    styles.priceOption,
                    maxPrice <
                      1000000 &&
                      styles.priceOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.priceOptionText,
                      maxPrice <
                        1000000 &&
                        styles.priceOptionTextActive,
                    ]}
                  >
                    {maxPrice <
                    1000000
                      ? `Up to ₹${maxPrice}`
                      : 'Any Maximum'}
                  </Text>
                </Pressable>
              </View>

              {/* BRAND */}

              <Text
                style={
                  styles.filterTitle
                }
              >
                Brand
              </Text>

              {brands.length ===
              0 ? (
                <Text
                  style={
                    styles.noFilterData
                  }
                >
                  No brands available
                </Text>
              ) : (
                brands.map(
                  (brand) => {
                    const selected =
                      selectedBrands.includes(
                        brand
                      );

                    return (
                      <Pressable
                        key={
                          brand
                        }
                        onPress={() => {
                          setSelectedBrands(
                            (previous) =>
                              selected
                                ? previous.filter(
                                    (
                                      item
                                    ) =>
                                      item !==
                                      brand
                                  )
                                : [
                                    ...previous,
                                    brand,
                                  ]
                          );
                        }}
                        style={
                          styles.filterRow
                        }
                      >
                        <Ionicons
                          name={
                            selected
                              ? 'checkbox'
                              : 'square-outline'
                          }
                          size={21}
                          color={
                            selected
                              ? '#2E7D32'
                              : '#777777'
                          }
                        />

                        <Text
                          style={
                            styles.filterLabel
                          }
                        >
                          {brand}
                        </Text>
                      </Pressable>
                    );
                  }
                )
              )}

              {/* STOCK */}

              <Text
                style={
                  styles.filterTitle
                }
              >
                Stock
              </Text>

              {[
                {
                  label: `In Stock (${inStockCount})`,
                  value: 'in',
                },
                {
                  label: `Out of Stock (${outStockCount})`,
                  value: 'out',
                },
                {
                  label: 'All',
                  value: '',
                },
              ].map(
                (option) => (
                  <Pressable
                    key={
                      option.value ||
                      'all'
                    }
                    onPress={() =>
                      setSelectedStock(
                        option.value as
                          | ''
                          | 'in'
                          | 'out'
                      )
                    }
                    style={
                      styles.filterRow
                    }
                  >
                    <Ionicons
                      name={
                        selectedStock ===
                        option.value
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      size={21}
                      color={
                        selectedStock ===
                        option.value
                          ? '#2E7D32'
                          : '#777777'
                      }
                    />

                    <Text
                      style={
                        styles.filterLabel
                      }
                    >
                      {
                        option.label
                      }
                    </Text>
                  </Pressable>
                )
              )}

              {/* SORT */}

              <Text
                style={
                  styles.filterTitle
                }
              >
                Sort By
              </Text>

              {[
                {
                  label:
                    'Default',
                  value:
                    '',
                },
                {
                  label:
                    'Price: Low to High',
                  value:
                    'PriceLowToHigh',
                },
                {
                  label:
                    'Price: High to Low',
                  value:
                    'PriceHighToLow',
                },
                {
                  label:
                    'Average Rating',
                  value:
                    'AvgRating',
                },
                {
                  label:
                    'Newest First',
                  value:
                    'Release',
                },
              ].map(
                (option) => (
                  <Pressable
                    key={
                      option.value ||
                      'default-sort'
                    }
                    onPress={() =>
                      setSortOption(
                        option.value as SortOption
                      )
                    }
                    style={
                      styles.filterRow
                    }
                  >
                    <Ionicons
                      name={
                        sortOption ===
                        option.value
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      size={21}
                      color={
                        sortOption ===
                        option.value
                          ? '#2E7D32'
                          : '#777777'
                      }
                    />

                    <Text
                      style={
                        styles.filterLabel
                      }
                    >
                      {
                        option.label
                      }
                    </Text>
                  </Pressable>
                )
              )}
            </ScrollView>

            <View
              style={
                styles.modalActions
              }
            >
              <Pressable
                onPress={
                  clearFilters
                }
                style={
                  styles.clearFilterButton
                }
              >
                <Text
                  style={
                    styles.clearFilterText
                  }
                >
                  Clear All
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setFilterVisible(
                    false
                  )
                }
                style={
                  styles.applyButton
                }
              >
                <Text
                  style={
                    styles.applyButtonText
                  }
                >
                  Apply Filters
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#777777',
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    maxWidth: '80%',
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },

  headerCount: {
    marginTop: 2,
    fontSize: 11,
    color: '#888888',
  },

  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },

  breadcrumbHome: {
    fontSize: 12,
    color: '#2E7D32',
  },

  breadcrumbCurrent: {
    fontSize: 12,
    color: '#777777',
  },

  toolbar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  toolbarButton: {
    height: 35,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  toolbarButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },

  sortRow: {
    paddingHorizontal: 8,
    gap: 7,
  },

  sortChip: {
    height: 35,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 18,
  },

  sortChipActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#2E7D32',
  },

  sortChipText: {
    fontSize: 11,
    color: '#555555',
  },

  sortChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 14,
  },

  productCard: {
    width: '48%',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  imageContainer: {
    height: 170,
    position: 'relative',
    backgroundColor: '#F7F7F7',
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

  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
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
  },

  productInfo: {
    padding: 10,
  },

  brand: {
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

  inStock: {
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
    marginHorizontal: 9,
    marginBottom: 9,
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
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cartButtonTextDisabled: {
    color: '#999999',
  },

  messageBox: {
    margin: 16,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },

  messageTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  messageText: {
    marginTop: 6,
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
  },

  clearButton: {
    marginTop: 15,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 7,
    backgroundColor: '#2E7D32',
  },

  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  filterModal: {
    maxHeight: '88%',
    paddingBottom: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  modalHeader: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222222',
  },

  filterTitle: {
    marginTop: 20,
    marginBottom: 9,
    paddingHorizontal: 18,
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  priceFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 10,
  },

  priceOption: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
  },

  priceOptionActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },

  priceOptionText: {
    fontSize: 12,
    color: '#555555',
  },

  priceOptionTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },

  filterRow: {
    minHeight: 44,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#444444',
  },

  noFilterData: {
    paddingHorizontal: 18,
    fontSize: 13,
    color: '#999999',
  },

  modalActions: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  clearFilterButton: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
  },

  clearFilterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },

  applyButton: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },

  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
