import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

// ================================
// MIDDLEWARE
// ================================
import {
  verifyAdmin,
  verifyCustomer,
} from "./middlewares/authMiddleware.js";

// ================================
// ROUTES
// ================================
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import vendorProductRoutes from "./routes/vendorProductRoutes.js";
import vendorOrdersRoutes from "./routes/vendorOrdersRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import carouselRoutes from "./routes/carouselRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import adminBlogRoutes from "./routes/adminBlogRoutes.js";
import customerAddressRoutes from "./routes/customerAddressRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
// ================================
// APP
// ================================
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================================
// CORS
// ================================
app.use(
  cors({
    origin: [
      
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:8081",
      "http://localhost:5175",
      "http://localhost:5176",
    ],
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ================================
// MIDDLEWARE
// ================================
app.use(cookieParser());

app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// STATIC UPLOADS
// ================================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ================================
// PUBLIC ROUTES
// ================================

// Customer Authentication
app.use("/api/auth/customer", authRoutes);

// Admin Authentication
app.use("/api/admin", adminAuthRoutes);

// Products
app.use("/api/products", productRoutes);

// Categories
app.use("/api/categories", categoryRoutes);

// Brands
app.use("/api/brands", brandRoutes);

// Carousel
app.use("/api/carousel", carouselRoutes);

// Public Blogs
app.use("/api", blogRoutes);

// ================================
// ADMIN ROUTES
// ================================

app.use(
  "/api/dashboard",
  verifyAdmin,
  dashboardRoutes
);

app.use(
  "/api/stock",
  verifyAdmin,
  stockRoutes
);

app.use(
  "/api/vendor/products",
  verifyAdmin,
  vendorProductRoutes
);

app.use(
  "/api/vendorOrders",
  verifyAdmin,
  vendorOrdersRoutes
);

app.use(
  "/api/admin/users",
  verifyAdmin,
  userRoutes
);

app.use(
  "/api/admin/customers",
  verifyAdmin,
  customerRoutes
);

app.use(
  "/api/admin/blogs",
  verifyAdmin,
  adminBlogRoutes
);

// ================================
// GENERAL ROUTES
// ================================

app.use("/api/orders", orderRoutes);

app.use("/api/transactions", transactionRoutes);

// ================================
// CUSTOMER PROTECTED ROUTES
// ================================

app.use(
  "/api/cart",
  verifyCustomer,
  cartRoutes
);

app.use(
  "/api/wishlist",
  verifyCustomer,
  wishlistRoutes
);
app.use(
  "/api/customer/addresses",
  customerAddressRoutes
);
app.use("/api/delivery", deliveryRoutes);
// ================================
// 404 HANDLER
// ================================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ================================
// SERVER
// ================================

const PORT = 8000;

app.listen(PORT, () => {
  console.log(
    `✅ Server running on port ${PORT}`
  );
});