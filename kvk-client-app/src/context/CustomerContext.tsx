import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

import api from '@/api/axios';

type Customer = {
  id?: number | string;
  name?: string;
  email?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt?: string;
  profileImage?: string | null;
  [key: string]: unknown;
};

type SignupData = {
  name: string;
  email: string;
  password: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type UpdateProfileData = {
  name: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type CustomerContextType = {
  customer: Customer | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<Customer | null>;

  signup: (
    data: SignupData
  ) => Promise<Customer | null>;

  updateProfile: (
    data: UpdateProfileData
  ) => Promise<Customer | null>;

  logout: () => Promise<void>;

  checkAuth: () => Promise<void>;
};

const CustomerContext = createContext<
  CustomerContextType | undefined
>(undefined);

export function CustomerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] =
    useState(true);

  // ------------------ Check Auth ------------------

  const checkAuth = async () => {
    try {
      const { data } = await api.get(
        '/auth/customer/check-auth'
      );

      console.log(
        'KVK CUSTOMER AUTH CHECK:',
        data
      );

      const authenticatedCustomer =
        data?.customer ??
        data?.user ??
        data;

      if (
        authenticatedCustomer &&
        typeof authenticatedCustomer === 'object' &&
        authenticatedCustomer !== null
      ) {
        setCustomer(
          authenticatedCustomer as Customer
        );
      } else {
        setCustomer(null);
      }
    } catch (error) {
      console.log(
        'KVK CUSTOMER NOT AUTHENTICATED'
      );

      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Login ------------------

  const login = async (
    email: string,
    password: string
  ) => {
    try {
      const { data } = await api.post(
        '/auth/customer/login',
        {
          email,
          password,
        }
      );

      console.log(
        'KVK CUSTOMER LOGIN:',
        data
      );

      const loggedInCustomer =
        data?.customer ??
        data?.user;

      if (
        loggedInCustomer &&
        typeof loggedInCustomer === 'object'
      ) {
        setCustomer(
          loggedInCustomer as Customer
        );

        return loggedInCustomer as Customer;
      }

      await checkAuth();

      return null;
    } catch (error: any) {
      console.error(
        'KVK CUSTOMER LOGIN ERROR:',
        error?.response?.data ?? error
      );

      throw error;
    }
  };

  // ------------------ Signup ------------------

  const signup = async (
    signupData: SignupData
  ) => {
    try {
      const { data } = await api.post(
        '/auth/customer/signup',
        signupData
      );

      console.log(
        'KVK CUSTOMER SIGNUP:',
        data
      );

      const registeredCustomer =
        data?.customer ??
        data?.user;

      if (
        registeredCustomer &&
        typeof registeredCustomer === 'object'
      ) {
        setCustomer(
          registeredCustomer as Customer
        );

        return registeredCustomer as Customer;
      }

      await checkAuth();

      return null;
    } catch (error: any) {
      console.error(
        'KVK CUSTOMER SIGNUP ERROR:',
        error?.response?.data ?? error
      );

      throw error;
    }
  };

  // ------------------ Update Profile ------------------

  const updateProfile = async (
    profileData: UpdateProfileData
  ) => {
    try {
      console.log(
        '⏳ Updating KVK customer profile...',
        profileData
      );

      const { data } = await api.put(
        '/auth/customer/profile',
        profileData
      );

      console.log(
        '✅ KVK PROFILE UPDATE RESPONSE:',
        data
      );

      const updatedCustomer =
        data?.customer ??
        data?.user;

      if (
        updatedCustomer &&
        typeof updatedCustomer === 'object'
      ) {
        // Immediately replace the customer in
        // the global context.
        setCustomer(
          updatedCustomer as Customer
        );

        console.log(
          '✅ KVK CUSTOMER CONTEXT UPDATED:',
          updatedCustomer
        );

        return updatedCustomer as Customer;
      }

      // Fallback in case the backend only returns
      // a success message.
      await checkAuth();

      return null;
    } catch (error: any) {
      console.error(
        '🔥 KVK PROFILE UPDATE ERROR:',
        error?.response?.data ?? error
      );

      throw error;
    }
  };

  // ------------------ Logout ------------------

  const logout = async () => {
    try {
      await api.post(
        '/auth/customer/logout'
      );
    } catch (error) {
      console.error(
        'KVK CUSTOMER LOGOUT ERROR:',
        error
      );
    } finally {
      setCustomer(null);
    }
  };

  // ------------------ Initial Auth ------------------

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        loading,
        login,
        signup,
        updateProfile,
        logout,
        checkAuth,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomerAuth() {
  const context =
    useContext(CustomerContext);

  if (!context) {
    throw new Error(
      'useCustomerAuth must be used inside CustomerProvider'
    );
  }

  return context;
}
