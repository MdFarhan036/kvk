import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import api from '@/api/axios';
import { useCustomerAuth } from '@/context/CustomerContext';

type WishlistItem = {
  id?: number | string;
  productId: number | string;
    product_id?: number | string;
  title?: string;
  name?: string;
  price?: number | string;
  quantity?: number;
  image?: string;
  images?: string[];
};

type WishlistContextType = {
  wishlistItems: WishlistItem[];
  addToWishlist: (
    product: WishlistItem
  ) => Promise<void>;
  removeFromWishlist: (
    productId: number | string
  ) => Promise<void>;
  clearWishlist: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
};

const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>([]);

  const {
    customer,
    loading: authLoading,
  } = useCustomerAuth();

  const fetchWishlist = async () => {
    /*
     * Wishlist belongs to the logged-in customer.
     * Guests should not make protected wishlist requests.
     */
    if (!customer) {
      setWishlistItems([]);
      return;
    }

    try {
   const { data } = await api.get('/wishlist');

const items =
  Array.isArray(data)
    ? data
    : Array.isArray(data?.value)
      ? data.value
      : Array.isArray(data?.wishlist)
        ? data.wishlist
        : [];

setWishlistItems(items);
    } catch (error) {
      console.error(
        'Wishlist fetch error:',
        error
      );

      setWishlistItems([]);
    }
  };

  const addToWishlist = async (
    product: WishlistItem
  ) => {
    if (!customer) {
      console.log(
        'Customer must be logged in to use wishlist.'
      );
      return;
    }

    try {
      await api.post('/wishlist', {
        productId:
          product.id ?? product.productId,

        title:
          product.title ??
          product.name ??
          'Product',

        price:
          product.price ?? 0,

        image:
          product.image ||
          (product.images?.length
            ? product.images[0]
            : ''),
      });

      await fetchWishlist();
    } catch (error) {
      console.error(
        'Add to wishlist error:',
        error
      );
    }
  };

  const removeFromWishlist = async (
    productId: number | string
  ) => {
    if (!customer) {
      return;
    }

    try {
      await api.delete(
        `/wishlist/${productId}`
      );

      await fetchWishlist();
    } catch (error) {
      console.error(
        'Remove wishlist error:',
        error
      );
    }
  };

  const clearWishlist = async () => {
    if (!customer) {
      setWishlistItems([]);
      return;
    }

    try {
      await api.delete('/wishlist');

      setWishlistItems([]);
    } catch (error) {
      console.error(
        'Clear wishlist error:',
        error
      );
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchWishlist();
    }
  }, [customer, authLoading]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context =
    useContext(WishlistContext);

  if (!context) {
    throw new Error(
      'useWishlist must be used inside WishlistProvider'
    );
  }

  return context;
}
