// routes/index.jsx
import React from 'react';
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { AdminPanel } from "../pages/AdminPanel";
import { Dashboard } from "../pages/dashboard/Dashboard";

import { Settings } from "../pages/settings/Settings";
import { Logout } from "../pages/Logout";
import { UploadProduct } from "../pages/products/UploadProduct";
// import { ProductDetails } from "../pages/products/ProductDetails";
import { SignUp } from "../pages/SignUp";
import { ProductTable } from "../pages/products/ProductTable";
import { ProductManagement } from '../pages/products/ProductManagement';
import { OrderManagement } from '../pages/orders/OrderManagement';
import { OrderDetails } from '../pages/orders/OrdersDetails';
import { OrdersTable } from '../pages/orders/OrdersTable';
import { CustomerManagement } from '../pages/customers/CustomerManagement';
import { CustomerDetails } from '../pages/customers/CustomerDetails';
import { AddCustomer } from '../pages/customers/AddCustomer';
import { CustomerTable } from '../pages/customers/CustomerTable';
import { EditCustomer } from '../pages/customers/EditCustomer';
import { AddOrder } from '../pages/orders/AddOrder';
import { CategoryManagement } from '../pages/categories/CategoryManagement';
import { UploadCategory } from '../pages/categories/UploadCategory';
import { CategoryTable } from '../pages/categories/CategoryTable';
import { ProductDetails } from '../pages/products/ProductDetails';
import { PopularProductsTable } from '../pages/PopularProductsTable';
import { UserManagement } from '../pages/users/UserManagement';
import { AddUser } from '../pages/users/AddUser';
import { UserTable } from '../pages/users/UserTable';
import { UserDetails } from '../pages/users/UserDetails';
import { EditUser } from '../pages/users/EditUser';
import { EditCategory } from '../pages/categories/EditCategory';
import { EditProduct } from '../pages/products/EditProduct';
import { AdminTrackOrders } from '../pages/orders/AdminTrackOrders';
import { MyAccount } from '../pages/MyAccount';
import { Login } from '../pages/Login';
import { BrandsTable } from '../pages/brands/BrandsTable';
import { AddBrand } from '../pages/brands/AddBrand';
import { EditBrand } from '../pages/brands/EditBrand';
import { BrandManagement } from '../pages/brands/BrandManagement';
import AdminProtectedRoute from './PrivateRoute';
import { Transactions } from '../pages/invoice/Transactions';
import { Invoice } from '../pages/invoice/Invoice';
import { CarouselManagement } from '../pages/carousel/CarouselManagement';
import { CarouselTable } from '../pages/carousel/CarouselTable';
import { AddCarousel } from '../pages/carousel/AddCarousel';
import { EditCarousel } from '../pages/carousel/EditCarousel';
import BlogAdmin from '../pages/BlogAdmin';
import BlogDetails from '../pages/BlogDetails';
import BlogList from '../pages/BlogList';
import CreateBlog from '../pages/CreateBlog';
import EditBlog from '../pages/EditBlog';
import DeliveryPersons from '../pages/DeliveryPersons';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: (
          <AdminProtectedRoute>
            <AdminPanel />
          </AdminProtectedRoute>
        ),
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/allorders",
            element: <OrderManagement />, // parent wrapper
            children: [
              { path: "/allorders", element: <OrdersTable /> },
              { path: "addOrder", element: <AddOrder /> },
              { path: ":orderId/details", element: <OrderDetails /> },
              { path: ":orderId/track", element: <AdminTrackOrders /> },
            ],
          },
          {
            path: "/users",
            element: <UserManagement />,
            children: [
              { path: "addUser", element: <AddUser /> },
              { path: "/users/userTable", element: <UserTable /> },
              { path: ":id", element: <UserDetails /> },
              { path: "edit/:id", element: <EditUser /> },
            ],
          },
          {
            path: "/delivery-persons",
            element: <DeliveryPersons />,
          },
          {
            path: "/customers",
            element: <CustomerManagement />,
            children: [
              { path: "customerTable", element: <CustomerTable /> },
              { path: ":id", element: <CustomerDetails /> },
              { path: "customer/:customerId/orders", element: <OrdersTable /> },
              { path: "customer/:customerId/orders/:orderId/details", element: <OrderDetails /> },
            ],
          },
          {
            path: "categories",
            element: <CategoryManagement />,
            children: [
              { path: "uploadCategory", element: <UploadCategory /> },
              { path: "categoryTable", element: <CategoryTable /> },
              { path: "edit/:id", element: <EditCategory /> },
            ],
          },
          {
            path: "allproducts",
            element: <ProductManagement />,
            children: [
              { path: "uploadProduct", element: <UploadProduct /> },
              { path: "productTable", element: <ProductTable /> },
              { path: "productDetails/:id", element: <ProductDetails /> },
              { path: "edit/:id", element: <EditProduct /> },
            ],
          },
          {
            path: "brands",
            element: <BrandManagement />,
            children: [
              { path: "brandsTable", element: <BrandsTable /> },
              { path: "add", element: <AddBrand /> },
              { path: "edit/:id", element: <EditBrand /> },
            ],
          },
          {
            path: "carousels",
            element: <CarouselManagement />,
            children: [
              { path: "carouselsTable", element: <CarouselTable /> },
              { path: "add", element: <AddCarousel /> },
              { path: "edit/:id", element: <EditCarousel /> },
            ],
          },
          {
            path: "popularProductsTable",
            element: <PopularProductsTable />,
          },
          {
            path: "blogs",
            element: <BlogList />,
          },
          {
            path: "blogs/create",
            element: <CreateBlog />
          },
          {
            path: "/blogs/edit/:id",
            element: <EditBlog />,
          },
          {
            path: "blogs/:slug",
            element: <BlogDetails />,
          },

          {
            path: "invoices/:id",
            element: <Invoice />,
          },
          {
            path: "transactions",
            element: <Transactions />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "logout",
            element: <Logout />,
          },
        ],
      },

      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/account",
        element:
          <AdminProtectedRoute roles={["customer", "admin"]}>
            <MyAccount />
          </AdminProtectedRoute>
        ,
      },
    ],
  },
]);

export default router;
