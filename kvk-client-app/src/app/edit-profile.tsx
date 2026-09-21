import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header/Header';
import { useCustomerAuth } from '@/context/CustomerContext';

export default function EditProfileScreen() {
  const router = useRouter();

  const {
    customer,
    loading,
    updateProfile,
  } = useCustomerAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!customer) return;

    setName(
      typeof customer.name === 'string'
        ? customer.name
        : ''
    );

    setEmail(
      typeof customer.email === 'string'
        ? customer.email
        : ''
    );

    setMobile(
      typeof customer.mobile === 'string'
        ? customer.mobile
        : ''
    );

    setAddress(
      typeof customer.address === 'string'
        ? customer.address
        : ''
    );

    setCity(
      typeof customer.city === 'string'
        ? customer.city
        : ''
    );

    setState(
      typeof customer.state === 'string'
        ? customer.state
        : ''
    );

    setPincode(
      typeof customer.pincode === 'string'
        ? customer.pincode
        : ''
    );
  }, [customer]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const trimmedAddress = address.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedPincode = pincode.trim();

    if (!trimmedName) {
      Alert.alert(
        'Required',
        'Please enter your name.'
      );
      return;
    }

    if (!trimmedMobile) {
      Alert.alert(
        'Required',
        'Please enter your mobile number.'
      );
      return;
    }

    if (
      !/^\d{10}$/.test(trimmedMobile)
    ) {
      Alert.alert(
        'Invalid Mobile',
        'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (
      trimmedPincode &&
      !/^\d{6}$/.test(trimmedPincode)
    ) {
      Alert.alert(
        'Invalid Pincode',
        'Please enter a valid 6-digit pincode.'
      );
      return;
    }

    setSaving(true);

    try {
      console.log(
        '⏳ KVK: Updating customer profile...'
      );

      const updatedCustomer =
        await updateProfile({
          name: trimmedName,
          mobile: trimmedMobile,
          address: trimmedAddress,
          city: trimmedCity,
          state: trimmedState,
          pincode: trimmedPincode,
        });

      console.log(
        '✅ KVK: Profile updated:',
        updatedCustomer
      );

      Alert.alert(
        'Success',
        'Your profile has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(
        '🔥 KVK: Profile update failed:',
        error?.response?.data ?? error
      );

      const message =
        error?.response?.data?.message ||
        'Unable to update your profile. Please try again.';

      Alert.alert(
        'Update Failed',
        message
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />

        <SafeAreaView
          edges={['bottom']}
          style={styles.center}
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
          style={styles.center}
        >
          <View style={styles.lockIcon}>
            <Ionicons
              name="lock-closed-outline"
              size={34}
              color="#2E7D32"
            />
          </View>

          <Text style={styles.loginTitle}>
            Login Required
          </Text>

          <Text style={styles.loginText}>
            Please login to edit your profile.
          </Text>

          <Pressable
            style={styles.loginButton}
            onPress={() =>
              router.push('/login')
            }
          >
            <Text style={styles.loginButtonText}>
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
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <View style={styles.topBar}>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={saving}
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
                Edit Profile
              </Text>

              <View style={styles.spacer} />
            </View>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(name || 'K')
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <Text style={styles.avatarHint}>
              Profile Information
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>
                Personal Information
              </Text>

              <InputField
                label="Full Name"
                icon="person-outline"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
              />

              <InputField
                label="Email"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                editable={false}
              />

              <InputField
                label="Mobile Number"
                icon="call-outline"
                value={mobile}
                onChangeText={setMobile}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>
                Delivery Address
              </Text>

              <InputField
                label="Address"
                icon="location-outline"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                multiline
              />

              <InputField
                label="City"
                icon="business-outline"
                value={city}
                onChangeText={setCity}
                placeholder="Enter city"
              />

              <InputField
                label="State"
                icon="map-outline"
                value={state}
                onChangeText={setState}
                placeholder="Enter state"
              />

              <InputField
                label="Pincode"
                icon="navigate-outline"
                value={pincode}
                onChangeText={setPincode}
                placeholder="6-digit pincode"
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <Pressable
              style={[
                styles.saveButton,
                saving &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons
                name={
                  saving
                    ? 'hourglass-outline'
                    : 'save-outline'
                }
                size={19}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type InputFieldProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  editable?: boolean;
  keyboardType?:
    | 'default'
    | 'phone-pad'
    | 'number-pad';
  maxLength?: number;
  multiline?: boolean;
};

function InputField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  editable = true,
  keyboardType = 'default',
  maxLength,
  multiline = false,
}: InputFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          !editable &&
            styles.inputDisabled,
          multiline &&
            styles.multilineContainer,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            editable
              ? '#2E7D32'
              : '#AAAAAA'
          }
          style={styles.inputIcon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          editable={editable}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          textAlignVertical={
            multiline ? 'top' : 'center'
          }
          style={[
            styles.input,
            multiline &&
              styles.multilineInput,
          ]}
        />
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

  keyboard: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  loadingText: {
    fontSize: 14,
    color: '#777777',
  },

  lockIcon: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
    backgroundColor: '#E8F5E9',
  },

  loginTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '800',
    color: '#222222',
  },

  loginText: {
    marginTop: 7,
    fontSize: 14,
    color: '#777777',
  },

  loginButton: {
    minWidth: 140,
    height: 47,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#2E7D32',
  },

  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 35,
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

  avatar: {
    width: 86,
    height: 86,
    marginTop: 8,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 43,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },

  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2E7D32',
  },

  avatarHint: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
  },

  formCard: {
    marginTop: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },

  sectionTitle: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },

  inputGroup: {
    marginTop: 14,
  },

  inputLabel: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },

  inputContainer: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },

  inputDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E5E5E5',
  },

  multilineContainer: {
    minHeight: 88,
    alignItems: 'flex-start',
  },

  inputIcon: {
    marginLeft: 13,
  },

  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 11,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222222',
  },

  multilineInput: {
    minHeight: 80,
  },

  saveButton: {
    height: 51,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cancelButton: {
    height: 48,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
});
