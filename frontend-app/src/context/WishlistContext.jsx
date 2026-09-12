// src/context/WishlistContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../components/api"; // ✅ use centralized axios
import { useCustomerAuth } from "./CustomerContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { customer, loading } = useCustomerAuth();

  // ✅ Fetch wishlist (COOKIE BASED)
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!customer) {
        setWishlistItems([]);
        return;
      }

      try {
        const { data } = await api.get("/wishlist");
        setWishlistItems(data || []);
      } catch (err) {
        console.error("Wishlist fetch error:", err);
      }
    };

    if (!loading) {
      fetchWishlist();
    }
  }, [customer, loading]);

  // ✅ Add to wishlist (COOKIE BASED)
  const addToWishlist = async (product) => {
    try {
      await api.post("/wishlist", {
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      });

      setWishlistItems((prev) => [...prev, product]);
    } catch (err) {
      console.error("Add to wishlist error:", err);
    }
  };

  // ✅ Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);

      setWishlistItems((prev) =>
        prev.filter((item) => item.id !== productId)
      );
    } catch (err) {
      console.error("Remove wishlist error:", err);
    }
  };

  // ✅ Clear wishlist
  const clearWishlist = async () => {
    try {
      await api.delete("/wishlist");

      setWishlistItems([]);
    } catch (err) {
      console.error("Clear wishlist error:", err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
