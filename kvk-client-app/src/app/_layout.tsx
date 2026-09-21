import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { CartProvider } from '@/context/CartContext';
import { CustomerProvider } from '@/context/CustomerContext';
import { WishlistProvider } from '@/context/WishlistContext';

export default function RootLayout() {
  return (
    <CustomerProvider>
      <CartProvider>
        <WishlistProvider>
          <>
            <StatusBar style="dark" />

            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(tabs)" />

              <Stack.Screen
                name="login"
                options={{
                  animation: 'slide_from_right',
                }}
              />

              <Stack.Screen
                name="signup"
                options={{
                  animation: 'slide_from_right',
                }}
              />

              <Stack.Screen
                name="search"
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </Stack>
          </>
        </WishlistProvider>
      </CartProvider>
    </CustomerProvider>
  );
}
