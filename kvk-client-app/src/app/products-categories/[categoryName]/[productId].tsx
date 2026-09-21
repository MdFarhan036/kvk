import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import api, { ASSET_BASE_URL } from '@/api/axios';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerContext';
import { useWishlist } from '@/context/WishlistContext';

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import RenderHTML from 'react-native-render-html';

type Product = {
  id: number;
  title?: string;
  name?: string;

  brand?: string | {
    name?: string;
    brand_name?: string;
  };

  category_id?: number | string;

  category_name?: string;

  category?: {
    name?: string;
  };

  description?: string;
  subdescription?: string;

  price?: number | string;
  discount_price?: number | string;

  oldPrice?: number | string;
  old_price?: number | string;
  orgprice?: number | string;

  stock?: number | string;

  images?: string[];
  image?: string;

  rating?: number | string;
  average_rating?: number | string;
};

const getImageUrl = (url?: string) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${ASSET_BASE_URL}${
    url.startsWith('/') ? '' : '/'
  }${url}`;
};

const stripHtml = (html?: string) => {
  if (!html) {
    return '';
  }

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
};

export default function SingleProductPage() {
  const router = useRouter();

  const {
    categoryName,
    productId,
  } = useLocalSearchParams<{
    categoryName?: string;
    productId?: string;
  }>();

  const { width } = useWindowDimensions();

  // =====================================================
  // CONTEXTS
  // =====================================================

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { customer } = useCustomerAuth();

  // =====================================================
  // STATES
  // =====================================================

  const [product, setProduct] =
    useState<Product | null>(null);

  const [relatedProducts, setRelatedProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [activeImage, setActiveImage] =
    useState('');

  const [quantity, setQuantity] =
    useState(1);

  const [addingToCart, setAddingToCart] =
    useState(false);

  const [addingToWishlist, setAddingToWishlist] =
    useState(false);

  // =====================================================
  // FETCH RELATED PRODUCTS
  // =====================================================

  const fetchRelatedProducts = async (
    currentProduct: Product
  ) => {
    try {
      const { data } = await api.get('/products');

      const productList: Product[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : [];

      const currentCategoryId =
        currentProduct.category_id;

      const related = productList
        .filter((item) => {
          const differentProduct =
            String(item.id) !==
            String(currentProduct.id);

          const sameCategory =
            currentCategoryId !== undefined &&
            currentCategoryId !== null &&
            String(item.category_id) ===
              String(currentCategoryId);

          return (
            differentProduct &&
            sameCategory
          );
        })
        .slice(0, 6);

      setRelatedProducts(related);
    } catch (error: any) {
      console.error(
        '❌ Failed to fetch related products:',
        error?.response?.data ?? error
      );

      setRelatedProducts([]);
    }
  };

  // =====================================================
  // FETCH PRODUCT
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data } = await api.get(
          `/products/${encodeURIComponent(productId)}`
        );

        if (!mounted) {
          return;
        }

        setProduct(data);

        // Fetch related products
        fetchRelatedProducts(data);

        const firstImage =
          Array.isArray(data?.images) &&
          data.images.length > 0
            ? data.images[0]
            : data?.image;

        setActiveImage(
          getImageUrl(firstImage)
        );

        // Reset quantity when product changes
        setQuantity(1);
      } catch (error: any) {
        console.error(
          '❌ Single product fetch error:',
          error?.response?.data ?? error
        );

        if (mounted) {
          setProduct(null);
          setRelatedProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  // =====================================================
  // PRODUCT VALUES
  // =====================================================

  const productTitle =
    product?.title ||
    product?.name ||
    'Product';

  const productBrand = useMemo(() => {
    if (!product?.brand) {
      return '';
    }

    if (
      typeof product.brand === 'object'
    ) {
      return (
        product.brand.name ||
        product.brand.brand_name ||
        ''
      );
    }

    return product.brand;
  }, [product]);

  const productCategory =
    product?.category_name ||
    product?.category?.name ||
    categoryName ||
    '';

  const sellingPrice = Number(
    product?.discount_price ??
      product?.price ??
      0
  );

  const originalPrice =
    product?.oldPrice ??
    product?.old_price ??
    product?.orgprice ??
    '';

  const stock = Number(
    product?.stock ?? 0
  );

  const inStock =
    product?.stock === undefined ||
    product?.stock === null ||
    stock > 0;

  const discountPercent =
    Number(originalPrice) > sellingPrice
      ? Math.round(
          ((Number(originalPrice) -
            sellingPrice) /
            Number(originalPrice)) *
            100
        )
      : 0;

  const productImages = useMemo(() => {
    if (
      Array.isArray(product?.images)
    ) {
      return product.images
        .map(getImageUrl)
        .filter(Boolean);
    }

    if (product?.image) {
      const image = getImageUrl(
        product.image
      );

      return image ? [image] : [];
    }

    return [];
  }, [product]);

  const descriptionHtml =
    product?.description ||
    product?.subdescription ||
    '';

  // =====================================================
  // QUANTITY
  // =====================================================

  const increaseQuantity = () => {
    if (!inStock) {
      return;
    }

    if (
      stock > 0 &&
      quantity >= stock
    ) {
      return;
    }

    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) =>
      prev > 1 ? prev - 1 : 1
    );
  };

  // =====================================================
  // CART
  // =====================================================

  const handleAddToCart = async () => {
    if (
      !product ||
      !inStock ||
      addingToCart
    ) {
      return;
    }

    if (!customer) {
      Alert.alert(
        'Login Required',
        'Please login to add products to your cart.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () =>
              router.push('/login'),
          },
        ]
      );

      return;
    }

    try {
      setAddingToCart(true);

      await addToCart({
        ...product,

        id: product.id,

        productId: product.id,

        title: productTitle,

        price: sellingPrice,

        quantity,

        image:
          product.image ||
          product.images?.[0] ||
          '',
      });

      Alert.alert(
        'Added to Cart',
        `${productTitle} has been added to your cart.`
      );
    } catch (error: any) {
      console.error(
        'Add to cart error:',
        error?.response?.data ?? error
      );

      Alert.alert(
        'Cart Error',
        error?.response?.data?.message ||
          'Unable to add this product to your cart.'
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // =====================================================
  // WISHLIST
  // =====================================================

  const handleAddToWishlist = async () => {
    if (
      !product ||
      addingToWishlist
    ) {
      return;
    }

    if (!customer) {
      Alert.alert(
        'Login Required',
        'Please login to add products to your wishlist.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () =>
              router.push('/login'),
          },
        ]
      );

      return;
    }

    try {
      setAddingToWishlist(true);

      await addToWishlist({
        ...product,

        id: product.id,

        productId: product.id,

        title: productTitle,

        price: sellingPrice,

        quantity: 1,

        image:
          product.image ||
          product.images?.[0] ||
          '',
      });

      Alert.alert(
        'Wishlist',
        `${productTitle} has been added to your wishlist.`
      );
    } catch (error: any) {
      console.error(
        'Add to wishlist error:',
        error?.response?.data ?? error
      );

      Alert.alert(
        'Wishlist Error',
        error?.response?.data?.message ||
          'Unable to add this product to your wishlist.'
      );
    } finally {
      setAddingToWishlist(false);
    }
  };

  // =====================================================
  // RELATED PRODUCT CLICK
  // =====================================================

  const handleRelatedProductPress = (
    item: Product
  ) => {
    const relatedCategory =
      item.category_name ||
      item.category?.name ||
      productCategory ||
      '';

    router.push({
      pathname:
        '/products-categories/[categoryName]/[productId]',

      params: {
        categoryName:
          String(relatedCategory),

        productId:
          String(item.id),
      },
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#2E7D32"
          />

          <Text style={styles.loadingText}>
            Loading product details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View style={styles.center}>
          <Ionicons
            name="cube-outline"
            size={64}
            color="#999999"
          />

          <Text style={styles.notFoundTitle}>
            Product not found
          </Text>

          <Text style={styles.notFoundText}>
            This product may no longer be available.
          </Text>

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* =================================================
          TOP BAR
      ================================================= */}

      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.topBarButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#222222"
          />
        </Pressable>

        <Text
          style={styles.topBarTitle}
          numberOfLines={1}
        >
          Product Details
        </Text>

        <Pressable
          onPress={handleAddToWishlist}
          style={styles.topBarButton}
        >
          <Ionicons
            name="heart-outline"
            size={25}
            color="#222222"
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbHome}>
            Home
          </Text>

          <Ionicons
            name="chevron-forward"
            size={14}
            color="#999999"
          />

          {productCategory ? (
            <>
              <Text
                style={styles.breadcrumbCategory}
                numberOfLines={1}
              >
                {productCategory}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={14}
                color="#999999"
              />
            </>
          ) : null}

          <Text
            style={styles.breadcrumbProduct}
            numberOfLines={1}
          >
            {productTitle}
          </Text>
        </View>

        {/* =================================================
            IMAGE
        ================================================= */}

        <View style={styles.imageSection}>
          <View style={styles.mainImageContainer}>
            {activeImage ? (
              <Image
                source={{
                  uri: activeImage,
                }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            ) : (
              <View
                style={
                  styles.noImageContainer
                }
              >
                <Ionicons
                  name="image-outline"
                  size={60}
                  color="#AAAAAA"
                />

                <Text
                  style={styles.noImageText}
                >
                  No image available
                </Text>
              </View>
            )}
          </View>

          {productImages.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.thumbnailRow
              }
            >
              {productImages.map(
                (image, index) => {
                  const active =
                    activeImage === image;

                  return (
                    <Pressable
                      key={`${image}-${index}`}
                      onPress={() =>
                        setActiveImage(image)
                      }
                      style={[
                        styles.thumbnail,
                        active &&
                          styles.thumbnailActive,
                      ]}
                    >
                      <Image
                        source={{
                          uri: image,
                        }}
                        style={
                          styles.thumbnailImage
                        }
                        resizeMode="contain"
                      />
                    </Pressable>
                  );
                }
              )}
            </ScrollView>
          )}
        </View>

        {/* =================================================
            PRODUCT INFORMATION
        ================================================= */}

        <View style={styles.detailsSection}>
          <Text style={styles.productTitle}>
            {productTitle}
          </Text>

          {productBrand ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Brand:
              </Text>

              <Text style={styles.infoValue}>
                {productBrand}
              </Text>
            </View>
          ) : null}

          {productCategory ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Category:
              </Text>

              <Text style={styles.infoValue}>
                {productCategory}
              </Text>
            </View>
          ) : null}

          {/* RATING */}

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={18}
                  color="#F5A623"
                />
              )
            )}

            <Text style={styles.ratingText}>
              {product.rating ??
                product.average_rating ??
                'No ratings'}
            </Text>
          </View>

          {/* PRICE */}

          <View style={styles.priceSection}>
            {originalPrice !== '' &&
            Number(originalPrice) >
              sellingPrice ? (
              <Text
                style={styles.originalPrice}
              >
                ₹
                {Number(
                  originalPrice
                ).toLocaleString('en-IN')}
              </Text>
            ) : null}

            <Text style={styles.sellingPrice}>
              ₹
              {sellingPrice.toLocaleString(
                'en-IN'
              )}
            </Text>

            {discountPercent > 0 ? (
              <View
                style={styles.discountBadge}
              >
                <Text
                  style={
                    styles.discountText
                  }
                >
                  {discountPercent}% OFF
                </Text>
              </View>
            ) : null}
          </View>

          {/* STOCK */}

          <View
            style={[
              styles.stockBox,
              !inStock &&
                styles.stockBoxOut,
            ]}
          >
            <Ionicons
              name={
                inStock
                  ? 'checkmark-circle'
                  : 'close-circle'
              }
              size={18}
              color={
                inStock
                  ? '#2E7D32'
                  : '#D32F2F'
              }
            />

            <Text
              style={[
                styles.stockText,
                !inStock &&
                  styles.stockTextOut,
              ]}
            >
              {inStock
                ? stock > 0
                  ? `${stock} Items In Stock`
                  : 'In Stock'
                : 'Out of Stock'}
            </Text>
          </View>

          {/* QUANTITY */}

          <Text style={styles.quantityLabel}>
            Quantity
          </Text>

          <View style={styles.quantityRow}>
            <Pressable
              onPress={decreaseQuantity}
              disabled={!inStock}
              style={[
                styles.quantityButton,
                !inStock &&
                  styles.disabledButton,
              ]}
            >
              <Text
                style={
                  styles.quantityButtonText
                }
              >
                −
              </Text>
            </Pressable>

            <View
              style={styles.quantityValue}
            >
              <Text
                style={styles.quantityText}
              >
                {quantity}
              </Text>
            </View>

            <Pressable
              onPress={increaseQuantity}
              disabled={!inStock}
              style={[
                styles.quantityButton,
                !inStock &&
                  styles.disabledButton,
              ]}
            >
              <Text
                style={
                  styles.quantityButtonText
                }
              >
                +
              </Text>
            </Pressable>
          </View>

          {/* ACTION BUTTONS */}

          <View style={styles.actions}>
            <Pressable
              onPress={handleAddToCart}
              disabled={
                !inStock ||
                addingToCart
              }
              style={[
                styles.cartButton,
                (!inStock ||
                  addingToCart) &&
                  styles.disabledAction,
              ]}
            >
              {addingToCart ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="cart-outline"
                    size={21}
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
                </>
              )}
            </Pressable>

            <Pressable
              onPress={
                handleAddToWishlist
              }
              disabled={
                addingToWishlist
              }
              style={
                styles.wishlistButton
              }
            >
              {addingToWishlist ? (
                <ActivityIndicator
                  color="#2E7D32"
                />
              ) : (
                <>
                  <Ionicons
                    name="heart-outline"
                    size={21}
                    color="#2E7D32"
                  />

                  <Text
                    style={
                      styles.wishlistButtonText
                    }
                  >
                    Add to Wishlist
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {descriptionHtml ? (
          <View
            style={
              styles.descriptionSection
            }
          >
            <Text
              style={
                styles.descriptionTitle
              }
            >
              Product Description
            </Text>

            <RenderHTML
              contentWidth={
                width - 32
              }
              source={{
                html: descriptionHtml,
              }}
              tagsStyles={{
                body: {
                  color: '#555',
                  fontSize: 14,
                  lineHeight: 23,
                },

                p: {
                  color: '#555',
                  fontSize: 14,
                  lineHeight: 23,
                  marginTop: 0,
                  marginBottom: 14,
                },

                h1: {
                  color: '#1f5d2f',
                  fontSize: 26,
                  fontWeight: '700',
                  marginBottom: 15,
                },

                h2: {
                  color: '#1f5d2f',
                  fontSize: 24,
                  fontWeight: '700',
                  marginBottom: 15,
                },

                h3: {
                  color: '#1f5d2f',
                  fontSize: 20,
                  fontWeight: '700',
                  marginTop: 18,
                  marginBottom: 12,
                },

                ul: {
                  marginBottom: 12,
                },

                ol: {
                  marginBottom: 12,
                },

                li: {
                  color: '#555',
                  fontSize: 14,
                  lineHeight: 23,
                  marginBottom: 5,
                },

                strong: {
                  fontWeight: '700',
                },

                table: {
                  width: '100%',
                },

                td: {
                  padding: 8,
                  borderWidth: 1,
                  borderColor: '#ddd',
                },

                th: {
                  padding: 8,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  fontWeight: '700',
                },
              }}
            />
          </View>
        ) : null}

        {/* =================================================
            RELATED PRODUCTS
        ================================================= */}

        {relatedProducts.length > 0 ? (
          <View
            style={styles.relatedSection}
          >
            <View
              style={styles.relatedHeader}
            >
              <Text
                style={styles.relatedTitle}
              >
                Related Products
              </Text>

              {productCategory ? (
                <Text
                  style={
                    styles.relatedSubtitle
                  }
                >
                  More from {productCategory}
                </Text>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.relatedList
              }
            >
              {relatedProducts.map(
                (item) => {
                  const relatedTitle =
                    item.title ||
                    item.name ||
                    'Product';

                  const relatedPrice =
                    Number(
                      item.discount_price ??
                        item.price ??
                        0
                    );

                  const relatedImage =
                    Array.isArray(
                      item.images
                    ) &&
                    item.images.length > 0
                      ? item.images[0]
                      : item.image;

                  return (
                    <Pressable
                      key={String(
                        item.id
                      )}
                      style={
                        styles.relatedCard
                      }
                      onPress={() =>
                        handleRelatedProductPress(
                          item
                        )
                      }
                    >
                      <View
                        style={
                          styles.relatedImageContainer
                        }
                      >
                        {relatedImage ? (
                          <Image
                            source={{
                              uri: getImageUrl(
                                relatedImage
                              ),
                            }}
                            style={
                              styles.relatedImage
                            }
                            resizeMode="contain"
                          />
                        ) : (
                          <Ionicons
                            name="image-outline"
                            size={42}
                            color="#AAAAAA"
                          />
                        )}
                      </View>

                      <Text
                        style={
                          styles.relatedProductTitle
                        }
                        numberOfLines={2}
                      >
                        {relatedTitle}
                      </Text>

                      <Text
                        style={
                          styles.relatedPrice
                        }
                      >
                        ₹
                        {relatedPrice.toLocaleString(
                          'en-IN'
                        )}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
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
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666666',
  },

  notFoundTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '700',
    color: '#222222',
  },

  notFoundText: {
    marginTop: 8,
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },

  backButton: {
    marginTop: 22,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  topBar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },

  topBarButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBarTitle: {
    flex: 1,
    marginHorizontal: 8,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },

  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 5,
    backgroundColor: '#FAFAFA',
  },

  breadcrumbHome: {
    fontSize: 12,
    color: '#2E7D32',
  },

  breadcrumbCategory: {
    maxWidth: 100,
    fontSize: 12,
    color: '#666666',
  },

  breadcrumbProduct: {
    flex: 1,
    fontSize: 12,
    color: '#777777',
  },

  imageSection: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  mainImageContainer: {
    width: '100%',
    height: 330,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  mainImage: {
    width: '100%',
    height: '100%',
  },

  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  noImageText: {
    marginTop: 8,
    color: '#999999',
    fontSize: 13,
  },

  thumbnailRow: {
    paddingVertical: 12,
    gap: 10,
  },

  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  thumbnailActive: {
    borderWidth: 2,
    borderColor: '#2E7D32',
  },

  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  detailsSection: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },

  productTitle: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  infoLabel: {
    width: 78,
    fontSize: 14,
    fontWeight: '700',
    color: '#444444',
  },

  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#555555',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 15,
  },

  ratingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#777777',
  },

  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 15,
  },

  originalPrice: {
    fontSize: 15,
    color: '#999999',
    textDecorationLine: 'line-through',
  },

  sellingPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2E7D32',
  },

  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#E8F5E9',
  },

  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },

  stockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#E8F5E9',
    marginBottom: 18,
  },

  stockBoxOut: {
    backgroundColor: '#FFEBEE',
  },

  stockText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },

  stockTextOut: {
    color: '#D32F2F',
  },

  quantityLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 18,
  },

  quantityButton: {
    width: 44,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: '#F7F7F7',
  },

  disabledButton: {
    opacity: 0.45,
  },

  quantityButtonText: {
    fontSize: 23,
    color: '#333333',
  },

  quantityValue: {
    width: 58,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: '#FFFFFF',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },

  actions: {
    gap: 10,
    marginBottom: 8,
  },

  cartButton: {
    minHeight: 50,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  disabledAction: {
    opacity: 0.55,
  },

  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  wishlistButton: {
    minHeight: 50,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  wishlistButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '700',
  },

  descriptionSection: {
    marginTop: 18,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  descriptionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 12,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 23,
    color: '#555555',
  },

  // =====================================================
  // RELATED PRODUCTS
  // =====================================================

  relatedSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  relatedHeader: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  relatedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
  },

  relatedSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#777777',
  },

  relatedList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },

  relatedCard: {
    width: 165,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  relatedImageContainer: {
    width: '100%',
    height: 135,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  relatedImage: {
    width: '100%',
    height: '100%',
  },

  relatedProductTitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: '#222222',
    minHeight: 38,
  },

  relatedPrice: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: '800',
    color: '#2E7D32',
  },
});