import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ASSET_BASE_URL } from '@/api/axios';
import Header from '@/components/Header/Header';
import { useCart } from '@/context/CartContext';

type CartItem = {
  id?: number | string;
  productId?: number | string;
  product_id?: number | string;
  title?: string;
  name?: string;
  price?: number | string;
  quantity?: number | string;
  image?: string;
  images?: string[];
};

const getImageUrl = (url?: string) => {
  if (!url) return '';

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${ASSET_BASE_URL}${
    url.startsWith('/') ? '' : '/'
  }${url}`;
};

export default function CartScreen() {
  const router = useRouter();

  const {
    cartItems,
    removeFromCart,
    clearCart,
  } = useCart();

  const items = cartItems as CartItem[];

  const subtotal = items.reduce((total, item) => {
    const price = Number(item.price ?? 0);
    const quantity = Number(item.quantity ?? 1);

    return total + price * quantity;
  }, 0);

  const totalItems = items.reduce(
    (total, item) =>
      total + Number(item.quantity ?? 1),
    0
  );

  const handleRemove = (
    item: CartItem
  ) => {
    const productId =
      item.productId ??
      item.product_id ??
      item.id;

    if (
      productId === undefined ||
      productId === null
    ) {
      return;
    }

    Alert.alert(
      'Remove Item',
      `Remove ${
        item.title ||
        item.name ||
        'this product'
      } from your cart?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            removeFromCart(productId),
        },
      ]
    );
  };

  const handleClearCart = () => {
    if (!items.length) return;

    Alert.alert(
      'Clear Cart',
      'Remove all products from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearCart,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <SafeAreaView
        edges={['bottom']}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* HEADER */}

          <View style={styles.headerSection}>
            <View>
              <Text style={styles.title}>
                My Cart
              </Text>

              <Text style={styles.subtitle}>
                {totalItems > 0
                  ? `${totalItems} ${
                      totalItems === 1
                        ? 'item'
                        : 'items'
                    } in your cart`
                  : 'Review the products you want to purchase'}
              </Text>
            </View>

            {items.length > 0 && (
              <Pressable
                onPress={handleClearCart}
                style={styles.clearButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color="#D32F2F"
                />

                <Text
                  style={styles.clearButtonText}
                >
                  Clear
                </Text>
              </Pressable>
            )}
          </View>

          {/* EMPTY */}

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="cart-outline"
                  size={52}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.emptyTitle}>
                Your cart is empty
              </Text>

              <Text style={styles.emptyText}>
                Add agricultural products to
                your cart and they will appear
                here.
              </Text>

              <Pressable
                style={styles.shopButton}
                onPress={() =>
                  router.push(
                    '/(tabs)/categories'
                  )
                }
              >
                <Text
                  style={styles.shopButtonText}
                >
                  Start Shopping
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          ) : (
            <>
              {/* CART ITEMS */}

              <View style={styles.itemsSection}>
                {items.map(
                  (item, index) => {
                    const productId =
                      item.productId ??
                      item.product_id ??
                      item.id ??
                      index;

                    const productName =
                      item.title ||
                      item.name ||
                      'Product';

                    const price = Number(
                      item.price ?? 0
                    );

                    const quantity =
                      Number(
                        item.quantity ?? 1
                      );

                    const image =
                      item.images?.[0] ||
                      item.image ||
                      '';

                    const imageUrl =
                      getImageUrl(image);

                    return (
                      <View
                        key={`${productId}-${index}`}
                        style={styles.cartItem}
                      >
                        {/* IMAGE */}

                        <View
                          style={
                            styles.itemImageContainer
                          }
                        >
                          {imageUrl ? (
                            <Image
                              source={{
                                uri: imageUrl,
                              }}
                              style={
                                styles.itemImage
                              }
                              resizeMode="contain"
                            />
                          ) : (
                            <Ionicons
                              name="image-outline"
                              size={38}
                              color="#AAAAAA"
                            />
                          )}
                        </View>

                        {/* DETAILS */}

                        <View
                          style={
                            styles.itemDetails
                          }
                        >
                          <Text
                            style={
                              styles.itemName
                            }
                            numberOfLines={2}
                          >
                            {productName}
                          </Text>

                          <Text
                            style={
                              styles.itemPrice
                            }
                          >
                            ₹
                            {price.toLocaleString(
                              'en-IN'
                            )}
                          </Text>

                          <Text
                            style={
                              styles.itemQuantity
                            }
                          >
                            Quantity: {quantity}
                          </Text>

                          <Text
                            style={
                              styles.itemTotal
                            }
                          >
                            ₹
                            {(
                              price *
                              quantity
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </Text>
                        </View>

                        {/* REMOVE */}

                        <Pressable
                          style={
                            styles.removeButton
                          }
                          onPress={() =>
                            handleRemove(
                              item
                            )
                          }
                        >
                          <Ionicons
                            name="trash-outline"
                            size={19}
                            color="#D32F2F"
                          />
                        </Pressable>
                      </View>
                    );
                  }
                )}
              </View>

              {/* SUMMARY */}

              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>
                  Order Summary
                </Text>

                <View
                  style={styles.summaryRow}
                >
                  <Text
                    style={styles.summaryLabel}
                  >
                    Items
                  </Text>

                  <Text
                    style={styles.summaryValue}
                  >
                    {totalItems}
                  </Text>
                </View>

                <View
                  style={styles.summaryRow}
                >
                  <Text
                    style={styles.summaryLabel}
                  >
                    Subtotal
                  </Text>

                  <Text
                    style={styles.summaryValue}
                  >
                    ₹
                    {subtotal.toLocaleString(
                      'en-IN'
                    )}
                  </Text>
                </View>

                <View
                  style={styles.divider}
                />

                <View
                  style={styles.totalRow}
                >
                  <Text style={styles.totalLabel}>
                    Total
                  </Text>

                  <Text style={styles.totalValue}>
                    ₹
                    {subtotal.toLocaleString(
                      'en-IN'
                    )}
                  </Text>
                </View>

                <Pressable
                  style={styles.checkoutButton}
                 onPress={() => {
  router.push('/checkout');
}}
                >
                  <Text
                    style={
                      styles.checkoutButtonText
                    }
                  >
                    Proceed to Checkout
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
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

  scrollContent: {
    paddingBottom: 40,
  },

  headerSection: {
    paddingHorizontal: 18,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222222',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#666666',
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  clearButtonText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
  },

  emptyState: {
    flex: 1,
    minHeight: 500,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
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
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  itemsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },

  cartItem: {
    minHeight: 125,
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
  },

  itemImageContainer: {
    width: 95,
    height: 105,
    borderRadius: 9,
    backgroundColor: '#F7F8F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  itemImage: {
    width: '90%',
    height: '90%',
  },

  itemDetails: {
    flex: 1,
    paddingHorizontal: 12,
  },

  itemName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#222222',
  },

  itemPrice: {
    marginTop: 7,
    fontSize: 13,
    color: '#666666',
  },

  itemQuantity: {
    marginTop: 4,
    fontSize: 12,
    color: '#777777',
  },

  itemTotal: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '800',
    color: '#2E7D32',
  },

  removeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summary: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9F8',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 14,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  divider: {
    height: 1,
    backgroundColor: '#DDDDDD',
    marginVertical: 8,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },

  totalValue: {
    fontSize: 21,
    fontWeight: '800',
    color: '#2E7D32',
  },

  checkoutButton: {
    minHeight: 50,
    marginTop: 18,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});