import api, { ASSET_BASE_URL } from '@/api/axios';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerContext';
import { useWishlist } from '@/context/WishlistContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
  original_price?: number | string;

  description?: string;

  type?: string;
  mfg?: string;
  size?: string;
  weight?: string;
  tags?: string;
  life?: string;
  stock?: number | string;
  sku?: string;

  rating?: number | string;
};

const getImageUrl = (image?: string | null) => {
  if (!image) return '';

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${ASSET_BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

const stripHtml = (html?: string) => {
  if (!html) return '';

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
};

export default function PopularSingleProductScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    categoryName?: string;
    productId?: string;
  }>();

  const categoryName = Array.isArray(params.categoryName)
    ? params.categoryName[0]
    : params.categoryName;

  const productId = Array.isArray(params.productId)
    ? params.productId[0]
    : params.productId;

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
const { customer } = useCustomerAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const [cartMessage, setCartMessage] = useState('');
  const [wishlistMessage, setWishlistMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setProduct(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [productRes, categoriesRes] = await Promise.all([
          api.get(`/products/${productId}`),
          api.get('/categories'),
        ]);

        const productData = productRes.data;

        setProduct(productData);

        setCategories(
          Array.isArray(categoriesRes.data)
            ? categoriesRes.data
            : []
        );

        if (
          Array.isArray(productData?.images) &&
          productData.images.length > 0
        ) {
          setActiveImage(
            getImageUrl(productData.images[0])
          );
        } else if (productData?.image) {
          setActiveImage(
            getImageUrl(productData.image)
          );
        } else {
          setActiveImage(null);
        }
      } catch (error) {
        console.error(
          'Failed to load popular product:',
          error
        );

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const productTitle = useMemo(() => {
    return (
      product?.title ||
      product?.name ||
      'Product'
    );
  }, [product]);

  const productBrand = useMemo(() => {
    if (!product?.brand) return 'N/A';

    if (typeof product.brand === 'object') {
      return product.brand.name || 'N/A';
    }

    return product.brand;
  }, [product]);

  const productCategory = useMemo(() => {
    return (
      product?.category_name ||
      product?.category?.name ||
      categoryName ||
      ''
    );
  }, [product, categoryName]);

  const productImages = useMemo(() => {
    if (!product) return [];

    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images
        .map((image) => getImageUrl(image))
        .filter(Boolean);
    }

    if (product.image) {
      return [getImageUrl(product.image)];
    }

    return [];
  }, [product]);

  const originalPrice = Number(
    product?.oldPrice ??
      product?.old_price ??
      product?.original_price ??
      0
  );

  const sellingPrice = Number(
    product?.discount_price ??
      product?.price ??
      0
  );

  const stock = Number(product?.stock ?? 0);

  const rating = Number(product?.rating ?? 0);

  const description = stripHtml(
    product?.description
  );

  const increaseQuantity = () => {
    setQuantity((previous) => previous + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((previous) =>
      previous > 1 ? previous - 1 : 1
    );
  };

const handleAddToCart = async () => {
  if (!product) return;

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
          onPress: () => router.push('/login'),
        },
      ]
    );

    return;
  }

  try {
    await addToCart({
      id: product.id,
      productId: product.id,
      title: productTitle,
      price: sellingPrice,
      quantity,
      image: product.image,
      images: product.images,
    });

    setCartMessage(
      `${productTitle} added to cart`
    );

    setTimeout(() => {
      setCartMessage('');
    }, 2500);
  } catch (error: any) {
    console.error(
      'Failed to add product to cart:',
      error?.response?.data ?? error
    );

    Alert.alert(
      'Cart Error',
      error?.response?.data?.message ||
        'Unable to add this product to your cart.'
    );
  }
};

 const handleBuyNow = async () => {
  if (!product) return;

  if (!customer) {
    Alert.alert(
      'Login Required',
      'Please login before buying a product.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Login',
          onPress: () => router.push('/login'),
        },
      ]
    );

    return;
  }

  try {
    await addToCart({
      id: product.id,
      productId: product.id,
      title: productTitle,
      price: sellingPrice,
      quantity,
      image: product.image,
      images: product.images,
    });

    router.push('/cart');
  } catch (error: any) {
    console.error(
      'Failed to buy product:',
      error?.response?.data ?? error
    );

    Alert.alert(
      'Cart Error',
      error?.response?.data?.message ||
        'Unable to add this product to your cart.'
    );
  }
};
const handleWishlist = async () => {
  if (!product) return;

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
          onPress: () => router.push('/login'),
        },
      ]
    );

    return;
  }

  try {
    await addToWishlist({
      id: product.id,
      productId: product.id,
      title: productTitle,
      price: sellingPrice,
      quantity: 1,
      image: product.image,
      images: product.images,
    });

    setWishlistMessage(
      `${productTitle} added to wishlist`
    );

    setTimeout(() => {
      setWishlistMessage('');
    }, 2500);
  } catch (error: any) {
    console.error(
      'Failed to add product to wishlist:',
      error?.response?.data ?? error
    );

    Alert.alert(
      'Wishlist Error',
      error?.response?.data?.message ||
        'Unable to add this product to your wishlist.'
    );
  }
};

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen
          options={{ headerShown: false }}
        />

        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />

        <Text style={styles.loadingText}>
          Loading product details...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen
          options={{ headerShown: false }}
        />

        <Ionicons
          name="alert-circle-outline"
          size={52}
          color="#999"
        />

        <Text style={styles.notFoundTitle}>
          Product not found
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
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.container}>
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#222"
            />
          </Pressable>

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            Product Details
          </Text>

          <Pressable
            onPress={() => router.push('/cart')}
            style={styles.headerButton}
          >
            <Ionicons
              name="cart-outline"
              size={25}
              color="#222"
            />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* BREADCRUMB */}

          <View style={styles.breadcrumb}>
            <Pressable
              onPress={() => router.push('/')}
            >
              <Text style={styles.breadcrumbLink}>
                Home
              </Text>
            </Pressable>

            <Ionicons
              name="chevron-forward"
              size={14}
              color="#999"
            />

            <Pressable
              onPress={() =>
                router.push('/featured-category')
              }
            >
              <Text style={styles.breadcrumbLink}>
                Features
              </Text>
            </Pressable>

            <Ionicons
              name="chevron-forward"
              size={14}
              color="#999"
            />

            <Text
              style={styles.breadcrumbCurrent}
              numberOfLines={1}
            >
              {productTitle}
            </Text>
          </View>

          {/* PRODUCT IMAGE */}

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
                  style={styles.imagePlaceholder}
                >
                  <Ionicons
                    name="image-outline"
                    size={55}
                    color="#BDBDBD"
                  />
                </View>
              )}
            </View>

            {productImages.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                  styles.thumbnailContainer
                }
              >
                {productImages.map(
                  (imageUrl, index) => {
                    const isActive =
                      activeImage === imageUrl;

                    return (
                      <Pressable
                        key={`${imageUrl}-${index}`}
                        onPress={() =>
                          setActiveImage(imageUrl)
                        }
                        style={[
                          styles.thumbnailWrapper,
                          isActive &&
                            styles.activeThumbnail,
                        ]}
                      >
                        <Image
                          source={{
                            uri: imageUrl,
                          }}
                          style={styles.thumbnail}
                          resizeMode="contain"
                        />
                      </Pressable>
                    );
                  }
                )}
              </ScrollView>
            )}
          </View>

          {/* PRODUCT INFORMATION */}

          <View style={styles.infoCard}>
            <Text style={styles.productTitle}>
              {productTitle}
            </Text>

            <View style={styles.brandRow}>
              <Text style={styles.label}>
                Brand:
              </Text>

              <Text style={styles.value}>
                {productBrand}
              </Text>
            </View>

            {/* RATING */}

            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={
                    rating >= star
                      ? 'star'
                      : rating >= star - 0.5
                        ? 'star-half'
                        : 'star-outline'
                  }
                  size={18}
                  color="#F4B400"
                />
              ))}

              <Text style={styles.ratingText}>
                {rating > 0
                  ? `${rating.toFixed(1)} rating`
                  : '350 ratings'}
              </Text>
            </View>

            {/* PRICE */}

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Price:
              </Text>

              {originalPrice > 0 && (
                <Text style={styles.originalPrice}>
                  ₹{originalPrice}
                </Text>
              )}

              <Text style={styles.sellingPrice}>
                ₹{sellingPrice}
              </Text>
            </View>

            {/* STOCK */}

            <View style={styles.stockRow}>
              <Ionicons
                name={
                  stock > 0
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={19}
                color={
                  stock > 0
                    ? '#2E7D32'
                    : '#D32F2F'
                }
              />

              <Text
                style={[
                  styles.stockText,
                  {
                    color:
                      stock > 0
                        ? '#2E7D32'
                        : '#D32F2F',
                  },
                ]}
              >
                {stock > 0
                  ? `${stock} Items In Stock`
                  : 'Out of Stock'}
              </Text>
            </View>

            {/* QUANTITY */}

            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>
                Quantity
              </Text>

              <View style={styles.quantityControl}>
                <Pressable
                  onPress={decreaseQuantity}
                  style={styles.quantityButton}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color="#333"
                  />
                </Pressable>

                <Text style={styles.quantityValue}>
                  {quantity}
                </Text>

                <Pressable
                  onPress={increaseQuantity}
                  style={styles.quantityButton}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color="#333"
                  />
                </Pressable>
              </View>
            </View>

            {/* ACTION BUTTONS */}

            <View style={styles.actionContainer}>
              <Pressable
                style={[
                  styles.actionButton,
                  styles.cartButton,
                  stock <= 0 &&
                    styles.disabledButton,
                ]}
                disabled={stock <= 0}
                onPress={handleAddToCart}
              >
                <Ionicons
                  name="cart-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.actionText}>
                  Add to Cart
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.actionButton,
                  styles.buyButton,
                  stock <= 0 &&
                    styles.disabledBuyButton,
                ]}
                disabled={stock <= 0}
                onPress={handleBuyNow}
              >
                <Ionicons
                  name="flash-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.actionText}>
                  Buy Now
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.actionButton,
                  styles.wishlistButton,
                ]}
                onPress={handleWishlist}
              >
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color="#2E7D32"
                />

                <Text
                  style={
                    styles.wishlistButtonText
                  }
                >
                  Wishlist
                </Text>
              </Pressable>
            </View>

            {cartMessage ? (
              <View style={styles.successMessage}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#2E7D32"
                />

                <Text
                  style={styles.successMessageText}
                >
                  {cartMessage}
                </Text>
              </View>
            ) : null}

            {wishlistMessage ? (
              <View style={styles.successMessage}>
                <Ionicons
                  name="heart"
                  size={18}
                  color="#2E7D32"
                />

                <Text
                  style={styles.successMessageText}
                >
                  {wishlistMessage}
                </Text>
              </View>
            ) : null}
          </View>

          {/* OVERVIEW */}

          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>
              Overview
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Product Name
              </Text>

              <Text style={styles.detailValue}>
                {productTitle}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Brand
              </Text>

              <Text style={styles.detailValue}>
                {productBrand}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Category
              </Text>

              <Text style={styles.detailValue}>
                {productCategory || 'N/A'}
              </Text>
            </View>

            {description ? (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionLabel}>
                  Description
                </Text>

                <Text
                  style={styles.descriptionText}
                >
                  {description}
                </Text>
              </View>
            ) : null}

            {product.type ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>
                  Type
                </Text>

                <Text style={styles.specValue}>
                  {product.type}
                </Text>
              </View>
            ) : null}

            {product.mfg ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>
                  MFG
                </Text>

                <Text style={styles.specValue}>
                  {product.mfg}
                </Text>
              </View>
            ) : null}

            {product.size ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>
                  Size
                </Text>

                <Text style={styles.specValue}>
                  {product.size}
                </Text>
              </View>
            ) : null}

            {product.weight ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>
                  Weight
                </Text>

                <Text style={styles.specValue}>
                  {product.weight}
                </Text>
              </View>
            ) : null}

            {product.tags ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>
                  Tags
                </Text>

                <Text style={styles.specValue}>
                  {product.tags}
                </Text>
              </View>
            ) : null}

            {product.life ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>
                  Life
                </Text>

                <Text style={styles.specValue}>
                  {product.life}
                </Text>
              </View>
            ) : null}

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>
                Stock
              </Text>

              <Text
                style={[
                  styles.specValue,
                  {
                    color:
                      stock > 0
                        ? '#2E7D32'
                        : '#D32F2F',
                  },
                ]}
              >
                {stock > 0
                  ? `${stock} Items In Stock`
                  : 'Out of Stock'}
              </Text>
            </View>

            {product.sku ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>
                  SKU
                </Text>

                <Text style={styles.specValue}>
                  {product.sku}
                </Text>
              </View>
            ) : null}
          </View>

          {/* BACK TO POPULAR */}

          <Pressable
            style={styles.backToPopular}
            onPress={() =>
              router.push('/featured-category')
            }
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color="#2E7D32"
            />

            <Text
              style={styles.backToPopularText}
            >
              Back to Popular Products
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F7',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    backgroundColor: '#F7F8F7',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },

  notFoundTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },

  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },

  scrollContent: {
    paddingBottom: 35,
  },

  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 6,
    backgroundColor: '#FFFFFF',
  },

  breadcrumbLink: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },

  breadcrumbCurrent: {
    flex: 1,
    fontSize: 12,
    color: '#777',
  },

  imageSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 18,
  },

  mainImageContainer: {
    height: 330,
    marginHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  mainImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F3F3',
  },

  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },

  thumbnailWrapper: {
    width: 70,
    height: 70,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  activeThumbnail: {
    borderWidth: 2,
    borderColor: '#2E7D32',
  },

  thumbnail: {
    width: 62,
    height: 62,
  },

  infoCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    padding: 17,
  },

  productTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '700',
    color: '#222',
    marginBottom: 13,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginRight: 5,
  },

  value: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  ratingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#777',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 11,
  },

  priceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginRight: 7,
  },

  originalPrice: {
    fontSize: 15,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 9,
  },

  sellingPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
  },

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  stockText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },

  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  quantityLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 8,
    overflow: 'hidden',
  },

  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },

  quantityValue: {
    minWidth: 42,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },

  actionContainer: {
    gap: 10,
  },

  actionButton: {
    minHeight: 48,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  cartButton: {
    backgroundColor: '#2E7D32',
  },

  buyButton: {
    backgroundColor: '#F57C00',
  },

  wishlistButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },

  disabledButton: {
    backgroundColor: '#AAAAAA',
  },

  disabledBuyButton: {
    backgroundColor: '#AAAAAA',
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  wishlistButtonText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '700',
  },

  successMessage: {
    marginTop: 12,
    padding: 11,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    flexDirection: 'row',
    alignItems: 'center',
  },

  successMessageText: {
    marginLeft: 7,
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  overviewCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    padding: 17,
  },

  overviewTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    marginBottom: 14,
  },

  detailRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  detailLabel: {
    width: 115,
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },

  descriptionSection: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  descriptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 7,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },

  specRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  specLabel: {
    width: 115,
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  specValue: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },

  backToPopular: {
    marginHorizontal: 16,
    marginTop: 18,
    minHeight: 48,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    backgroundColor: '#FFFFFF',
  },

  backToPopularText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },

  backButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});