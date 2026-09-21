import { router } from 'expo-router';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header/Header';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const ASSET_BASE_URL =
  'https://kvkapi.wedpictures.in';
function getImageUrl(image?: string) {
  if (!image) return '';

  if (
    image.startsWith('http://') ||
    image.startsWith('https://')
  ) {
    return image;
  }

  return `${ASSET_BASE_URL.replace(/\/$/, '')}/${image.replace(/^\//, '')}`;
}

export default function WishlistScreen() {
  const {
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  /*
   * MOVE WISHLIST ITEM TO CART
   *
   * 1. Add product to cart
   * 2. Remove product from wishlist
   */
  const handleMoveToCart = async (
    product: (typeof wishlistItems)[number]
  ) => {
    const productId =
      product.productId ??
      product.product_id ??
      product.id;

    if (!productId) {
      Alert.alert(
        'Error',
        'Product ID is missing.'
      );
      return;
    }

    try {
      // Add product to cart
      await addToCart({
        id: productId,
        productId,
        title:
          product.title ??
          product.name ??
          'Product',
        price: product.price ?? 0,
        quantity: 1,
        image:
          product.image ||
          product.images?.[0] ||
          '',
      });

      // Remove product from wishlist
      await removeFromWishlist(productId);

      Alert.alert(
        'Moved to Cart',
        `${product.title ?? product.name ?? 'Product'} has been moved to your cart.`
      );
    } catch (error) {
      console.error(
        'Move wishlist item to cart error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to move this product to cart.'
      );
    }
  };

  /*
   * REMOVE SINGLE ITEM
   */
  const handleRemove = (
    product: (typeof wishlistItems)[number]
  ) => {
    const productId =
      product.productId ??
      product.product_id ??
      product.id;

    if (!productId) return;

    Alert.alert(
      'Remove from Wishlist',
      'Do you want to remove this product from your wishlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            removeFromWishlist(productId),
        },
      ]
    );
  };

  /*
   * CLEAR ALL
   */
  const handleClearWishlist = () => {
    if (!wishlistItems.length) return;

    Alert.alert(
      'Clear Wishlist',
      'Remove all products from your wishlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearWishlist,
        },
      ]
    );
  };

  /*
   * OPEN SINGLE PRODUCT
   */
  const handleProductPress = (
    product: (typeof wishlistItems)[number]
  ) => {
    const productId =
      product.productId ??
      product.product_id ??
      product.id;

    if (!productId) return;

    /*
     * The current wishlist response does not necessarily
     * contain categoryName.
     *
     * Therefore we use "unknown" for now.
     * Product ID remains the actual product ID.
     */
    router.push({
      pathname:
        '/products-categories/[categoryName]/[productId]',
      params: {
        categoryName: 'unknown',
        productId: String(productId),
      },
    });
  };

  /*
   * PRODUCT CARD
   */
  const renderItem = ({
    item,
  }: {
    item: (typeof wishlistItems)[number];
  }) => {
    const title =
      item.title ??
      item.name ??
      'Product';

    const image =
      item.image ||
      item.images?.[0] ||
      '';

    const price = Number(
      item.price ?? 0
    );

    return (
      <View style={styles.card}>

        {/* PRODUCT */}
        <Pressable
          style={styles.productArea}
          onPress={() =>
            handleProductPress(item)
          }
        >
          <View style={styles.imageContainer}>
            {image ? (
              <Image
                source={{
                  uri: getImageUrl(image),
                }}
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.noImage}>
                No Image
              </Text>
            )}
          </View>

          <View style={styles.productInfo}>
            <Text
              style={styles.productTitle}
              numberOfLines={2}
            >
              {title}
            </Text>

            <Text style={styles.price}>
              ₹{price.toLocaleString('en-IN')}
            </Text>

            <Text style={styles.savedText}>
              Saved to wishlist
            </Text>
          </View>
        </Pressable>

        {/* ACTIONS */}
        <View style={styles.actions}>

          <Pressable
            style={styles.cartButton}
            onPress={() =>
              handleMoveToCart(item)
            }
          >
            <Text style={styles.cartButtonText}>
              Move to Cart
            </Text>
          </Pressable>

          <Pressable
            style={styles.removeButton}
            onPress={() =>
              handleRemove(item)
            }
          >
            <Text style={styles.removeButtonText}>
              Remove
            </Text>
          </Pressable>

        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <Header />

      <SafeAreaView
        edges={['bottom']}
        style={styles.content}
      >

        {/* HEADER */}
        <View style={styles.headerSection}>

          <View>
            <Text style={styles.title}>
              Wishlist
            </Text>

            <Text style={styles.subtitle}>
              {wishlistItems.length}{' '}
              {wishlistItems.length === 1
                ? 'product'
                : 'products'}{' '}
              saved
            </Text>
          </View>

          {wishlistItems.length > 0 && (
            <Pressable
              onPress={handleClearWishlist}
            >
              <Text style={styles.clearText}>
                Clear All
              </Text>
            </Pressable>
          )}

        </View>

        {/* EMPTY STATE */}
        {wishlistItems.length === 0 ? (
          <View style={styles.emptyState}>

            <Text style={styles.icon}>
              ♡
            </Text>

            <Text style={styles.emptyTitle}>
              Your wishlist is empty
            </Text>

            <Text style={styles.emptyText}>
              Save your favourite agricultural
              products and they will appear here.
            </Text>

            <Pressable
              style={styles.shopButton}
              onPress={() =>
                router.push('/categories')
              }
            >
              <Text style={styles.shopButtonText}>
                Explore Categories
              </Text>
            </Pressable>

          </View>
        ) : (

          /* WISHLIST */
          <FlatList
            data={wishlistItems}
            keyExtractor={(item, index) =>
              String(
                item.productId ??
                  item.product_id ??
                  item.id ??
                  index
              )
            }
            renderItem={renderItem}
            contentContainerStyle={
              styles.listContent
            }
            showsVerticalScrollIndicator={false}
          />

        )}

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
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222222',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#666666',
  },

  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C62828',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 14,
    marginBottom: 14,
    padding: 12,
  },

  productArea: {
    flexDirection: 'row',
  },

  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  productImage: {
    width: '90%',
    height: '90%',
  },

  noImage: {
    fontSize: 12,
    color: '#999999',
  },

  productInfo: {
    flex: 1,
    marginLeft: 14,
    paddingTop: 3,
  },

  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    lineHeight: 21,
  },

  price: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },

  savedText: {
    marginTop: 5,
    fontSize: 12,
    color: '#888888',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },

  cartButton: {
    flex: 1,
    height: 42,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  removeButton: {
    width: 90,
    height: 42,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeButtonText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '600',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  icon: {
    fontSize: 52,
    marginBottom: 16,
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

  shopButton: {
    marginTop: 22,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});