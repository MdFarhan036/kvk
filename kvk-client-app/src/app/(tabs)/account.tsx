import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header/Header';
import { useCustomerAuth } from '@/context/CustomerContext';

export default function AccountScreen() {
  const router = useRouter();

  const {
    customer,
    loading,
    logout,
  } = useCustomerAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
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
            Loading account...
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.guestContent
            }
          >
            <View style={styles.guestIcon}>
              <Ionicons
                name="person-outline"
                size={42}
                color="#2E7D32"
              />
            </View>

            <Text style={styles.title}>
              My Account
            </Text>

            <Text style={styles.subtitle}>
              Login to manage your KVK account,
              orders and wishlist.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                router.push('/login')
              }
            >
              <Ionicons
                name="log-in-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.primaryButtonText}>
                Login
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                router.push('/signup')
              }
            >
              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Create Account
              </Text>
            </Pressable>

            <View style={styles.guestOptions}>
              <AccountOption
                icon="receipt-outline"
                title="My Orders"
                subtitle="View your orders"
                onPress={() =>
                  router.push('/orders' as any)
                }
              />

              <AccountOption
                icon="heart-outline"
                title="Wishlist"
                subtitle="Your saved products"
                onPress={() =>
                  router.push('/wishlist')
                }
              />

              <AccountOption
                icon="location-outline"
                title="Addresses"
                subtitle="Manage delivery addresses"
                onPress={() =>
                  router.push(
                    '/addresses' as any
                  )
                }
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  const customerName =
    typeof customer.name === 'string' &&
    customer.name.trim()
      ? customer.name.trim()
      : 'KVK Customer';

  const customerEmail =
    typeof customer.email === 'string'
      ? customer.email
      : '';

  return (
    <View style={styles.container}>
      <Header />

      <SafeAreaView
        edges={['bottom']}
        style={styles.safeArea}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.loggedInContent
          }
        >
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {customerName
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text
                style={styles.profileName}
                numberOfLines={1}
              >
                {customerName}
              </Text>

              {customerEmail ? (
                <Text
                  style={styles.profileEmail}
                  numberOfLines={1}
                >
                  {customerEmail}
                </Text>
              ) : null}

              <View style={styles.memberBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#2E7D32"
                />

                <Text style={styles.memberText}>
                  KVK Customer
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            My Account
          </Text>

          <View style={styles.optionsCard}>
            <AccountOption
              icon="receipt-outline"
              title="My Orders"
              subtitle="Track and manage your orders"
              onPress={() =>
                router.push('/orders' as any)
              }
            />

            <AccountOption
              icon="heart-outline"
              title="Wishlist"
              subtitle="View your saved products"
              onPress={() =>
                router.push('/wishlist')
              }
            />

            <AccountOption
              icon="location-outline"
              title="Delivery Addresses"
              subtitle="Manage your saved addresses"
              onPress={() =>
                router.push(
                  '/addresses' as any
                )
              }
            />

            <AccountOption
              icon="person-outline"
              title="Profile"
              subtitle="Manage your personal details"
              onPress={() =>
                router.push(
                  '/profile' as any
                )
              }
            />

            <AccountOption
              icon="settings-outline"
              title="Settings"
              subtitle="Manage app preferences"
              onPress={() =>
                router.push(
                  '/settings' as any
                )
              }
              showDivider={false}
            />
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#D32F2F"
            />

            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>

          <Text style={styles.versionText}>
            KVK Mobile App
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type AccountOptionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  showDivider?: boolean;
};

function AccountOption({
  icon,
  title,
  subtitle,
  onPress,
  showDivider = true,
}: AccountOptionProps) {
  return (
    <Pressable
      style={styles.option}
      onPress={onPress}
    >
      <View style={styles.optionIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#2E7D32"
        />
      </View>

      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>
          {title}
        </Text>

        <Text style={styles.optionSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#AAAAAA"
      />

      {showDivider && (
        <View style={styles.divider} />
      )}
    </Pressable>
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

  guestContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 38,
    paddingBottom: 30,
    alignItems: 'center',
  },

  guestIcon: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 43,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },

  title: {
    marginTop: 20,
    fontSize: 25,
    fontWeight: '800',
    color: '#222222',
  },

  subtitle: {
    maxWidth: 330,
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    color: '#777777',
    textAlign: 'center',
  },

  primaryButton: {
    width: '100%',
    height: 50,
    marginTop: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  secondaryButton: {
    width: '100%',
    height: 50,
    marginTop: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },

  guestOptions: {
    width: '100%',
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  loggedInContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
  },

  profileCard: {
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
  },

  avatar: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    backgroundColor: '#2E7D32',
  },

  avatarText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
  },

  profileEmail: {
    marginTop: 3,
    fontSize: 12,
    color: '#666666',
  },

  memberBadge: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  memberText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 11,
    fontSize: 19,
    fontWeight: '700',
    color: '#222222',
  },

  optionsCard: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  option: {
    minHeight: 72,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  optionIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
  },

  optionContent: {
    flex: 1,
    marginLeft: 12,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  optionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#888888',
  },

  divider: {
    position: 'absolute',
    left: 67,
    right: 13,
    bottom: 0,
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  logoutButton: {
    height: 50,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 10,
    backgroundColor: '#FFF8F8',
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D32F2F',
  },

  versionText: {
    marginTop: 20,
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'center',
  },
});
