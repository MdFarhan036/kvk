import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '@/api/axios';
import Header from '@/components/Header/Header';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerContext';

type Address = {
  id: number | string;
  customerId?: number | string;
  addressType?: string;
  fullName: string;
  mobile: string;
  houseNo: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean | number;
};

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

export default function CheckoutScreen() {
  const { customer } = useCustomerAuth();
  const { cartItems, clearCart } = useCart();

  const items = cartItems as CartItem[];

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState<number | string | null>(null);

  const [loadingAddresses, setLoadingAddresses] =
    useState(true);

  const [showAddAddress, setShowAddAddress] =
    useState(false);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState('COD');

  const [form, setForm] = useState({
    addressType: 'Home',
    fullName: '',
    mobile: '',
    houseNo: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const subtotal = items.reduce(
    (total, item) => {
      const price = Number(item.price ?? 0);
      const quantity = Number(
        item.quantity ?? 1
      );

      return total + price * quantity;
    },
    0
  );

  const totalItems = items.reduce(
    (total, item) =>
      total + Number(item.quantity ?? 1),
    0
  );

  const deliveryCharge = 0;

  const totalCost =
    subtotal + deliveryCharge;

  // =====================================================
  // FETCH ADDRESSES
  // =====================================================

  const fetchAddresses = async () => {
    if (!customer) {
      setAddresses([]);
      setLoadingAddresses(false);
      return;
    }

    try {
      setLoadingAddresses(true);

      const { data } = await api.get(
        '/customer/addresses'
      );

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : Array.isArray(data?.addresses)
              ? data.addresses
              : [];

      setAddresses(list);

      // Select default address automatically
      const defaultAddress = list.find(
        (address: Address) =>
          Boolean(address.isDefault)
      );

      if (defaultAddress) {
        setSelectedAddressId(
          defaultAddress.id
        );
      } else if (list.length > 0) {
        setSelectedAddressId(list[0].id);
      }
    } catch (error) {
      console.error(
        'Fetch addresses error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to load your saved addresses.'
      );
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [customer]);

  // =====================================================
  // FORM
  // =====================================================

  const updateForm = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =====================================================
  // ADD ADDRESS
  // =====================================================

  const handleAddAddress = async () => {
    if (
      !form.fullName.trim() ||
      !form.mobile.trim() ||
      !form.houseNo.trim() ||
      !form.addressLine1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill all required address fields.'
      );
      return;
    }

    try {
      setSavingAddress(true);

      const { data } = await api.post(
        '/customer/addresses',
        {
          addressType:
            form.addressType || 'Home',
          fullName:
            form.fullName.trim(),
          mobile:
            form.mobile.trim(),
          houseNo:
            form.houseNo.trim(),
          addressLine1:
            form.addressLine1.trim(),
          addressLine2:
            form.addressLine2.trim(),
          landmark:
            form.landmark.trim(),
          city:
            form.city.trim(),
          state:
            form.state.trim(),
          pincode:
            form.pincode.trim(),
          country:
            form.country || 'India',
        }
      );

      await fetchAddresses();

      if (data?.id) {
        setSelectedAddressId(data.id);
      }

      setForm({
        addressType: 'Home',
        fullName: '',
        mobile: '',
        houseNo: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      });

      setShowAddAddress(false);

      Alert.alert(
        'Address Added',
        'Your delivery address has been saved.'
      );
    } catch (error) {
      console.error(
        'Add address error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to save the address.'
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handlePlaceOrder = async () => {
    if (!customer) {
      Alert.alert(
        'Login Required',
        'Please login before placing your order.'
      );
      return;
    }

    if (!items.length) {
      Alert.alert(
        'Cart Empty',
        'Your cart is empty.'
      );
      return;
    }

    if (!selectedAddressId) {
      Alert.alert(
        'Delivery Address',
        'Please select a delivery address.'
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const customerId =
        customer.id ??
        customer.customerId;

      if (!customerId) {
        Alert.alert(
          'Error',
          'Customer information is missing.'
        );
        return;
      }

      const orderItems = items
        .map((item) => {
          const productId =
            item.productId ??
            item.product_id ??
            item.id;

          const quantity = Number(
            item.quantity ?? 1
          );

          const price = Number(
            item.price ?? 0
          );

          return {
            productId: Number(productId),
            quantity,
            description:
              item.title ??
              item.name ??
              'Product',
            amount:
              price * quantity,
          };
        })
        .filter(
          (item) =>
            Number.isFinite(
              item.productId
            ) &&
            item.productId > 0
        );

      if (!orderItems.length) {
        Alert.alert(
          'Error',
          'No valid products found in your cart.'
        );
        return;
      }

      const response = await api.post(
        '/orders',
        {
          customerId:
            Number(customerId),

          addressId:
            Number(selectedAddressId),

          totalCost,

          status: 'Pending',

          paymentMethod:
            paymentMethod === 'COD'
              ? 'Cash on Delivery'
              : paymentMethod,

          paymentStatus: 'Pending',

          remarks: '',

          items: orderItems,
        }
      );

      const orderId =
        response.data?.orderId;

     await clearCart();

router.replace({
  pathname: '/order-success',
  params: {
    orderId: orderId
      ? String(orderId)
      : '',
  },
});
    } catch (error: any) {
      console.error(
        'Place order error:',
        error?.response?.data ||
          error
      );

      Alert.alert(
        'Order Failed',
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to place your order. Please try again.'
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // =====================================================
  // NO CART
  // =====================================================

  if (!items.length) {
    return (
      <View style={styles.container}>
        <Header />

        <SafeAreaView
          edges={['bottom']}
          style={styles.content}
        >
          <View style={styles.emptyState}>
            <Ionicons
              name="cart-outline"
              size={64}
              color="#2E7D32"
            />

            <Text style={styles.emptyTitle}>
              Your cart is empty
            </Text>

            <Pressable
              style={styles.shopButton}
              onPress={() =>
                router.replace(
                  '/(tabs)/categories'
                )
              }
            >
              <Text style={styles.shopButtonText}>
                Start Shopping
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // =====================================================
  // CHECKOUT UI
  // =====================================================

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
          {/* TITLE */}

          <View style={styles.pageHeader}>
            <Text style={styles.title}>
              Checkout
            </Text>

            <Text style={styles.subtitle}>
              Complete your order
            </Text>
          </View>

          {/* ============================================
              DELIVERY ADDRESS
          ============================================ */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="location-outline"
                  size={21}
                  color="#2E7D32"
                />

                <Text
                  style={styles.sectionTitle}
                >
                  Delivery Address
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setShowAddAddress(
                    !showAddAddress
                  )
                }
              >
                <Text style={styles.addText}>
                  {showAddAddress
                    ? 'Cancel'
                    : '+ Add New'}
                </Text>
              </Pressable>
            </View>

            {/* SAVED ADDRESSES */}

            {loadingAddresses ? (
              <View
                style={
                  styles.loadingContainer
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#2E7D32"
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Loading addresses...
                </Text>
              </View>
            ) : addresses.length === 0 &&
              !showAddAddress ? (
              <View
                style={
                  styles.noAddressContainer
                }
              >
                <Text
                  style={
                    styles.noAddressText
                  }
                >
                  No saved delivery address.
                </Text>

                <Pressable
                  style={
                    styles.addAddressButton
                  }
                  onPress={() =>
                    setShowAddAddress(true)
                  }
                >
                  <Text
                    style={
                      styles.addAddressButtonText
                    }
                  >
                    Add Address
                  </Text>
                </Pressable>
              </View>
            ) : (
              addresses.map((address) => {
                const selected =
                  String(
                    selectedAddressId
                  ) ===
                  String(address.id);

                return (
                  <Pressable
                    key={String(address.id)}
                    style={[
                      styles.addressCard,
                      selected &&
                        styles.selectedAddressCard,
                    ]}
                    onPress={() =>
                      setSelectedAddressId(
                        address.id
                      )
                    }
                  >
                    <View
                      style={
                        styles.addressTop
                      }
                    >
                      <View
                        style={
                          styles.addressTypeRow
                        }
                      >
                        <Ionicons
                          name={
                            address.addressType ===
                            'Work'
                              ? 'briefcase-outline'
                              : 'home-outline'
                          }
                          size={17}
                          color="#2E7D32"
                        />

                        <Text
                          style={
                            styles.addressType
                          }
                        >
                          {address.addressType ||
                            'Home'}
                        </Text>

                        {Boolean(
                          address.isDefault
                        ) && (
                          <Text
                            style={
                              styles.defaultBadge
                            }
                          >
                            DEFAULT
                          </Text>
                        )}
                      </View>

                      <View
                        style={[
                          styles.radio,
                          selected &&
                            styles.radioSelected,
                        ]}
                      >
                        {selected && (
                          <View
                            style={
                              styles.radioDot
                            }
                          />
                        )}
                      </View>
                    </View>

                    <Text
                      style={styles.addressName}
                    >
                      {address.fullName}
                    </Text>

                    <Text
                      style={styles.addressMobile}
                    >
                      {address.mobile}
                    </Text>

                    <Text
                      style={styles.addressText}
                    >
                      {address.houseNo},{' '}
                      {address.addressLine1}
                    </Text>

                    {address.addressLine2 ? (
                      <Text
                        style={styles.addressText}
                      >
                        {address.addressLine2}
                      </Text>
                    ) : null}

                    {address.landmark ? (
                      <Text
                        style={styles.addressText}
                      >
                        Landmark: {address.landmark}
                      </Text>
                    ) : null}

                    <Text
                      style={styles.addressText}
                    >
                      {address.city},{' '}
                      {address.state} -{' '}
                      {address.pincode}
                    </Text>
                  </Pressable>
                );
              })
            )}

            {/* ADD ADDRESS FORM */}

            {showAddAddress && (
              <View
                style={
                  styles.addAddressForm
                }
              >
                <Text
                  style={
                    styles.formTitle
                  }
                >
                  Add Delivery Address
                </Text>

                <View
                  style={
                    styles.addressTypeButtons
                  }
                >
                  {[
                    'Home',
                    'Work',
                    'Other',
                  ].map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.typeButton,
                        form.addressType ===
                          type &&
                          styles.typeButtonSelected,
                      ]}
                      onPress={() =>
                        updateForm(
                          'addressType',
                          type
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          form.addressType ===
                            type &&
                            styles.typeButtonTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Full Name *"
                  value={form.fullName}
                  onChangeText={(value) =>
                    updateForm(
                      'fullName',
                      value
                    )
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Mobile Number *"
                  value={form.mobile}
                  keyboardType="phone-pad"
                  onChangeText={(value) =>
                    updateForm(
                      'mobile',
                      value
                    )
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="House / Flat No. *"
                  value={form.houseNo}
                  onChangeText={(value) =>
                    updateForm(
                      'houseNo',
                      value
                    )
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Address Line 1 *"
                  value={form.addressLine1}
                  onChangeText={(value) =>
                    updateForm(
                      'addressLine1',
                      value
                    )
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Address Line 2"
                  value={form.addressLine2}
                  onChangeText={(value) =>
                    updateForm(
                      'addressLine2',
                      value
                    )
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Landmark"
                  value={form.landmark}
                  onChangeText={(value) =>
                    updateForm(
                      'landmark',
                      value
                    )
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="City *"
                  value={form.city}
                  onChangeText={(value) =>
                    updateForm(
                      'city',
                      value
                    )
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="State *"
                  value={form.state}
                  onChangeText={(value) =>
                    updateForm(
                      'state',
                      value
                    )
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Pincode *"
                  value={form.pincode}
                  keyboardType="number-pad"
                  onChangeText={(value) =>
                    updateForm(
                      'pincode',
                      value
                    )
                  }
                />

                <Pressable
                  style={
                    styles.saveAddressButton
                  }
                  onPress={
                    handleAddAddress
                  }
                  disabled={savingAddress}
                >
                  {savingAddress ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.saveAddressText
                      }
                    >
                      Save Address
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* ============================================
              ORDER ITEMS
          ============================================ */}

          <View style={styles.section}>
            <View
              style={styles.sectionTitleRow}
            >
              <Ionicons
                name="bag-outline"
                size={21}
                color="#2E7D32"
              />

              <Text
                style={styles.sectionTitle}
              >
                Order Items
              </Text>
            </View>

            {items.map((item, index) => {
              const price = Number(
                item.price ?? 0
              );

              const quantity = Number(
                item.quantity ?? 1
              );

              const name =
                item.title ||
                item.name ||
                'Product';

              return (
                <View
                  key={`${item.productId ?? item.id ?? index}`}
                  style={styles.orderItem}
                >
                  <View
                    style={
                      styles.orderItemInfo
                    }
                  >
                    <Text
                      style={
                        styles.orderItemName
                      }
                      numberOfLines={2}
                    >
                      {name}
                    </Text>

                    <Text
                      style={
                        styles.orderItemQuantity
                      }
                    >
                      Qty: {quantity}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.orderItemPrice
                    }
                  >
                    ₹
                    {(
                      price * quantity
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* ============================================
              PAYMENT METHOD
          ============================================ */}

          <View style={styles.section}>
            <View
              style={styles.sectionTitleRow}
            >
              <Ionicons
                name="card-outline"
                size={21}
                color="#2E7D32"
              />

              <Text
                style={styles.sectionTitle}
              >
                Payment Method
              </Text>
            </View>

            <Pressable
              style={[
                styles.paymentCard,
                paymentMethod === 'COD' &&
                  styles.paymentCardSelected,
              ]}
              onPress={() =>
                setPaymentMethod('COD')
              }
            >
              <View
                style={
                  styles.paymentLeft
                }
              >
                <Ionicons
                  name="cash-outline"
                  size={25}
                  color="#2E7D32"
                />

                <View>
                  <Text
                    style={
                      styles.paymentTitle
                    }
                  >
                    Cash on Delivery
                  </Text>

                  <Text
                    style={
                      styles.paymentSubtitle
                    }
                  >
                    Pay when your order arrives
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.radio,
                  paymentMethod ===
                    'COD' &&
                    styles.radioSelected,
                ]}
              >
                {paymentMethod === 'COD' && (
                  <View
                    style={
                      styles.radioDot
                    }
                  />
                )}
              </View>
            </Pressable>
          </View>

          {/* ============================================
              ORDER SUMMARY
          ============================================ */}

          <View style={styles.summary}>
            <Text
              style={styles.summaryTitle}
            >
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
              style={styles.summaryRow}
            >
              <Text
                style={styles.summaryLabel}
              >
                Delivery
              </Text>

              <Text
                style={
                  styles.freeDelivery
                }
              >
                FREE
              </Text>
            </View>

            <View
              style={styles.divider}
            />

            <View
              style={styles.totalRow}
            >
              <Text
                style={styles.totalLabel}
              >
                Total
              </Text>

              <Text
                style={styles.totalValue}
              >
                ₹
                {totalCost.toLocaleString(
                  'en-IN'
                )}
              </Text>
            </View>

            <Pressable
              style={[
                styles.placeOrderButton,
                placingOrder &&
                  styles.disabledButton,
              ]}
              onPress={
                handlePlaceOrder
              }
              disabled={placingOrder}
            >
              {placingOrder ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Text
                    style={
                      styles.placeOrderText
                    }
                  >
                    Place Order
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

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

  pageHeader: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
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

  section: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },

  addText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },

  loadingContainer: {
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 8,
    color: '#777777',
    fontSize: 13,
  },

  noAddressContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },

  noAddressText: {
    fontSize: 14,
    color: '#666666',
  },

  addAddressButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addAddressButtonText: {
    color: '#2E7D32',
    fontWeight: '700',
  },

  addressCard: {
    padding: 13,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
  },

  selectedAddressCard: {
    borderColor: '#2E7D32',
    backgroundColor: '#F5FBF5',
  },

  addressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  addressTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  addressType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  defaultBadge: {
    marginLeft: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    fontSize: 9,
    fontWeight: '800',
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#BBBBBB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: '#2E7D32',
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
  },

  addressName: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },

  addressMobile: {
    marginTop: 3,
    fontSize: 13,
    color: '#555555',
  },

  addressText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: '#666666',
  },

  addAddressForm: {
    marginTop: 8,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 12,
  },

  addressTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },

  typeButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },

  typeButtonText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },

  typeButtonTextSelected: {
    color: '#2E7D32',
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 9,
    fontSize: 14,
    color: '#222222',
    backgroundColor: '#FFFFFF',
  },

  saveAddressButton: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  saveAddressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  orderItemInfo: {
    flex: 1,
    paddingRight: 12,
  },

  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  orderItemQuantity: {
    marginTop: 4,
    fontSize: 12,
    color: '#777777',
  },

  orderItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },

  paymentCard: {
    marginTop: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  paymentCardSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#F5FBF5',
  },

  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  paymentSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#777777',
  },

  summary: {
    marginHorizontal: 16,
    marginTop: 12,
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

  freeDelivery: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
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

  placeOrderButton: {
    minHeight: 50,
    marginTop: 18,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  disabledButton: {
    opacity: 0.7,
  },

  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
  },

  shopButton: {
    marginTop: 20,
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});