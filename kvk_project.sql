-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 24, 2026 at 08:32 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kvk_project`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `createdAt`) VALUES
(1, 'superadmin', 'admin@kvk.com', '$2a$10$S3ql7LzeRgF3q9MEoaqefeK8jy/vW4uBgwgtgTCzn7MVu/rS5b/oy', 'admin', '2025-12-02 15:54:55', '2025-12-02 15:54:55'),
(2, 'Md Farhan Arshad', 'farhan.arshad@kvk.com', '$2a$10$ehlcGuaYKdTOnGsbwoj/fu0USWEQGwdihtnOEMlJBXEu4lZk0Lclu', 'admin', '2025-12-24 15:11:52', '2025-12-24 15:11:52'),
(3, 'Md Faizan', 'faizan@kvk.com', '$2a$10$LVmTNG.OqUoq4qrcQMbtzO/c/Sk7aqGv/Sf3rX.Xuy4A4.f5fnupC', 'admin', '2025-12-24 15:13:45', '2025-12-24 15:13:45');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `brand_name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `brand_name`, `slug`, `created_at`, `image`) VALUES
(1, 'Corteva Roots', 'corteva-roots', '2025-12-02 19:33:53', '/uploads/brands/1766777175683_cortevaLogo.webp'),
(2, 'UPL', 'upl', '2025-12-05 17:39:54', '/uploads/brands/1766777164658_uplLogo.webp'),
(3, 'nuziveedu', 'nuziveedu', '2025-12-05 17:43:51', '/uploads/brands/1766777152012_nuziveeduSeeds.webp'),
(4, 'Seminis Seeds', 'seminis-seeds', '2025-12-26 19:24:13', '/uploads/brands/1766777053515_seminisLogo.webp'),
(5, 'Advanta Seeds', 'advanta-seeds', '2025-12-26 19:26:41', '/uploads/brands/1766777201416_advantaSeedsLogo.webp'),
(6, 'Asnkur Seeds', 'asnkur-seeds', '2025-12-26 19:27:11', '/uploads/brands/1766777231693_ankurLogo.webp'),
(7, 'VNR Seeds', 'vnr-seeds', '2025-12-26 19:27:37', '/uploads/brands/1766777257670_vnrLogo.webp');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `image` varchar(255) DEFAULT NULL,
  `addedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `customerId`, `productId`, `title`, `price`, `quantity`, `image`, `addedAt`) VALUES
(1, 1, 6, 'Kharif Crops', 340.00, 6, '/uploads/1762184328518_kharif-crops.png', '2025-12-06 10:59:38');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `canonical_url` varchar(255) DEFAULT NULL,
  `structured_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`structured_data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `image`, `created_at`, `meta_title`, `meta_description`, `keywords`, `canonical_url`, `structured_data`) VALUES
(1, 'Kharif Crops', 'kharif-crops', '/uploads/1762183817801_kharif-crops.png', '2025-11-03 21:00:17', 'Kharif Crops in India – List, Season, Examples & Farming Guide', 'Learn about Kharif crops in India including rice, maize, cotton, and more. Explore sowing season, examples, climate requirements, and farming tips for better yield.', 'kharif crops, kharif crops in india, kharif season crops list, examples of kharif crops, rice maize cotton crops, monsoon crops india, kharif farming guide, crop season india, agriculture kharif crops', '', NULL),
(2, 'Rabi Crops', 'rabi-crops', '/uploads/1762183833894_Rabi-crops.png', '2025-11-03 21:00:33', 'Rabi Crops in India – List, Season, Examples & Farming Guide', 'Explore Rabi crops in India such as wheat, barley, mustard, and gram. Learn about sowing season, climate requirements, crop examples, and farming practices.', 'rabi crops, rabi crops in india, rabi season crops list, wheat barley mustard crops, winter crops india, rabi farming guide, crop seasons india, agriculture rabi crops, examples of rabi crops', '', NULL),
(3, 'Vegetable Seeds', 'vegetable-seeds', '/uploads/1762183853067_vegetable.png', '2025-11-03 21:00:53', 'Vegetable Seeds – Buy Quality Seeds for Farming & Gardening in India', 'Shop high-quality vegetable seeds for farming and home gardening. Explore a wide range of seeds like tomato, chili, brinjal, and more with high yield and quality assurance.', 'vegetable seeds, buy vegetable seeds online india, hybrid vegetable seeds, tomato seeds, chili seeds, brinjal seeds, garden seeds india, farming seeds, organic vegetable seeds, best seeds for vegetables', '', NULL),
(4, 'Fertilizers', 'fertilizers', '/uploads/1762183871889_2.png', '2025-11-03 21:01:11', 'Fertilizers in India – Buy Organic & Chemical Fertilizers for Crops', 'Explore a wide range of fertilizers for crops including organic, chemical, and bio fertilizers. Improve soil fertility and boost crop yield with high-quality fertilizers in India.', 'fertilizers, fertilizers in india, buy fertilizers online, organic fertilizers, chemical fertilizers, bio fertilizers, NPK fertilizers, crop nutrients, soil fertility products, agriculture fertilizers', '', NULL),
(5, 'Pesticides', 'pesticides', '/uploads/1762183888846_pesticides.png', '2025-11-03 21:01:28', 'Pesticides in India – Buy Insecticides, Fungicides & Herbicides Online', 'Shop effective pesticides for crops including insecticides, fungicides, and herbicides. Protect your crops from pests and diseases with high-quality solutions for Indian farming.', 'pesticides, pesticides in india, buy pesticides online, insecticides, fungicides, herbicides, crop protection products, pest control farming, agriculture pesticides, best pesticides for crops', '', NULL),
(6, 'Sprayers', NULL, '/uploads/1762183911154_IMG-20241024-WA0025.jpg', '2025-11-03 21:01:51', NULL, NULL, NULL, NULL, NULL),
(7, 'Pipes', NULL, '/uploads/1762183959457_pipes.png', '2025-11-03 21:02:39', NULL, NULL, NULL, NULL, NULL),
(8, 'Pumps and Machineries', NULL, '/uploads/1762183977053_pumps.jpeg', '2025-11-03 21:02:57', NULL, NULL, NULL, NULL, NULL),
(9, 'Hardware Products', NULL, '/uploads/1762184019713_hardware.png', '2025-11-03 21:03:39', NULL, NULL, NULL, NULL, NULL),
(10, 'Cements', NULL, '/uploads/1765125519473_building.webp', '2025-12-07 22:08:39', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `customerName` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `profileImage` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `customerName`, `email`, `mobile`, `address`, `city`, `state`, `pincode`, `password`, `createdAt`, `profileImage`) VALUES
(1, 'John Doe', 'customer@example.com', '', '', '', '', '', '$2a$10$sEa5Q0O8k3zYR6IdRISv8OMN6TNf0Uw/prQqWstZUhtexo.Wo1nfO', '2025-12-02 22:00:46', NULL),
(2, 'Farhan', 'farhan@kvk.com', '', '', '', '', '', '$2a$10$nWEZR5GWOeOy1gHg.jHgn.Z1R6eRcjZjqpRMyJ0at5RGUGQ01MDnq', '2025-12-06 16:19:04', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `home_carousel`
--

CREATE TABLE `home_carousel` (
  `id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `home_carousel`
--

INSERT INTO `home_carousel` (`id`, `image`, `title`, `link`, `status`, `sort_order`, `created_at`) VALUES
(1, '/uploads/carousel/1766777071600_banner1.jpeg', NULL, NULL, 'active', 0, '2025-12-26 19:24:31'),
(2, '/uploads/carousel/1766777081089_banner2.jpeg', NULL, NULL, 'active', 0, '2025-12-26 19:24:41'),
(3, '/uploads/carousel/1766777088878_banner3.jpeg', NULL, NULL, 'active', 0, '2025-12-26 19:24:48');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `orderDate` datetime NOT NULL DEFAULT current_timestamp(),
  `totalCost` decimal(10,2) NOT NULL,
  `paymentMethod` varchar(50) DEFAULT NULL,
  `paymentStatus` enum('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  `status` enum('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  `remarks` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customerId`, `orderDate`, `totalCost`, `paymentMethod`, `paymentStatus`, `status`, `remarks`, `createdAt`, `updatedAt`) VALUES
(1, 1, '2025-12-03 00:56:14', 1250.50, 'Credit Card', 'Paid', 'Processing', 'First test order', '2025-12-02 19:26:14', '2025-12-02 19:32:51'),
(8, 1, '2025-12-05 21:51:17', 1200.00, NULL, NULL, 'Pending', '', '2025-12-05 16:21:17', '2025-12-05 16:21:17'),
(9, 1, '2025-12-05 21:54:40', 780.00, 'UPI', 'Pending', 'Pending', 'wefwfwe', '2025-12-05 16:24:40', '2025-12-05 16:24:40'),
(10, 1, '2025-12-05 21:55:40', 340.00, 'Cash', 'Pending', 'Pending', 'dwefwf', '2025-12-05 16:25:40', '2025-12-05 16:25:40'),
(11, 1, '2025-12-05 21:56:22', 2500.00, NULL, NULL, 'Pending', '', '2025-12-05 16:26:22', '2025-12-05 16:26:22'),
(12, 1, '2025-12-05 21:57:09', 120.00, NULL, NULL, 'Pending', '', '2025-12-05 16:27:09', '2025-12-05 16:27:09'),
(13, 1, '2025-12-05 22:00:30', 450.00, 'Cash', 'Pending', 'Pending', 'efwf', '2025-12-05 16:30:30', '2025-12-05 16:30:30'),
(14, 1, '2025-12-05 22:08:40', 780.00, 'Cash', 'Pending', 'Pending', 'wefwfe', '2025-12-05 16:38:40', '2025-12-05 16:38:40'),
(15, 1, '2025-12-05 22:10:48', 1200.00, 'UPI', 'Pending', 'Pending', 'efwef', '2025-12-05 16:40:48', '2025-12-05 16:40:48'),
(16, 1, '2025-12-05 22:18:25', 450.00, 'UPI', 'Pending', 'Pending', 'fewfwef', '2025-12-05 16:48:25', '2025-12-05 16:48:25'),
(17, 1, '2025-12-05 22:38:55', 1200.00, NULL, NULL, 'Pending', '', '2025-12-05 17:08:55', '2025-12-05 17:08:55'),
(18, 1, '2025-12-05 22:40:40', 1200.00, NULL, NULL, 'Pending', '', '2025-12-05 17:10:40', '2025-12-05 17:10:40'),
(19, 1, '2025-12-05 22:44:21', 450.00, NULL, NULL, 'Pending', '', '2025-12-05 17:14:21', '2025-12-05 17:14:21'),
(20, 1, '2025-12-05 22:46:13', 450.00, NULL, NULL, 'Pending', '', '2025-12-05 17:16:13', '2025-12-05 17:16:13'),
(21, 1, '2025-12-05 22:47:58', 450.00, NULL, NULL, 'Pending', '', '2025-12-05 17:17:58', '2025-12-05 17:17:58'),
(22, 1, '2025-12-05 22:50:37', 450.00, NULL, NULL, 'Pending', '', '2025-12-05 17:20:37', '2025-12-05 17:20:37'),
(23, 1, '2025-12-05 22:53:07', 450.00, NULL, NULL, 'Pending', '', '2025-12-05 17:23:07', '2025-12-05 17:23:07'),
(24, 1, '2025-12-05 22:54:00', 450.00, NULL, NULL, 'Pending', '', '2025-12-05 17:24:00', '2025-12-05 17:24:00'),
(25, 1, '2025-12-05 22:55:56', 50.00, 'Cash', 'Paid', 'Pending', 'ferfeer', '2025-12-05 17:25:56', '2025-12-05 17:25:56'),
(26, 1, '2025-12-05 22:57:57', 450.00, 'Cash', 'Paid', 'Pending', 'qd32r3', '2025-12-05 17:27:57', '2025-12-05 17:27:57'),
(27, 1, '2025-12-06 16:47:00', 2040.00, 'cod', '', 'Pending', '', '2025-12-06 11:17:00', '2025-12-06 11:17:00'),
(28, 1, '2025-12-06 16:47:07', 2040.00, 'cod', '', 'Pending', 'qde', '2025-12-06 11:17:07', '2025-12-06 11:17:07'),
(29, 2, '2025-12-07 19:27:19', 6500.00, 'Cash', 'Pending', 'Pending', 'efwef', '2025-12-07 13:57:19', '2025-12-07 13:57:19'),
(30, 2, '2025-12-07 19:32:34', 6500.00, 'Cash', 'Pending', 'Pending', 'efwef', '2025-12-07 14:02:34', '2025-12-07 14:02:34'),
(31, 2, '2025-12-07 19:39:05', 6500.00, 'Cash', 'Pending', 'Pending', 'efwef', '2025-12-07 14:09:05', '2025-12-07 14:09:05'),
(32, 2, '2025-12-07 19:40:45', 6500.00, 'Cash', 'Pending', 'Pending', 'test after restart', '2025-12-07 14:10:45', '2025-12-07 14:10:45'),
(33, 2, '2025-12-07 19:43:32', 1200.00, 'Cash', 'Pending', 'Pending', 'qwd32r', '2025-12-07 14:13:32', '2025-12-07 14:13:32'),
(34, 2, '2025-12-07 19:49:49', 1200.00, 'Cash', 'Pending', 'Pending', 'qwd32r', '2025-12-07 14:19:49', '2025-12-07 14:19:49'),
(35, 2, '2025-12-07 19:50:30', 780.00, 'Cash', 'Pending', 'Pending', 'efr2', '2025-12-07 14:20:30', '2025-12-07 14:20:30'),
(36, 2, '2025-12-07 19:52:06', 50.00, 'Card', 'Paid', 'Pending', '32r23', '2025-12-07 14:22:06', '2025-12-07 14:22:06'),
(37, 2, '2025-12-07 19:54:14', 50.00, 'Card', 'Paid', 'Pending', '32r23', '2025-12-07 14:24:14', '2025-12-07 14:24:14'),
(38, 2, '2025-12-07 19:56:26', 50.00, 'Cash', 'Failed', 'Pending', 'e32r2', '2025-12-07 14:26:26', '2025-12-07 14:26:26'),
(39, 2, '2025-12-07 19:58:37', 1200.00, 'Cash', 'Paid', 'Processing', 'rr2', '2025-12-07 14:28:37', '2025-12-07 14:28:37'),
(40, 2, '2025-12-07 20:01:03', 1200.00, 'Cash', 'Paid', 'Processing', 'rr2', '2025-12-07 14:31:03', '2025-12-07 14:31:03'),
(41, 2, '2025-12-07 20:01:46', 1200.00, 'Cash', 'Paid', 'Processing', 'qeq', '2025-12-07 14:31:46', '2025-12-07 14:31:46'),
(42, 1, '2025-12-07 20:03:50', 50.00, 'Cash', 'Failed', 'Pending', '', '2025-12-07 14:33:50', '2025-12-07 14:33:50'),
(43, 2, '2025-12-07 20:06:35', 1600.00, 'UPI', 'Failed', 'Shipped', '32223r', '2025-12-07 14:36:35', '2025-12-07 14:36:35'),
(44, 2, '2025-12-07 20:08:22', 1600.00, 'UPI', 'Failed', 'Shipped', '32223r', '2025-12-07 14:38:22', '2025-12-07 14:38:22'),
(45, 2, '2025-12-07 20:10:03', 1600.00, 'UPI', 'Failed', 'Shipped', '32223r', '2025-12-07 14:40:03', '2025-12-07 14:40:03'),
(46, 2, '2025-12-07 20:12:28', 1600.00, 'UPI', 'Failed', 'Shipped', '32223r', '2025-12-07 14:42:28', '2025-12-07 14:42:28'),
(47, 2, '2025-12-07 20:13:46', 340.00, 'cod', '', '', '', '2025-12-07 14:43:46', '2025-12-07 14:50:56'),
(48, 2, '2025-12-07 20:39:04', 680.00, 'cod', '', 'Shipped', '', '2025-12-07 15:09:04', '2025-12-07 15:09:32'),
(49, 2, '2025-12-07 20:40:29', 5100.00, 'UPI', 'Failed', 'Processing', '', '2025-12-07 15:10:29', '2025-12-07 15:10:29'),
(50, 2, '2025-12-07 22:01:05', 320.00, 'cod', '', 'Shipped', '', '2025-12-07 16:31:05', '2025-12-07 16:46:14'),
(51, 2, '2025-12-07 22:17:08', 340.00, 'Cash', 'Paid', 'Processing', 'REY``', '2025-12-07 16:47:08', '2025-12-07 16:47:08'),
(52, 2, '2025-12-09 01:24:47', 1970.00, 'cod', '', 'Pending', '', '2025-12-08 19:54:47', '2025-12-08 19:54:47'),
(53, 2, '2025-12-09 19:35:27', 780.00, 'cod', '', 'Pending', '', '2025-12-09 14:05:27', '2025-12-09 14:05:27'),
(54, 2, '2025-12-24 20:52:03', 5666.00, 'Cash', 'Pending', 'Pending', '', '2025-12-24 15:22:03', '2025-12-24 15:22:03'),
(55, 2, '2025-12-24 20:52:12', 5666.00, 'Cash', 'Pending', 'Pending', '', '2025-12-24 15:22:12', '2025-12-24 15:22:12'),
(56, 2, '2025-12-24 20:52:38', 5666.00, 'UPI', 'Pending', 'Pending', '', '2025-12-24 15:22:38', '2025-12-24 15:22:38'),
(57, 2, '2025-12-24 20:52:49', 5666.00, 'UPI', 'Pending', 'Pending', '', '2025-12-24 15:22:49', '2025-12-24 15:22:49'),
(58, 2, '2025-12-24 20:53:52', 5666.00, 'UPI', 'Pending', 'Pending', '', '2025-12-24 15:23:52', '2025-12-24 15:23:52'),
(59, 2, '2025-12-26 01:18:18', 660.00, 'cod', '', 'Pending', '', '2025-12-25 19:48:18', '2025-12-25 19:48:18');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `description` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `orderId`, `product_id`, `quantity`, `description`, `amount`, `createdAt`) VALUES
(2, 33, 1, 1, 'Manual test', 100.00, '2025-12-07 14:17:13'),
(5, 20, 9, 1, 'Runtime Test', 50.00, '2025-12-07 14:34:56'),
(6, 46, 2, 1, 'DAP', 1600.00, '2025-12-07 14:42:28'),
(7, 47, 6, 1, 'Kharif Crops', 340.00, '2025-12-07 14:43:46'),
(8, 48, 6, 2, 'Kharif Crops', 680.00, '2025-12-07 15:09:04'),
(9, 49, 6, 15, 'Kharif Crops', 5100.00, '2025-12-07 15:10:29'),
(10, 50, 12, 1, 'trhrhrth', 320.00, '2025-12-07 16:31:05'),
(11, 51, 6, 1, 'Kharif Crops', 340.00, '2025-12-07 16:47:08'),
(12, 52, 10, 1, '15 19 rinch ', 50.00, '2025-12-08 19:54:47'),
(13, 52, 12, 6, 'trhrhrth', 1920.00, '2025-12-08 19:54:47'),
(14, 53, 8, 1, 'Sprayers', 780.00, '2025-12-09 14:05:27'),
(15, 54, 16, 1, 'ferfer', 5666.00, '2025-12-24 15:22:03'),
(16, 55, 16, 1, 'ferfer', 5666.00, '2025-12-24 15:22:12'),
(17, 56, 16, 1, 'ferfer', 5666.00, '2025-12-24 15:22:38'),
(18, 57, 16, 1, 'ferfer', 5666.00, '2025-12-24 15:22:49'),
(19, 58, 16, 1, 'ferfer', 5666.00, '2025-12-24 15:23:52'),
(20, 59, 6, 1, 'Kharif Crops', 340.00, '2025-12-25 19:48:18'),
(21, 59, 12, 1, 'trhrhrth', 320.00, '2025-12-25 19:48:18');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `subdescription` text DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `oldPrice` decimal(10,2) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `size` varchar(50) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `mfg` varchar(100) DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `life` varchar(50) DEFAULT NULL,
  `is_daily_deal` tinyint(1) DEFAULT 0,
  `daily_deal_price` decimal(10,2) DEFAULT NULL,
  `daily_deal_end` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `is_popular` tinyint(1) DEFAULT 0,
  `slug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `title`, `brand`, `description`, `subdescription`, `category_id`, `oldPrice`, `price`, `stock`, `status`, `images`, `size`, `weight`, `type`, `mfg`, `tags`, `life`, `is_daily_deal`, `daily_deal_price`, `daily_deal_end`, `createdAt`, `is_popular`, `slug`) VALUES
(1, 'Pumps 0.5 HP', 'LUBI', 'Lubi pump 0.5 HP', NULL, 8, 7500.00, 6500.00, 50, '', '[\"/uploads/1762184072085_pumps.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 6550.00, NULL, '2025-11-03 21:04:32', 1, NULL),
(2, 'DAP', 'INDO RAMA', 'Dap 45 kg indo rama', NULL, 4, 1500.00, 1600.00, 500, '', '[\"/uploads/1762184119188_dap.jpeg\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1550.00, NULL, '2025-11-03 21:05:19', 1, NULL),
(3, 'Urea', 'Bharat urea', 'Bharat Urea 45 kg slim', NULL, 4, 450.00, 420.00, 500, '', '[\"/uploads/1762184176728_images.jpeg\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 400.00, NULL, '2025-11-03 21:06:16', 1, NULL),
(4, 'Pesticide', 'UPL', 'UPL Insecticides', NULL, 5, 150.00, 120.00, 50, '', '[\"/uploads/1762184214056_pesticides.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 100.00, NULL, '2025-11-03 21:06:54', 1, NULL),
(5, 'Rabi Crops', 'JK Seeds', 'JK Wheat 20 kg HYbrid Wheat', NULL, 2, 2000.00, 2500.00, 50, '', '[\"/uploads/1762184276735_Rabi-crops.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 2550.00, NULL, '2025-11-03 21:07:56', 1, NULL),
(6, 'Kharif Crops', 'Bayer Seeds', 'Bayer 6444 Gold 1 kg', NULL, 1, 350.00, 340.00, 1000, '', '[\"/uploads/1762184328518_kharif-crops.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 300.00, NULL, '2025-11-03 21:08:48', 1, NULL),
(7, 'Tomato seeds', 'Nuziveedu Seeds', 'Tomato 10 g Nuziveedu Hybrid', NULL, 3, 400.00, 450.00, 800, '', '[\"/uploads/1762184372095_vegetable.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 430.00, NULL, '2025-11-03 21:09:32', 1, NULL),
(8, 'Sprayers', 'UNknown', 'Sprayers 7.5 litre', NULL, 6, 800.00, 780.00, 50, '', '[\"/uploads/1762184445219_IMG-20241024-WA0029.jpg\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 749.00, NULL, '2025-11-03 21:10:45', 1, NULL),
(9, 'Pipes', 'Balaji Pipes', 'Blaji Pipes white 6 kg 100 ft 2\" ', NULL, 7, 1000.00, 1200.00, 500, '', '[\"/uploads/1762184497006_IMG-20241024-WA0052.jpg\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1050.00, NULL, '2025-11-03 21:11:37', 1, NULL),
(10, '15 19 rinch ', 'Unknown', '15 - 19 rinch for all', NULL, 9, 70.00, 50.00, 50, '', '[\"/uploads/1762184555585_hardware.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 80.00, NULL, '2025-11-03 21:12:35', 1, NULL),
(11, 'ftdtrydr', 'rdydryd', 'ydr', NULL, 8, 5000.00, 7000.00, 20, '', '[\"/uploads/1765120056565_IMG-20241024-WA0017.jpg\"]', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2025-12-07 20:37:36', 1, NULL),
(12, 'trhrhrth', 'rthrthrt', 'hrthrth', NULL, 1, 300.00, 320.00, 500, '', '[\"/uploads/1765124965421_IMG-20241024-WA0055.jpg\"]', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2025-12-07 21:59:25', 1, NULL),
(13, 'BEANS SEEDS', 'HAPL SEEDS', '100G hYBRID ', NULL, 3, 250.00, 200.00, 500, '', '[\"/uploads/1765125662727_IMG-20241024-WA0060.jpg\",\"/uploads/1765125662732_IMG-20241024-WA0027.jpg\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 180.00, NULL, '2025-12-07 22:11:02', 1, NULL),
(14, 'ewffffffff', 'wfeeeeeeee', 'wefwefwef', NULL, 4, 1500.00, 2000.00, 500, '', '[\"/uploads/1765209474161_fertilizers.webp\"]', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2025-12-08 21:27:54', 1, NULL),
(15, 'qwdqdewf', 'wefwefwefwe', 'wefiwufwefwfew', NULL, 4, 2000.00, 1800.00, 500, '', '[\"/uploads/1765219274677_dap.jpeg\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1649.00, NULL, '2025-12-09 00:11:14', 1, NULL),
(16, 'ferfer', 'e4r38', '<!-- ================= TABLE OF CONTENT ================= -->\r\n<div style=\"scroll-margin-top:30vh;border:1px solid #e6e6e6;padding:clamp(15px,3vw,24px);border-radius:1rem;margin-bottom:40px;font-size:clamp(14px,2vw,16px);line-height:1.7;background:#fafafa;\">\r\n  \r\n  <div style=\"display:flex;align-items:center;gap:10px;margin-bottom:18px;\">\r\n    <div style=\"width:4px;height:28px;background:#3730a3;border-radius:4px;\"></div>\r\n    <h3 style=\"margin:0;font-size:18px;font-weight:700;color:#1a1a2e;line-height:1.3;\">\r\n      Table of Contents\r\n    </h3>\r\n  </div>\r\n\r\n  <div style=\"display:flex;flex-wrap:wrap;gap:10px;\">\r\n\r\n    <a href=\"#merit\" style=\"display:flex;align-items:center;gap:10px;width:calc(50% - 5px);box-sizing:border-box;text-decoration:none;background:#fff;border:1px solid #e0e0e0;border-left:4px solid #3730a3;border-radius:8px;padding:11px 14px;color:#1a1a2e;font-size:14px;font-weight:500;\">\r\n      <span style=\"background:#3730a3;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;\">1</span>\r\n      Merit-Based Scholarships\r\n    </a>\r\n\r\n    <a href=\"#need\" style=\"display:flex;align-items:center;gap:10px;width:calc(50% - 5px);box-sizing:border-box;text-decoration:none;background:#fff;border:1px solid #e0e0e0;border-left:4px solid #3730a3;border-radius:8px;padding:11px 14px;color:#1a1a2e;font-size:14px;font-weight:500;\">\r\n      <span style=\"background:#3730a3;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;\">2</span>\r\n      Need Based (Means) Scholarships\r\n    </a>\r\n\r\n    <a href=\"#category\" style=\"display:flex;align-items:center;gap:10px;width:calc(50% - 5px);box-sizing:border-box;text-decoration:none;background:#fff;border:1px solid #e0e0e0;border-left:4px solid #3730a3;border-radius:8px;padding:11px 14px;color:#1a1a2e;font-size:14px;font-weight:500;\">\r\n      <span style=\"background:#3730a3;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;\">3</span>\r\n      Category-Specific Scholarships\r\n    </a>\r\n\r\n    <a href=\"#special\" style=\"display:flex;align-items:center;gap:10px;width:calc(50% - 5px);box-sizing:border-box;text-decoration:none;background:#fff;border:1px solid #e0e0e0;border-left:4px solid #3730a3;border-radius:8px;padding:11px 14px;color:#1a1a2e;font-size:14px;font-weight:500;\">\r\n      <span style=\"background:#3730a3;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;\">4</span>\r\n      Scholarships For Special Needs Students\r\n    </a>\r\n\r\n    <a href=\"#pg\" style=\"display:flex;align-items:center;gap:10px;width:calc(50% - 5px);box-sizing:border-box;text-decoration:none;background:#fff;border:1px solid #e0e0e0;border-left:4px solid #3730a3;border-radius:8px;padding:11px 14px;color:#1a1a2e;font-size:14px;font-weight:500;\">\r\n      <span style=\"background:#3730a3;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;\">5</span>\r\n      Postgraduate Scholarships\r\n    </a>\r\n\r\n    <a href=\"#overview\" style=\"display:flex;align-items:center;gap:10px;width:calc(50% - 5px);box-sizing:border-box;text-decoration:none;background:#fff;border:1px solid #e0e0e0;border-left:4px solid #3730a3;border-radius:8px;padding:11px 14px;color:#1a1a2e;font-size:14px;font-weight:500;\">\r\n      <span style=\"background:#3730a3;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;\">6</span>\r\n      Scholarship Overview\r\n    </a>\r\n\r\n    <a href=\"#process\" style=\"display:flex;align-items:center;gap:10px;width:calc(50% - 5px);box-sizing:border-box;text-decoration:none;background:#fff;border:1px solid #e0e0e0;border-left:4px solid #3730a3;border-radius:8px;padding:11px 14px;color:#1a1a2e;font-size:14px;font-weight:500;\">\r\n      <span style=\"background:#3730a3;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;\">7</span>\r\n      Application Process &amp; Eligibility\r\n    </a>\r\n\r\n    <a href=\"#faq\" style=\"display:flex;align-items:center;gap:10px;width:calc(50% - 5px);box-sizing:border-box;text-decoration:none;background:#fff;border:1px solid #e0e0e0;border-left:4px solid #3730a3;border-radius:8px;padding:11px 14px;color:#1a1a2e;font-size:14px;font-weight:500;\">\r\n      <span style=\"background:#3730a3;color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;\">8</span>\r\n      Frequently Asked Questions\r\n    </a>\r\n\r\n  </div>\r\n</div>', 'rhfty5t3ty34', 10, 4545.00, 5666.00, 50, '', '[\"/uploads/1766588243343_building.webp\"]', NULL, NULL, NULL, NULL, NULL, NULL, 1, 5000.00, NULL, '2025-12-24 20:27:23', 1, 'ferfer');

-- --------------------------------------------------------

--
-- Table structure for table `product_tabs`
--

CREATE TABLE `product_tabs` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `invoice_no` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `orderId`, `invoice_no`, `amount`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 58, 'INV-0058', 5666.00, 'Pending', '2025-12-24 15:23:52', '2025-12-24 15:23:52'),
(2, 59, 'INV-0059', 660.00, '', '2025-12-25 19:48:18', '2025-12-25 19:48:18');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `role` enum('admin','vendor','customer') DEFAULT 'customer',
  `state` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `mobile`, `role`, `state`, `city`, `address`, `pincode`, `createdAt`) VALUES
(1, 'Super Admin', 'admin@kvk.com', '$2a$10$lTmcrTF63fm21yn3Pd.af.nBjTuP8S.soT3zx8YItJUhD2NOp.IDe', NULL, 'admin', NULL, NULL, NULL, NULL, '2025-11-03 20:58:17'),
(2, 'MD FARHAN', 'farhan@kvk.com', '$2a$10$IW2choDhRNkR4lh6lb9GDu5pJT1xInNfEOR16JgK/zYZNGDYilItW', '07488210403', 'customer', 'Jharkhand', 'Latehar', 'Tilaiyatand Near Jama Masjid', '829203', '2025-11-03 21:49:59');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlist`
--

INSERT INTO `wishlist` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(5, 1, 5, '2025-12-06 11:53:28'),
(7, 2, 6, '2025-12-07 15:41:31'),
(8, 2, 5, '2025-12-07 15:43:36'),
(9, 2, 7, '2025-12-07 15:45:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_customer_product` (`customerId`,`productId`),
  ADD UNIQUE KEY `uniq_cart` (`customerId`,`productId`),
  ADD UNIQUE KEY `uniq_cart_customer_product` (`customerId`,`productId`),
  ADD KEY `productId` (`productId`),
  ADD KEY `customerId` (`customerId`),
  ADD KEY `idx_customerId` (`customerId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `home_carousel`
--
ALTER TABLE `home_carousel`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customerId` (`customerId`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_order` (`orderId`),
  ADD KEY `fk_order_items_product` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_tabs`
--
ALTER TABLE `product_tabs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `home_carousel`
--
ALTER TABLE `home_carousel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `product_tabs`
--
ALTER TABLE `product_tabs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
