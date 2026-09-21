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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleLogin = async () => {
    setError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      await login(
        trimmedEmail,
        password
      );

      router.replace('/account');
    } catch (err: any) {
      console.error(
        'Login screen error:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid email or password. Please try again.';

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

          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>
                KVK
              </Text>
            </View>

            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Login to your KVK account
            </Text>
          </View>

          <View style={styles.form}>
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
                placeholder="Enter your password"
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
                    (previous) =>
                      !previous
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
                styles.loginButton,
                loading &&
                  styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
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
                    styles.loginButtonText
                  }
                >
                  Login
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.forgotButton}
              disabled={loading}
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          <View style={styles.signupSection}>
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>

            <Link
              href="/signup"
              asChild
            >
              <Pressable
                disabled={loading}
              >
                <Text
                  style={
                    styles.signupLink
                  }
                >
                  Create Account
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
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },

  backButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },

  backText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333333',
  },

  logoSection: {
    alignItems: 'center',
    marginTop: 35,
  },

  logoCircle: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },

  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: 1,
  },

  title: {
    marginTop: 22,
    fontSize: 27,
    fontWeight: '800',
    color: '#222222',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#777777',
  },

  form: {
    marginTop: 35,
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
    marginBottom: 18,
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

  errorBox: {
    marginBottom: 14,
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

  loginButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  forgotButton: {
    alignSelf: 'center',
    marginTop: 17,
    padding: 5,
  },

  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },

  signupSection: {
    marginTop: 'auto',
    paddingTop: 40,
    alignItems: 'center',
  },

  signupText: {
    fontSize: 13,
    color: '#777777',
  },

  signupLink: {
    marginTop: 7,
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
});
