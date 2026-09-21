import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header/Header';

export default function OrderSuccessScreen() {
  const router = useRouter();

  const { orderId } = useLocalSearchParams<{
    orderId?: string;
  }>();

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
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successIcon}>
            <Ionicons
              name="checkmark"
              size={48}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.title}>
            Order Placed Successfully!
          </Text>

          <Text style={styles.subtitle}>
            Thank you for shopping with KVK.
            Your order has been received and
            is being processed.
          </Text>

          {orderId ? (
            <View style={styles.orderBox}>
              <Text style={styles.orderLabel}>
                Order Number
              </Text>

              <Text style={styles.orderNumber}>
                #{orderId}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoCard}>
            <SuccessInfo
              icon="receipt-outline"
              title="Order Confirmed"
              subtitle="Your order has been successfully placed."
            />

            <SuccessInfo
              icon="location-outline"
              title="Track Your Order"
              subtitle="You can check your order status anytime."
            />

            <SuccessInfo
              icon="cash-outline"
              title="Cash on Delivery"
              subtitle="Payment will be collected at delivery."
            />
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              if (orderId) {
                router.push({
                  pathname: '/orders/[orderId]',
                  params: {
                    orderId: String(orderId),
                  },
                });
              } else {
                router.push('/orders');
              }
            }}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.primaryButtonText}>
              Track Order
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.replace('/orders')
            }
          >
            <Ionicons
              name="receipt-outline"
              size={19}
              color="#2E7D32"
            />

            <Text style={styles.secondaryButtonText}>
              My Orders
            </Text>
          </Pressable>

          <Pressable
            style={styles.continueButton}
            onPress={() =>
              router.replace('/')
            }
          >
            <Text style={styles.continueText}>
              Continue Shopping
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SuccessInfo({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#2E7D32"
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>
          {title}
        </Text>

        <Text style={styles.infoSubtitle}>
          {subtitle}
        </Text>
      </View>
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

  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 35,
  },

  successIcon: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 46,
    backgroundColor: '#2E7D32',
  },

  title: {
    marginTop: 22,
    fontSize: 23,
    fontWeight: '800',
    color: '#222222',
    textAlign: 'center',
  },

  subtitle: {
    maxWidth: 340,
    marginTop: 9,
    fontSize: 13,
    lineHeight: 20,
    color: '#777777',
    textAlign: 'center',
  },

  orderBox: {
    width: '100%',
    marginTop: 23,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },

  orderLabel: {
    fontSize: 11,
    color: '#777777',
  },

  orderNumber: {
    marginTop: 4,
    fontSize: 19,
    fontWeight: '800',
    color: '#2E7D32',
  },

  infoCard: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },

  infoRow: {
    minHeight: 73,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
  },

  infoSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#888888',
  },

  primaryButton: {
    width: '100%',
    height: 49,
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  secondaryButton: {
    width: '100%',
    height: 49,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },

  continueButton: {
    marginTop: 17,
    paddingVertical: 8,
  },

  continueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777777',
  },
});