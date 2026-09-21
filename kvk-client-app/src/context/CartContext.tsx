import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import api from '@/api/axios';
import { useCustomerAuth } from '@/context/CustomerContext';

type CartItem = {
  id?: number | string;
  productId?: number | string;
  product_id?: number | string;
  title?: string;
  name?: string;
  price?: number | string;
  quantity: number;
  image?: string;
  images?: string[];
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (
    productId: number | string
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
};

const CartContext = createContext<
  CartContextType | undefined
>(undefined);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const {
    customer,
    loading: authLoading,
  } = useCustomerAuth();

  const fetchCart = async () => {
    /*
     * Cart belongs to the logged-in customer.
     * Do not call the protected endpoint for guests.
     */
    if (!customer) {
      setCartItems([]);
      return;
    }

    try {
     const { data } = await api.get('/cart');

const items =
  Array.isArray(data)
    ? data
    : Array.isArray(data?.value)
      ? data.value
      : Array.isArray(data?.cart)
        ? data.cart
        : [];

setCartItems(items);
    } catch (error) {
      console.error(
        'Fetch cart error:',
        error
      );

      setCartItems([]);
    }
  };

  const addToCart = async (
    product: CartItem
  ) => {
    if (!customer) {
      console.log(
        'Customer must be logged in to add items to cart.'
      );
      return;
    }

    try {
      await api.post('/cart', {
        productId:
          product.id ?? product.productId,

        title:
          product.title ??
          product.name ??
          'Product',

        price:
          product.price ?? 0,

        quantity:
          product.quantity || 1,

        image:
          product.image ||
          (product.images?.length
            ? product.images[0]
            : ''),
      });

      await fetchCart();
    } catch (error) {
      console.error(
        'Add to cart error:',
        error
      );
    }
  };

  const removeFromCart = async (
    productId: number | string
  ) => {
    if (!customer) {
      return;
    }

    try {
      await api.delete(
        `/cart/${productId}`
      );

      await fetchCart();
    } catch (error) {
      console.error(
        'Remove cart error:',
        error
      );
    }
  };

  const clearCart = async () => {
    if (!customer) {
      setCartItems([]);
      return;
    }

    try {
      await api.delete('/cart');

      setCartItems([]);
    } catch (error) {
      console.error(
        'Clear cart error:',
        error
      );
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [customer, authLoading]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider'
    );
  }

  return context;
}
