// ✅ /src/routes/index.jsx
import { createBrowserRouter } from "react-router-dom";

// Layout
import App from "../App";

// Pages
import { Home } from "../components/pages/Home";
import { About } from "../components/pages/About";
import { ContactPage } from "../components/pages/ContactPage";
import { FeatureCategoriesPage } from "../components/pages/popular/FeatureCategoriesPage";
import { DailyDealsProductPage } from "../components/pages/dailydeals/DailyDealsProductPage";

import { ProductListing } from "../components/pages/listing/ProductListing";
import { SingleProductListing } from "../components/pages/listing/SingleProductListing";
import { CartPage } from "../components/pages/cart/CartPage";
import { Checkout } from "../components/pages/cart/Checkout";
import { Invoice } from "../components/pages/invoice/Invoice";
import { Settings } from "../components/pages/settings/Settings";
import { Wishlist } from "../components/pages/wishlist/Wishlist";
import { Affiliations } from "../components/pages/Affiliations";
import { BrandsPage } from "../components/pages/BrandsPage";
import { TrackMyOrders } from "../components/pages/TrackMyOrders";
import { DailyDealsProducts } from "../components/pages/dailydeals/DailyDealsProducts";
import { AllCategoriesProducts } from "../components/pages/categorywise/AllCategoriesProducts";
import { HomeProducts } from "../components/pages/popular/HomeProducts";

// Orders
import { AllOrders } from "../components/pages/AllOrders.jsx";
import OrderTracking from "../components/pages/OrderTracking.jsx";

// Auth
import { CustomerSignup } from "../components/auth/CustomerSignup";
import { CustomerProfile } from "../components/auth/CustomerProfile";
import { CustomerLogin } from "../components/auth/CustomerLogin.jsx";

import { CustomerProtectedRoute } from "./PrivateRoute.jsx";

import CategoriesPage from "../components/pages/filters/CategoriesPage.jsx";
import PriceFilterPage from "../components/pages/filters/PriceFilterPage.jsx";
import BrandFilterPage from "../components/pages/filters/BrandFilterPage.jsx";
import StockFilterPage from "../components/pages/filters/StockFilterPage.jsx";

import SearchResults from "../components/Header/SearchResults.jsx";

import BlogsCarousel from "../components/pages/blogs/BlogsCarousel.jsx";
import SingleBlog from "../components/pages/blogs/SingleBlog.jsx";

import CompareProducts from "../components/pages/compare/CompareProducts.jsx";

import { MyAddresses1 } from "../components/pages/MyAddresses1.jsx";
import { MyAccount } from "../components/pages/MyAccount.jsx";
import ChangePassword from "../components/pages/ChangePassword.jsx";
import OrderDetails from "../components/pages/OrderDetails.jsx";

// =====================================================
// ROUTER
// =====================================================

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,

    children: [
      // =================================================
      // HOME
      // =================================================

      {
        path: "",
        element: <Home />,
      },

      {
        path: "about",
        element: <About />,
      },

      {
        path: "contact",
        element: <ContactPage />,
      },

      // =================================================
      // POPULAR & FEATURED
      // =================================================

      {
        path: "featured-category",
        element: <HomeProducts />,
      },

      {
        path: "featured-category/:categoryName/:productId",
        element: <FeatureCategoriesPage />,
      },

      // =================================================
      // DAILY DEALS
      // =================================================

      {
        path: "daily-deals-category",
        element: <DailyDealsProducts />,
      },

      {
        path: "daily-deals/:categoryName/:productId",
        element: <DailyDealsProductPage />,
      },

      // =================================================
      // PRODUCTS
      // =================================================

      {
        path: "all-categories",
        element: <AllCategoriesProducts />,
      },

      {
        path: "products-categories/:categoryName",
        element: <ProductListing />,
      },

      {
        path: "products-categories/:categoryName/:productId",
        element: <SingleProductListing />,
      },

      // =================================================
      // FILTERS
      // =================================================

      {
        path: "filter/categories/:categoryName",
        element: <CategoriesPage />,
      },

      {
        path: "filter/price/:categoryName",
        element: <PriceFilterPage />,
      },

      {
        path: "filter/brand/:categoryName",
        element: <BrandFilterPage />,
      },

      {
        path: "filter/stock/:categoryName",
        element: <StockFilterPage />,
      },

      // =================================================
      // AUTH
      // =================================================

      {
        path: "login",
        element: <CustomerLogin />,
      },

      {
        path: "signup",
        element: <CustomerSignup />,
      },

      // =================================================
      // BLOGS
      // =================================================

      {
        path: "/blogs",
        element: <BlogsCarousel />,
      },

      {
        path: "/blog/:slug",
        element: <SingleBlog />,
      },

      // =================================================
      // SEARCH
      // =================================================

      {
        path: "search",
        element: <SearchResults />,
      },

      // =================================================
      // WISHLIST
      // =================================================

      {
        path: "wishlist",
        element: (
          <CustomerProtectedRoute>
            <Wishlist />
          </CustomerProtectedRoute>
        ),
      },

      // =================================================
      // SETTINGS
      // =================================================

      {
        path: "settings",
        element: (
          <CustomerProtectedRoute>
            <Settings />
          </CustomerProtectedRoute>
        ),
      },

      // =================================================
      // PROFILE
      // =================================================

      {
        path: "profile",
        element: (
          <CustomerProtectedRoute>
            <CustomerProfile />
          </CustomerProtectedRoute>
        ),
      },

      // =================================================
      // ACCOUNT
      // =================================================
{
  path: "account",
  element: (
    <CustomerProtectedRoute>
      <MyAccount />
    </CustomerProtectedRoute>
  ),

  children: [
    {
      index: true,
      element: <CustomerProfile />,
    },

    {
      path: "profile",
      element: <CustomerProfile />,
    },

    {
      path: "password",
      element: <ChangePassword />,
    },

    {
      path: "addresses",
      element: <MyAddresses1 />,
    },
  ],
},

      // =================================================
      // CART
      // =================================================

      {
        path: "cartpage",
        element: (
          <CustomerProtectedRoute>
            <CartPage />
          </CustomerProtectedRoute>
        ),
      },

      // =================================================
      // COMPARE
      // =================================================

      {
        path: "compare",
        element: (
          <CustomerProtectedRoute>
            <CompareProducts />
          </CustomerProtectedRoute>
        ),
      },

      // =================================================
      // CHECKOUT
      // =================================================

      {
        path: "checkout",
        element: (
          <CustomerProtectedRoute>
            <Checkout />
          </CustomerProtectedRoute>
        ),
      },

      // =================================================
      // TRACK MY ORDERS - OLD PAGE
      // =================================================

      {
        path: "trackmyorder",
        element: (
          <CustomerProtectedRoute>
            <TrackMyOrders />
          </CustomerProtectedRoute>
        ),
      },

      // =================================================
      // MY ORDERS
      // =================================================

      {
        path: "/orders",
        element: (
          <CustomerProtectedRoute>
            <AllOrders />
          </CustomerProtectedRoute>
        ),
      },

      // =================================================
      // LIVE ORDER TRACKING
      // =================================================

      {
        path: "/orders/:orderId/",
        element: (
          <CustomerProtectedRoute>
            <OrderDetails />
          </CustomerProtectedRoute>
        ),
      },
      {
        path: "/orders/:orderId/tracking",
        element: (
          <CustomerProtectedRoute>
            <OrderTracking />
          </CustomerProtectedRoute>
        ),
      },

      // =================================================
      // INVOICE
      // =================================================

      {
        path: "invoice",
        element: (
          <CustomerProtectedRoute>
            <Invoice />
          </CustomerProtectedRoute>
        ),
      },

      // =================================================
      // OTHER
      // =================================================

      {
        path: "brands",
        element: <BrandsPage />,
      },

      {
        path: "affiliations",
        element: <Affiliations />,
      },
    ],
  },
]);

export default router;