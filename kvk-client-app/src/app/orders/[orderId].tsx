import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '@/api/axios';
import Header from '@/components/Header/Header';

type OrderItem = {
  id?: number;
  productId?: number | string;
  product_id?: number | string;
  description?: string;
  title?: string;
  name?: string;
  quantity?: number | string;
  amount?: number | string;
  price?: number | string;
  image?: string;
  images?: string[];
};

type OrderAddress = {
  fullName?: string;
  mobile?: string;
  houseNo?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

type Order = {
  id: number;
  orderNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  totalCost?: number | string;
  total?: number | string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  remarks?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  orderAddress?: OrderAddress;
  address?: OrderAddress;
};

export default function OrderDetailsScreen() {
  const router = useRouter();

  const { orderId } = useLocalSearchParams<{
    orderId: string;
  }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      /*
       * Public order endpoint is used here because your backend
       * already provides /public/orders/:id for order details.
       */
      const { data } = await api.get(
        `/orders/public/orders/${encodeURIComponent(
          String(orderId)
        )}`
      );

      setOrder(data);
    } catch (error) {
      console.error('Fetch order error:', error);

      Alert.alert(
        'Error',
        'Unable to load order details.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrder();
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Date unavailable';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return '';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatus = () => {
    return String(
      order?.status || 'Pending'
    ).toLowerCase();
  };

  const isCancelled =
    getStatus() === 'cancelled' ||
    getStatus() === 'canceled';

  const isDelivered =
    getStatus() === 'delivered';

  const isOutForDelivery =
    getStatus() === 'out for delivery';

  const isShipped =
    getStatus() === 'shipped';

  const isConfirmed =
    getStatus() === 'confirmed' ||
    getStatus() === 'processing';

  const isPlaced =
    !!order;

  const getStepState = (
    step: number
  ) => {
    if (isCancelled) {
      return step === 1
        ? 'completed'
        : 'inactive';
    }

    if (step === 1 && isPlaced) {
      return 'completed';
    }

    if (
      step === 2 &&
      (isConfirmed ||
        isShipped ||
        isOutForDelivery ||
        isDelivered)
    ) {
      return 'completed';
    }

    if (
      step === 3 &&
      (isShipped ||
        isOutForDelivery ||
        isDelivered)
    ) {
      return 'completed';
    }

    if (
      step === 4 &&
      (isOutForDelivery ||
        isDelivered)
    ) {
      return 'completed';
    }

    if (step === 5 && isDelivered) {
      return 'completed';
    }

    if (
      (step === 2 && !isConfirmed) ||
      (step === 3 && !isShipped) ||
      (step === 4 && !isOutForDelivery) ||
      (step === 5 && !isDelivered)
    ) {
      return 'current';
    }

    return 'inactive';
  };

  const getItemName = (item: OrderItem) => {
    return (
      item.description ||
      item.title ||
      item.name ||
      'Product'
    );
  };

  const getItemPrice = (item: OrderItem) => {
    const amount =
      item.amount ??
      item.price ??
      0;

    return Number(amount).toFixed(2);
  };

  const getQuantity = (item: OrderItem) => {
    return Number(item.quantity || 1);
  };

  const getTotal = () => {
    return Number(
      order?.totalCost ??
        order?.total ??
        0
    ).toFixed(2);
  };

  const items =
    order?.items ||
    order?.orderItems ||
    [];

  const address =
    order?.orderAddress ||
    order?.address;

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{ headerShown: false }}
        />

        <Header />

        <SafeAreaView
          edges={['bottom']}
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color="#2E7D32"
          />

          <Text style={styles.loadingText}>
            Loading order...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{ headerShown: false }}
        />

        <Header />

        <SafeAreaView
          edges={['bottom']}
          style={styles.emptyContainer}
        >
          <Ionicons
            name="alert-circle-outline"
            size={55}
            color="#2E7D32"
          />

          <Text style={styles.emptyTitle}>
            Order Not Found
          </Text>

          <Text style={styles.emptyText}>
            We could not load this order.
          </Text>

          <View style={styles.backButton}>
            <Text
              style={styles.backButtonText}
              onPress={() =>
                router.replace('/orders')
              }
            >
              Back to My Orders
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ headerShown: false }}
      />

      <Header />

      <SafeAreaView
        edges={['bottom']}
        style={styles.safeArea}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2E7D32']}
            />
          }
        >
          {/* Header */}
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>
                Order #{order.id}
              </Text>

              <Text style={styles.pageSubtitle}>
                Placed on{' '}
                {formatDate(order.createdAt)}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {order.status || 'Pending'}
              </Text>
            </View>
          </View>

          {/* Tracking */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Track Order
            </Text>

            {isCancelled ? (
              <View style={styles.cancelledBox}>
                <Ionicons
                  name="close-circle"
                  size={25}
                  color="#D32F2F"
                />

                <View style={styles.cancelledContent}>
                  <Text
                    style={styles.cancelledTitle}
                  >
                    Order Cancelled
                  </Text>

                  <Text
                    style={styles.cancelledText}
                  >
                    This order has been cancelled.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.timeline}>
                <TrackingStep
                  title="Order Placed"
                  subtitle={
                    order.createdAt
                      ? formatDateTime(
                          order.createdAt
                        )
                      : 'Order received'
                  }
                  state={getStepState(1)}
                  icon="receipt-outline"
                  isLast={false}
                />

                <TrackingStep
                  title="Order Confirmed"
                  subtitle="Your order has been confirmed"
                  state={getStepState(2)}
                  icon="checkmark-circle-outline"
                  isLast={false}
                />

                <TrackingStep
                  title="Shipped"
                  subtitle="Your order is on the way"
                  state={getStepState(3)}
                  icon="cube-outline"
                  isLast={false}
                />

                <TrackingStep
                  title="Out for Delivery"
                  subtitle="Your order is with the delivery partner"
                  state={getStepState(4)}
                  icon="car-outline"
                  isLast={false}
                />

                <TrackingStep
                  title="Delivered"
                  subtitle="Order delivered successfully"
                  state={getStepState(5)}
                  icon="checkmark-done-outline"
                  isLast
                />
              </View>
            )}
          </View>

          {/* Order Items */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Order Items
            </Text>

            {items.length === 0 ? (
              <Text style={styles.noItemsText}>
                No item information available.
              </Text>
            ) : (
              items.map((item, index) => {
                const quantity =
                  getQuantity(item);

                const unitPrice =
                  Number(
                    item.price ??
                      item.amount ??
                      0
                  );

                const lineTotal =
                  item.amount !== undefined
                    ? Number(item.amount)
                    : unitPrice * quantity;

                return (
                  <View
                    key={
                      item.id ??
                      `${item.productId}-${index}`
                    }
                    style={[
                      styles.itemRow,
                      index !==
                        items.length - 1 &&
                        styles.itemBorder,
                    ]}
                  >
                    <View style={styles.itemIcon}>
                      <Ionicons
                        name="cube-outline"
                        size={22}
                        color="#2E7D32"
                      />
                    </View>

                    <View style={styles.itemInfo}>
                      <Text
                        style={styles.itemName}
                        numberOfLines={2}
                      >
                        {getItemName(item)}
                      </Text>

                      <Text
                        style={styles.itemQuantity}
                      >
                        Qty: {quantity}
                      </Text>
                    </View>

                    <Text
                      style={styles.itemPrice}
                    >
                      ₹{lineTotal.toFixed(2)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {/* Delivery Address */}
          {address && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Delivery Address
              </Text>

              <View style={styles.addressHeader}>
                <View style={styles.addressIcon}>
                  <Ionicons
                    name="location-outline"
                    size={21}
                    color="#2E7D32"
                  />
                </View>

                <View style={styles.addressContent}>
                  <Text
                    style={styles.addressName}
                  >
                    {address.fullName ||
                      'Customer'}
                  </Text>

                  {address.mobile ? (
                    <Text
                      style={styles.addressMobile}
                    >
                      {address.mobile}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text style={styles.addressText}>
                {[
                  address.houseNo,
                  address.addressLine1,
                  address.addressLine2,
                  address.landmark,
                  address.city,
                  address.state,
                  address.pincode,
                  address.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
          )}

          {/* Payment */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Payment Information
            </Text>

            <InfoRow
              label="Payment Method"
              value={
                order.paymentMethod ||
                'Not available'
              }
            />

            <InfoRow
              label="Payment Status"
              value={
                order.paymentStatus ||
                'Pending'
              }
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Total Amount
              </Text>

              <Text style={styles.totalValue}>
                ₹{getTotal()}
              </Text>
            </View>
          </View>

          {/* Order information */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Order Information
            </Text>

            <InfoRow
              label="Order ID"
              value={String(order.id)}
            />

            <InfoRow
              label="Order Date"
              value={formatDateTime(
                order.createdAt
              )}
            />

            {order.updatedAt ? (
              <InfoRow
                label="Last Updated"
                value={formatDateTime(
                  order.updatedAt
                )}
              />
            ) : null}
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type TrackingStepProps = {
  title: string;
  subtitle: string;
  state:
    | 'completed'
    | 'current'
    | 'inactive';
  icon: keyof typeof Ionicons.glyphMap;
  isLast?: boolean;
};

function TrackingStep({
  title,
  subtitle,
  state,
  icon,
  isLast = false,
}: TrackingStepProps) {
  const isCompleted =
    state === 'completed';

  const isCurrent =
    state === 'current';

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepLeft}>
        <View
          style={[
            styles.stepCircle,
            isCompleted &&
              styles.stepCircleCompleted,
            isCurrent &&
              styles.stepCircleCurrent,
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={
              isCompleted || isCurrent
                ? '#FFFFFF'
                : '#AAAAAA'
            }
          />
        </View>

        {!isLast && (
          <View
            style={[
              styles.stepLine,
              isCompleted &&
                styles.stepLineCompleted,
            ]}
          />
        )}
      </View>

      <View style={styles.stepContent}>
        <Text
          style={[
            styles.stepTitle,
            state === 'inactive' &&
              styles.stepTitleInactive,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.stepSubtitle,
            state === 'inactive' &&
              styles.stepSubtitleInactive,
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  safeArea: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#777777',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 25,
  },

  pageHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222222',
  },

  pageSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#888888',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },

  card: {
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  cardTitle: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '800',
    color: '#222222',
  },

  timeline: {
    paddingTop: 2,
  },

  stepRow: {
    minHeight: 72,
    flexDirection: 'row',
  },

  stepLeft: {
    width: 42,
    alignItems: 'center',
  },

  stepCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#EEEEEE',
  },

  stepCircleCompleted: {
    backgroundColor: '#2E7D32',
  },

  stepCircleCurrent: {
    backgroundColor: '#66BB6A',
  },

  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 3,
    backgroundColor: '#EEEEEE',
  },

  stepLineCompleted: {
    backgroundColor: '#2E7D32',
  },

  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 1,
  },

  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  stepTitleInactive: {
    color: '#AAAAAA',
  },

  stepSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: '#777777',
  },

  stepSubtitleInactive: {
    color: '#AAAAAA',
  },

  cancelledBox: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
  },

  cancelledContent: {
    marginLeft: 10,
  },

  cancelledTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D32F2F',
  },

  cancelledText: {
    marginTop: 3,
    fontSize: 11,
    color: '#888888',
  },

  itemRow: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  itemIcon: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#E8F5E9',
  },

  itemInfo: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 8,
  },

  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
  },

  itemQuantity: {
    marginTop: 4,
    fontSize: 11,
    color: '#888888',
  },

  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#333333',
  },

  noItemsText: {
    fontSize: 12,
    color: '#888888',
  },

  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  addressIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
  },

  addressContent: {
    flex: 1,
    marginLeft: 11,
  },

  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  addressMobile: {
    marginTop: 3,
    fontSize: 11,
    color: '#888888',
  },

  addressText: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 19,
    color: '#666666',
  },

  infoRow: {
    minHeight: 37,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },

  infoLabel: {
    fontSize: 12,
    color: '#888888',
  },

  infoValue: {
    maxWidth: '58%',
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'right',
  },

  totalRow: {
    marginTop: 12,
    paddingTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#222222',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E7D32',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: '800',
    color: '#222222',
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    color: '#888888',
  },

  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9,
    backgroundColor: '#E8F5E9',
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },

  bottomSpace: {
    height: 10,
  },
});