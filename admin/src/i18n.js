import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const STORAGE_KEY = "kvk-language";
const savedLanguage =
  typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

const resources = {
  en: {
    translation: {
      language: "Language",
      english: "English",
      hindi: "हिन्दी",
      home: "Home",
      about: "About Us",
      contact: "Contact Us",
      search: "Search",
      searchProducts: "Search for products...",
      allCategories: "All Categories",
      categories: "Categories",
      products: "Products",
      product: "Product",
      orders: "Orders",
      customers: "Customers",
      users: "Users",
      brands: "Brands",
      settings: "Settings",
      dashboard: "Dashboard",
      logout: "Logout",
      login: "Login",
      signIn: "Sign In",
      signUp: "Sign Up",
      account: "Account",
      myAccount: "My Account",
      myOrders: "My Orders",
      myAddresses: "My Addresses",
      cart: "Cart",
      shoppingCart: "Shopping Cart",
      wishlist: "Wishlist",
      checkout: "Checkout",
      trackOrder: "Track Order",
      track: "Track",
      viewCart: "View Cart",
      viewWishlist: "View Wishlist",
      viewProduct: "View Product",
      browseProducts: "Browse Products",
      continueShopping: "Continue Shopping",
      emptyCart: "Your cart is empty",
      emptyWishlist: "Your wishlist is empty",
      noCategoriesFound: "No categories found",
      freeShipping: "Free Shipping on orders above ₹999",
      deliveringIndia: "Delivering across India",
      quantity: "Quantity",
      subtotal: "Subtotal",
      status: "Status",
      stock: "Stock",
      available: "available",
      outOfStock: "Out of stock",
      brand: "Brand",
      category: "Category",
      description: "Description",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      add: "Add",
      update: "Update",
      submit: "Submit",
      loading: "Loading",
      blogs: "Blogs",
      deliveryPersons: "Delivery Persons",
      transactions: "Transactions",
      carousels: "Carousels",
      categoryList: "Category List",
      categoryUpload: "Category Upload",
      productsList: "Products List",
      productsUpload: "Products Upload",
      languageChanged: "Language changed"
    }
  },
  hi: {
    translation: {
      language: "भाषा",
      english: "English",
      hindi: "हिन्दी",
      home: "होम",
      about: "हमारे बारे में",
      contact: "संपर्क करें",
      search: "खोजें",
      searchProducts: "उत्पाद खोजें...",
      allCategories: "सभी श्रेणियाँ",
      categories: "श्रेणियाँ",
      products: "उत्पाद",
      product: "उत्पाद",
      orders: "ऑर्डर",
      customers: "ग्राहक",
      users: "उपयोगकर्ता",
      brands: "ब्रांड",
      settings: "सेटिंग्स",
      dashboard: "डैशबोर्ड",
      logout: "लॉग आउट",
      login: "लॉग इन",
      signIn: "साइन इन",
      signUp: "साइन अप",
      account: "खाता",
      myAccount: "मेरा खाता",
      myOrders: "मेरे ऑर्डर",
      myAddresses: "मेरे पते",
      cart: "कार्ट",
      shoppingCart: "शॉपिंग कार्ट",
      wishlist: "पसंदीदा सूची",
      checkout: "चेकआउट",
      trackOrder: "ऑर्डर ट्रैक करें",
      track: "ट्रैक करें",
      viewCart: "कार्ट देखें",
      viewWishlist: "पसंदीदा सूची देखें",
      viewProduct: "उत्पाद देखें",
      browseProducts: "उत्पाद देखें",
      continueShopping: "खरीदारी जारी रखें",
      emptyCart: "आपका कार्ट खाली है",
      emptyWishlist: "आपकी पसंदीदा सूची खाली है",
      noCategoriesFound: "कोई श्रेणी नहीं मिली",
      freeShipping: "₹999 से अधिक के ऑर्डर पर मुफ़्त डिलीवरी",
      deliveringIndia: "पूरे भारत में डिलीवरी",
      quantity: "मात्रा",
      subtotal: "उप-योग",
      status: "स्थिति",
      stock: "स्टॉक",
      available: "उपलब्ध",
      outOfStock: "स्टॉक में नहीं है",
      brand: "ब्रांड",
      category: "श्रेणी",
      description: "विवरण",
      save: "सहेजें",
      cancel: "रद्द करें",
      edit: "संपादित करें",
      delete: "हटाएँ",
      add: "जोड़ें",
      update: "अपडेट करें",
      submit: "जमा करें",
      loading: "लोड हो रहा है",
      blogs: "ब्लॉग",
      deliveryPersons: "डिलीवरी कर्मचारी",
      transactions: "लेन-देन",
      carousels: "कैरूसेल",
      categoryList: "श्रेणी सूची",
      categoryUpload: "श्रेणी अपलोड",
      productsList: "उत्पाद सूची",
      productsUpload: "उत्पाद अपलोड",
      languageChanged: "भाषा बदल दी गई है"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage === "hi" ? "hi" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false
});

i18n.on("languageChanged", (language) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.style.fontFamily =
      language === "hi" ? '"Noto Sans Devanagari", "Nirmala UI", sans-serif' : "";
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

export default i18n;
