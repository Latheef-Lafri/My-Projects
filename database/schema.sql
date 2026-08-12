-- ========================================================
-- Local Tourist Day-Visit Planner and Information System
-- Database Schema: schema.sql
-- Compatible with MySQL 5.7+ / 8.0+ / MariaDB 10.3+
-- Author: Ahmed ALL (E2410186)
-- Course: ITE2953 Programming Group Project 25S2
-- ========================================================

CREATE DATABASE IF NOT EXISTS `tourist_planner_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `tourist_planner_db`;

-- Drop existing tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS `visit_plan_items`;
DROP TABLE IF EXISTS `visit_plans`;
DROP TABLE IF EXISTS `tourist_places`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `admins`;

-- --------------------------------------------------------
-- Table: admins
-- Stores authenticated administrators with bcrypt password hash
-- --------------------------------------------------------
CREATE TABLE `admins` (
  `admin_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: categories
-- Stores tourist attraction categories
-- Categories: Religious, Heritage, Nature, Beach, Educational, Landmark, Recreation
-- --------------------------------------------------------
CREATE TABLE `categories` (
  `category_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(50) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: tourist_places
-- Stores detailed records of attractions within 25 km radius of Sammanthurai
-- Referential integrity maintained with categories table (RESTRICT on delete to fulfill FR-8.3)
-- --------------------------------------------------------
CREATE TABLE `tourist_places` (
  `place_id` INT AUTO_INCREMENT PRIMARY KEY,
  `place_name` VARCHAR(150) NOT NULL,
  `category_id` INT NOT NULL,
  `description` TEXT NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `opening_time` VARCHAR(50) NOT NULL DEFAULT '06:00 AM',
  `closing_time` VARCHAR(50) NOT NULL DEFAULT '06:00 PM',
  `distance_km` DECIMAL(5, 2) NOT NULL,
  `travel_tips` TEXT NULL,
  `visitor_guidelines` TEXT NULL,
  `estimated_duration_minutes` INT NOT NULL DEFAULT 60,
  `latitude` DECIMAL(10, 7) NULL,
  `longitude` DECIMAL(10, 7) NULL,
  `image_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_place_name` (`place_name`),
  INDEX `idx_place_category` (`category_id`),
  INDEX `idx_place_distance` (`distance_km`),
  CONSTRAINT `fk_place_category` 
    FOREIGN KEY (`category_id`) 
    REFERENCES `categories` (`category_id`) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: visit_plans
-- Stores one-day itinerary metadata (for saved/shared plans)
-- --------------------------------------------------------
CREATE TABLE `visit_plans` (
  `plan_id` VARCHAR(64) PRIMARY KEY,
  `plan_name` VARCHAR(150) NOT NULL DEFAULT 'My One-Day Plan',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: visit_plan_items
-- Stores ordered attraction stops in each one-day plan
-- Referential integrity maintained with tourist_places table
-- --------------------------------------------------------
CREATE TABLE `visit_plan_items` (
  `item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `plan_id` VARCHAR(64) NOT NULL,
  `place_id` INT NOT NULL,
  `visit_order` INT NOT NULL,
  INDEX `idx_plan_item_plan` (`plan_id`),
  INDEX `idx_plan_item_place` (`place_id`),
  CONSTRAINT `fk_plan_item_plan` 
    FOREIGN KEY (`plan_id`) 
    REFERENCES `visit_plans` (`plan_id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_plan_item_place` 
    FOREIGN KEY (`place_id`) 
    REFERENCES `tourist_places` (`place_id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
