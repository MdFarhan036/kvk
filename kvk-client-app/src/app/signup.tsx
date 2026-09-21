import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
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

import { useCustomerAuth } from '@/context/CustomerContext';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useCustomerAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleSignup = async () => {
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    if (!mobile.trim()) {
      setError('Please enter your mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (!address.trim()) {
      setError('Please enter your address.');
      return;
    }

    if (!city.trim()) {
      setError('Please enter your city.');
      return;
    }

    if (!state.trim()) {
      setError('Please enter your state.');
      return;
    }

    if (!pincode.trim()) {
      setError('Please enter your pincode.');
      return;
    }

    try {
      setLoading(true);

      const customer = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        mobile: mobile.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      });

      /*
       * If signup logged the customer in, go directly
       * to the account screen.
       *
       * Otherwise, send them to login.
       */
      if (customer) {
        router.replace('/account');
      } else {
        router.replace('/login');
      }
    } catch (err: any) {
      console.error(
        'Signup screen error:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to create your account. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
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

          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>
                KVK
              </Text>
            </View>

            <Text style={styles.title}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Join KVK and shop agricultural products
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              Full Name
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#999999"
                autoCapitalize="words"
                editable={!loading}
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>
              Email Address
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>
              Mobile Number
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                value={mobile}
                onChangeText={setMobile}
                placeholder="Enter your mobile number"
                placeholderTextColor="#999999"
                keyboardType="phone-pad"
                editable={!loading}
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>
              Password
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#999999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={styles.input}
              />

              <Pressable
                onPress={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                hitSlop={8}
              >
                <Ionicons
                  name={
                    showPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  size={20}
                  color="#777777"
                />
              </Pressable>
            </View>

            <Text style={styles.label}>
              Address
            </Text>

            <View
              style={[
                styles.inputContainer,
                styles.textAreaContainer,
              ]}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color="#777777"
                style={styles.textAreaIcon}
              />

              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                placeholderTextColor="#999999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
                style={[
                  styles.input,
                  styles.textArea,
                ]}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>
                  City
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor="#999999"
                    autoCapitalize="words"
                    editable={!loading}
                    style={styles.inputNoIcon}
                  />
                </View>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.label}>
                  State
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    value={state}
                    onChangeText={setState}
                    placeholder="State"
                    placeholderTextColor="#999999"
                    autoCapitalize="words"
                    editable={!loading}
                    style={styles.inputNoIcon}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.label}>
              Pincode
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="navigate-outline"
                size={20}
                color="#777777"
              />

              <TextInput
                value={pincode}
                onChangeText={setPincode}
                placeholder="Enter your pincode"
                placeholderTextColor="#999999"
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
                style={styles.input}
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#D32F2F"
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              style={[
                styles.signupButton,
                loading &&
                  styles.signupButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.signupButtonText
                  }
                >
                  Create Account
                </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.loginSection}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <Link
              href="/login"
              asChild
            >
              <Pressable disabled={loading}>
                <Text style={styles.loginLink}>
                  Login
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 35,
  },

  backButton: {
    marginTop: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  backText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333333',
  },

  header: {
    marginTop: 22,
    alignItems: 'center',
  },

  logoCircle: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },

  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: 1,
  },

  title: {
    marginTop: 17,
    fontSize: 25,
    fontWeight: '800',
    color: '#222222',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
  },

  form: {
    marginTop: 28,
  },

  label: {
    marginBottom: 7,
    marginLeft: 2,
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },

  inputContainer: {
    minHeight: 52,
    marginBottom: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  input: {
    flex: 1,
    minHeight: 50,
    marginLeft: 10,
    paddingVertical: 0,
    fontSize: 15,
    color: '#222222',
  },

  inputNoIcon: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 0,
    fontSize: 15,
    color: '#222222',
  },

  textAreaContainer: {
    minHeight: 88,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },

  textAreaIcon: {
    marginTop: 2,
  },

  textArea: {
    minHeight: 64,
    paddingTop: 0,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  halfField: {
    width: '48%',
  },

  errorBox: {
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF3F3',
  },

  errorText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    lineHeight: 17,
    color: '#D32F2F',
  },

  signupButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },

  signupButtonDisabled: {
    opacity: 0.7,
  },

  signupButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  loginSection: {
    marginTop: 28,
    alignItems: 'center',
  },

  loginText: {
    fontSize: 13,
    color: '#777777',
  },

  loginLink: {
    marginTop: 7,
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
});
