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
import { AllOrders } from "../components/pages/AllOrders.jsx";
import CompareProducts from "../components/pages/compare/CompareProducts.jsx";

// Protected Route

// ✅ Define all routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <ContactPage /> },

      // Popular & Featured
      { path: "featured-category", element: <HomeProducts /> },
      { path: "featured-category/:categoryName/:productId", element: <FeatureCategoriesPage /> },

      // Daily Deals
      { path: "daily-deals-category", element: <DailyDealsProducts /> },
      { path: "daily-deals/:categoryName/:productId", element: <DailyDealsProductPage /> },

      // Smart Farming / Seasonal

      // Product Routes
      { path: "all-categories", element: <AllCategoriesProducts /> },
      { path: "products-categories/:categoryName", element: <ProductListing /> },
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
      { path: "products-categories/:categoryName/:productId", element: <SingleProductListing /> },

      // User Routes
      {
        path: "wishlist",
        element: (
          <CustomerProtectedRoute>
            <Wishlist />
          </CustomerProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <CustomerProtectedRoute>
            <Settings />
          </CustomerProtectedRoute>
        ),
      },

      // ✅ Auth Routes
      { path: "login", element: <CustomerLogin /> },
      { path: "signup", element: <CustomerSignup /> },
      {
        path: "/blogs",
        element: <BlogsCarousel />
      },
      {
        path: "/blog/:slug",
        element: <SingleBlog />
      },
      {
        path: "search",
        element: <SearchResults />,
      },
      // ✅ Protected Customer Pages
      {
        path: "profile",
        element: (
          <CustomerProtectedRoute>
            <CustomerProfile />
          </CustomerProtectedRoute>
        ),
      },
      {
        path: "cartpage",
        element: (
          <CustomerProtectedRoute>
            <CartPage />
          </CustomerProtectedRoute>
        ),
      },
      {
        path: "compare",
        element: (
          <CustomerProtectedRoute>
            <CompareProducts />
          </CustomerProtectedRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <CustomerProtectedRoute>
            <Checkout />
          </CustomerProtectedRoute>
        ),
      },
      {
        path: "trackmyorder",
        element: (
          <CustomerProtectedRoute>
            <TrackMyOrders />
          </CustomerProtectedRoute>
        ),
      },
      {
        path: "/orders",
        element: (
          <CustomerProtectedRoute >
            <AllOrders />
          </CustomerProtectedRoute >
        ),
      },

      // ✅ Misc
      {
        path: "invoice",
        element: (
          <CustomerProtectedRoute>
            <Invoice />
          </CustomerProtectedRoute>
        ),
      },
      { path: "brands", element: <BrandsPage /> },
      { path: "affiliations", element: <Affiliations /> },
    ],
  },
]);

export default router;
