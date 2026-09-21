import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header/Header';
import { useCustomerAuth } from '@/context/CustomerContext';

export default function ProfileScreen() {
  const router = useRouter();

  const { customer, loading } =
    useCustomerAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />

        <SafeAreaView
          edges={['bottom']}
          style={styles.centerContainer}
        >
          <Text style={styles.loadingText}>
            Loading profile...
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
          style={styles.centerContainer}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="person-outline"
              size={40}
              color="#2E7D32"
            />
          </View>

          <Text style={styles.title}>
            Login Required
          </Text>

          <Text style={styles.subtitle}>
            Please login to view your profile.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              router.push('/login')
            }
          >
            <Text
              style={styles.primaryButtonText}
            >
              Login
            </Text>
          </Pressable>
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
        >
          <View style={styles.topBar}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#222222"
              />

              <Text style={styles.backText}>
                Back
              </Text>
            </Pressable>

            <Text style={styles.pageTitle}>
              My Profile
            </Text>

            <View style={styles.spacer} />
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(customer.name || 'K')
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <Text style={styles.profileName}>
              {customer.name || 'KVK Customer'}
            </Text>

            <Text style={styles.profileEmail}>
              {customer.email || ''}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Personal Information
            </Text>

            <ProfileRow
              icon="person-outline"
              label="Full Name"
              value={
                customer.name ||
                'Not provided'
              }
            />

            <ProfileRow
              icon="mail-outline"
              label="Email"
              value={
                customer.email ||
                'Not provided'
              }
            />

            <ProfileRow
              icon="call-outline"
              label="Mobile"
              value={
                typeof customer.mobile ===
                'string'
                  ? customer.mobile
                  : 'Not provided'
              }
              showDivider={false}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Delivery Address
            </Text>

            <ProfileRow
              icon="location-outline"
              label="Address"
              value={
                typeof customer.address ===
                'string'
                  ? customer.address
                  : 'Not provided'
              }
            />

            <ProfileRow
              icon="business-outline"
              label="City"
              value={
                typeof customer.city ===
                'string'
                  ? customer.city
                  : 'Not provided'
              }
            />

            <ProfileRow
              icon="map-outline"
              label="State"
              value={
                typeof customer.state ===
                'string'
                  ? customer.state
                  : 'Not provided'
              }
            />

            <ProfileRow
              icon="navigate-outline"
              label="Pincode"
              value={
                typeof customer.pincode ===
                'string'
                  ? customer.pincode
                  : 'Not provided'
              }
              showDivider={false}
            />
          </View>

          <Pressable
            style={styles.editButton}
            onPress={() =>
              router.push(
                '/edit-profile' as any
              )
            }
          >
            <Ionicons
              name="create-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text
              style={styles.editButtonText}
            >
              Edit Profile
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  showDivider?: boolean;
};

function ProfileRow({
  icon,
  label,
  value,
  showDivider = true,
}: ProfileRowProps) {
  return (
    <View style={styles.profileRow}>
      <View style={styles.rowIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#2E7D32"
        />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>
          {label}
        </Text>

        <Text style={styles.rowValue}>
          {value}
        </Text>
      </View>

      {showDivider && (
        <View style={styles.rowDivider} />
      )}
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

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  loadingText: {
    fontSize: 14,
    color: '#777777',
  },

  iconCircle: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor: '#E8F5E9',
  },

  title: {
    marginTop: 18,
    fontSize: 23,
    fontWeight: '800',
    color: '#222222',
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },

  primaryButton: {
    minWidth: 150,
    height: 48,
    marginTop: 22,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#2E7D32',
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 75,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backText: {
    marginLeft: 5,
    fontSize: 13,
    color: '#444444',
  },

  pageTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#222222',
  },

  spacer: {
    width: 75,
  },

  profileHeader: {
    alignItems: 'center',
    paddingVertical: 18,
  },

  avatar: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 46,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },

  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#2E7D32',
  },

  profileName: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: '800',
    color: '#222222',
  },

  profileEmail: {
    marginTop: 4,
    fontSize: 13,
    color: '#777777',
  },

  card: {
    marginTop: 17,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  cardTitle: {
    paddingTop: 15,
    paddingBottom: 5,
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },

  profileRow: {
    minHeight: 67,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  rowIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#E8F5E9',
  },

  rowContent: {
    flex: 1,
    marginLeft: 11,
  },

  rowLabel: {
    fontSize: 10,
    color: '#888888',
  },

  rowValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: '#333333',
  },

  rowDivider: {
    position: 'absolute',
    left: 49,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  editButton: {
    height: 50,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },

  editButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
