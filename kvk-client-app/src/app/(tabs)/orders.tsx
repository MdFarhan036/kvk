import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '@/api/axios';
import Header from '@/components/Header/Header';
import { useCustomerAuth } from '@/context/CustomerContext';

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

type Order = {
  id: number;
  orderNumber?: string;
  createdAt?: string;
  totalCost?: number | string;
  total?: number | string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  items?: OrderItem[];
};

export default function OrdersScreen() {
  const router = useRouter();
  const { customer, loading: authLoading } = useCustomerAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!customer) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/orders/my-orders');

      const orderList =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : Array.isArray(data?.orders)
              ? data.orders
              : [];

      setOrders(orderList);
    } catch (error) {
      console.error('Fetch orders error:', error);

      Alert.alert(
        'Error',
        'Unable to load your orders.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customer]);

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading, fetchOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const getOrderTotal = (order: Order) => {
    const total =
      order.totalCost ??
      order.total ??
      0;

    return Number(total).toFixed(2);
  };

  const getOrderStatus = (status?: string) => {
    const value = String(status || 'Pending').toLowerCase();

    if (value === 'delivered') {
      return {
        label: 'Delivered',
        icon: 'checkmark-circle',
      };
    }

    if (
      value === 'shipped' ||
      value === 'out for delivery'
    ) {
      return {
        label: status || 'Shipped',
        icon: 'car-outline',
      };
    }

    if (
      value === 'confirmed' ||
      value === 'processing'
    ) {
      return {
        label: status || 'Confirmed',
        icon: 'cube-outline',
      };
    }

    if (
      value === 'cancelled' ||
      value === 'canceled'
    ) {
      return {
        label: status || 'Cancelled',
        icon: 'close-circle',
      };
    }

    return {
      label: status || 'Pending',
      icon: 'time-outline',
    };
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

  if (authLoading || loading) {
    return (
      <View style={styles.container}>
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
            Loading orders...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.container}>
        <Header />

        <SafeAreaView
          edges={['bottom']}
          style={styles.safeArea}
        >
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={42}
                color="#2E7D32"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Login Required
            </Text>

            <Text style={styles.emptyText}>
              Login to view and track your orders.
            </Text>

            <Pressable
              style={styles.shopButton}
              onPress={() =>
                router.push('/login')
              }
            >
              <Text style={styles.shopButtonText}>
                Login
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>
                My Orders
              </Text>

              <Text style={styles.pageSubtitle}>
                Track and manage your orders
              </Text>
            </View>

            <View style={styles.orderCount}>
              <Text style={styles.orderCountText}>
                {orders.length}
              </Text>
            </View>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={42}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No Orders Yet
              </Text>

              <Text style={styles.emptyText}>
                Your placed orders will appear here.
              </Text>

              <Pressable
                style={styles.shopButton}
                onPress={() =>
                  router.push('/')
                }
              >
                <Text style={styles.shopButtonText}>
                  Start Shopping
                </Text>
              </Pressable>
            </View>
          ) : (
            orders.map((order) => {
              const status = getOrderStatus(
                order.status
              );

              const itemCount =
                order.items?.reduce(
                  (total, item) =>
                    total +
                    Number(item.quantity || 1),
                  0
                ) || 0;

              return (
                <View
                  key={order.id}
                  style={styles.orderCard}
                >
                  <View style={styles.orderTop}>
                    <View>
                      <Text
                        style={styles.orderNumber}
                      >
                        Order #{order.id}
                      </Text>

                      <Text
                        style={styles.orderDate}
                      >
                        {formatDate(
                          order.createdAt
                        )}
                      </Text>
                    </View>

                    <View style={styles.statusBadge}>
                      <Ionicons
                        name={
                          status.icon as any
                        }
                        size={15}
                        color="#2E7D32"
                      />

                      <Text
                        style={
                          styles.statusText
                        }
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.orderInfo}>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="cube-outline"
                        size={18}
                        color="#777777"
                      />

                      <View>
                        <Text
                          style={styles.infoLabel}
                        >
                          Items
                        </Text>

                        <Text
                          style={styles.infoValue}
                        >
                          {itemCount}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoItem}>
                      <Ionicons
                        name="cash-outline"
                        size={18}
                        color="#777777"
                      />

                      <View>
                        <Text
                          style={styles.infoLabel}
                        >
                          Total
                        </Text>

                        <Text
                          style={styles.infoValue}
                        >
                          ₹{getOrderTotal(order)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={styles.trackButton}
                      onPress={() =>
                        router.push({
                          pathname:
                            '/orders/[orderId]',
                          params: {
                            orderId:
                              String(order.id),
                          },
                        })
                      }
                    >
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.trackButtonText
                        }
                      >
                        Track Order
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.detailsButton}
                      onPress={() =>
                        router.push({
                          pathname:
                            '/orders/[orderId]',
                          params: {
                            orderId:
                              String(order.id),
                          },
                        })
                      }
                    >
                      <Text
                        style={
                          styles.detailsButtonText
                        }
                      >
                        Details
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color="#2E7D32"
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })
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
    paddingBottom: 30,
  },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  pageTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#222222',
  },

  pageSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#888888',
  },

  orderCount: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#E8F5E9',
  },

  orderCountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2E7D32',
  },

  orderCard: {
    marginBottom: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  orderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#222222',
  },

  orderDate: {
    marginTop: 4,
    fontSize: 11,
    color: '#888888',
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },

  statusText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },

  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: '#EEEEEE',
  },

  orderInfo: {
    flexDirection: 'row',
    gap: 35,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  infoLabel: {
    fontSize: 10,
    color: '#999999',
  },

  infoValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
  },

  actionRow: {
    marginTop: 15,
    flexDirection: 'row',
    gap: 9,
  },

  trackButton: {
    flex: 1,
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
  },

  trackButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  detailsButton: {
    height: 43,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },

  detailsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 43,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '800',
    color: '#222222',
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
  },

  shopButton: {
    minWidth: 170,
    height: 45,
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#2E7D32',
  },

  shopButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});