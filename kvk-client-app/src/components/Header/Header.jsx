import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Header() {
  const router = useRouter();

  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  const cartCount = cartItems?.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  ) || 0;

  const wishlistCount =
    wishlistItems?.length || 0;

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.safeArea}
    >
      <View style={styles.header}>

        {/* ==================================================
            KVK BRAND
        ================================================== */}

        <Pressable
          style={styles.brand}
          onPress={() => router.push('/')}
        >
          <Text style={styles.logo}>
            KVK
          </Text>

          <Text style={styles.tagline}>
            Krishi Vikas Kendra
          </Text>
        </Pressable>

        {/* ==================================================
            HEADER ACTIONS
        ================================================== */}

        <View style={styles.actions}>

          {/* SEARCH */}

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push('/search')
            }
            accessibilityLabel="Search"
          >
            <Ionicons
              name="search-outline"
              size={23}
              color="#222222"
            />
          </Pressable>

          {/* WISHLIST */}

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push('/wishlist')
            }
            accessibilityLabel="Wishlist"
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name="heart-outline"
                size={24}
                color="#222222"
              />

              {wishlistCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {wishlistCount > 99
                      ? '99+'
                      : wishlistCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

          {/* CART */}

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push('/cart')
            }
            accessibilityLabel="Cart"
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name="cart-outline"
                size={25}
                color="#222222"
              />

              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99
                      ? '99+'
                      : cartCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },

  header: {
    minHeight: 68,
    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  brand: {
    justifyContent: 'center',
  },

  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2E7D32',
  },

  tagline: {
    marginTop: 2,
    fontSize: 10,
    color: '#666666',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionButton: {
    width: 42,
    height: 42,

    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapper: {
    position: 'relative',

    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    position: 'absolute',

    top: -7,
    right: -9,

    minWidth: 17,
    height: 17,

    paddingHorizontal: 4,

    borderRadius: 9,

    backgroundColor: '#D32F2F',

    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
});