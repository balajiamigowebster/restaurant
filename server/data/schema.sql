-- ==========================================================================
-- Café IDlish Database Schema & Seed Data Script (MariaDB / MySQL)
-- ==========================================================================

CREATE DATABASE IF NOT EXISTS `idlish_db`;
USE `idlish_db`;

DROP TABLE IF EXISTS `menu`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `outlets`;

-- --------------------------------------------------------------------------
-- 1. TABLE SCHEMAS (DDL)
-- --------------------------------------------------------------------------

-- Table: menu (food catalog items)
CREATE TABLE `menu` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `price` DOUBLE NOT NULL,
  `originalPrice` DOUBLE,
  `discountText` VARCHAR(50),
  `category` VARCHAR(100) NOT NULL,
  `isVeg` TINYINT(1) DEFAULT 1,
  `spicyLevel` INT DEFAULT 0,
  `rating` DOUBLE DEFAULT 4.5,
  `isBestSeller` TINYINT(1) DEFAULT 0,
  `isAvailable` TINYINT(1) DEFAULT 1,
  `icon` VARCHAR(10),
  `image` VARCHAR(255),
  `customization` TINYINT(1) DEFAULT 0
);

-- Table: orders (active customer checkout baskets and historical logs)
CREATE TABLE `orders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customerName` VARCHAR(100) NOT NULL,
  `customerPhone` VARCHAR(20) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `address` TEXT,
  `outlet` VARCHAR(100) NOT NULL,
  `items` TEXT NOT NULL, -- JSON formatted array string of cart items
  `subtotal` DOUBLE NOT NULL,
  `packagingFee` DOUBLE,
  `gst` DOUBLE NOT NULL,
  `deliveryCharges` DOUBLE,
  `total` DOUBLE NOT NULL,
  `paymentMethod` VARCHAR(20) NOT NULL,
  `paymentStatus` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `timestamp` VARCHAR(50) NOT NULL
);

-- Table: outlets (operating status of restaurant branches)
CREATE TABLE `outlets` (
  `name` VARCHAR(100) PRIMARY KEY,
  `status` VARCHAR(20) NOT NULL
);

-- --------------------------------------------------------------------------
-- 2. SEED DATA INSERTS (DML)
-- --------------------------------------------------------------------------

-- Seed Outlets
INSERT INTO `outlets` (`name`, `status`) VALUES ('Goregaon East', 'Open');
INSERT INTO `outlets` (`name`, `status`) VALUES ('Vile Parle West', 'Open');

-- Seed Menu Catalog
INSERT INTO `menu` VALUES ('vada-medu', 'Crispy Medu Vada', 'Golden-brown crispy lentil donuts served with sambar and fresh chutneys.', 108.0, 120.0, '₹12.00 Off', 'Idli & Vada', 1, 1, 4.8, 1, 1, '🍩', '/images/medu_vada.png', 1);
INSERT INTO `menu` VALUES ('vada-dal', 'Crunchy Dal Vada', 'Crunchy split-pea fritters infused with herbs and spices.', 117.0, 130.0, '₹13.00 Off', 'Idli & Vada', 1, 2, 4.6, 0, 1, '🍘', '/images/dal_vada.png', 0);
INSERT INTO `menu` VALUES ('idli-kanchipuram', 'Kanchipuram Idli', 'Heritage spiced idlis tempered with pepper, ginger, and cashews.', 153.0, 170.0, '₹17.00 Off', 'Idli & Vada', 1, 1, 4.7, 0, 1, '🟡', '/images/idli_plate.png', 1);
INSERT INTO `menu` VALUES ('idli-mini', 'Mini Idli', 'Bite-sized baby idlis served floating in hot ghee and sambar.', 126.0, 140.0, '₹14.00 Off', 'Idli & Vada', 1, 0, 4.9, 1, 1, '⚪', '/images/idli_plate.png', 1);
INSERT INTO `menu` VALUES ('idli-vada-mix', 'Plain Idli Medu Vada Mix', 'Perfect combo of 1 steamed idli and 1 crispy medu vada.', 126.0, 140.0, '₹14.00 Off', 'Idli & Vada', 1, 1, 4.8, 1, 1, '🧆', '/images/idli_plate.png', 0);
INSERT INTO `menu` VALUES ('idli-plain', 'Plain Steamed Idli', 'Fluffy steamed rice cakes served with sambar and fresh chutneys.', 90.0, 100.0, '₹10.00 Off', 'Idli & Vada', 1, 0, 4.7, 0, 1, '🍚', '/images/idli_plate.png', 0);
INSERT INTO `menu` VALUES ('idli-ragi', 'Ragi Millet Idli', 'Healthy finger millet idlis rich in calcium and fiber.', 108.0, 120.0, '₹12.00 Off', 'Idli & Vada', 1, 0, 4.5, 0, 1, '🟤', '/images/idli_plate.png', 0);

INSERT INTO `menu` VALUES ('dosa-benne', 'Benne Dosa', 'Crispy dosa prepared with generous dollops of fresh white butter.', 162.0, 180.0, '₹18.00 Off', 'Dosa & Uthappam', 1, 1, 4.8, 1, 1, '🧈', '/images/masala_dosa.png', 1);
INSERT INTO `menu` VALUES ('dosa-mysore', 'Mysore Dosa', 'Crispy dosa smeared with red garlic-chilli chutney and spiced potato filling.', 126.0, 140.0, '₹14.00 Off', 'Dosa & Uthappam', 1, 2, 4.9, 1, 1, '🌯', '/images/masala_dosa.png', 1);
INSERT INTO `menu` VALUES ('dosa-oats', 'Oats Enriched Dosa', 'Crispy dosa made with a healthy oats fermented batter.', 180.0, 200.0, '₹20.00 Off', 'Dosa & Uthappam', 1, 0, 4.6, 0, 1, '🌾', '/images/masala_dosa.png', 1);
INSERT INTO `menu` VALUES ('uthappam-onion-chilli', 'Onion Chilli Uttapam', 'Thick rice pancake topped with caramelized onions and green chillies.', 135.0, 150.0, '₹15.00 Off', 'Dosa & Uthappam', 1, 2, 4.6, 0, 1, '🍕', '/images/onion_uttapam.png', 1);
INSERT INTO `menu` VALUES ('dosa-masala', 'Masala Dosa', 'Thin crispy dosa stuffed with aromatic spiced potato mash.', 144.0, 160.0, '₹16.00 Off', 'Dosa & Uthappam', 1, 1, 4.8, 1, 1, '🌯', '/images/masala_dosa.png', 1);

INSERT INTO `menu` VALUES ('meenammas-six', 'Meenamma''s Signature Six', 'A curated sampler of our six top-rated idli variations with assorted chutneys.', 297.0, 330.0, '₹33.00 Off', 'Meenamma''s Signature Six', 1, 1, 4.9, 1, 1, '⭐', '/images/idiyappam.png', 0);
INSERT INTO `menu` VALUES ('combo-south', 'Heritage South Combo', '1 Masala Dosa, 1 Steamed Idli, 1 Medu Vada, and a cup of Filter Coffee.', 252.0, 280.0, '₹28.00 Off', 'Combos & Thali', 1, 1, 4.9, 1, 1, '🍱', '/images/idiyappam.png', 0);
INSERT INTO `menu` VALUES ('combo-mini', 'Mini Tiffin Combo', 'Mini Masala Dosa, 2 Mini Idlis, 1 Mini Vada, and Sweet Pongal.', 207.0, 230.0, '₹23.00 Off', 'Combos & Thali', 1, 1, 4.8, 0, 1, '🍛', '/images/idiyappam.png', 0);
INSERT INTO `menu` VALUES ('thali-dakshin', 'Dakshin Feast Thali', 'Full meals with rice, parotta, sambar, rasam, kootu, poriyal, curd, and payasam.', 315.0, 350.0, '₹35.00 Off', 'Combos & Thali', 1, 1, 4.9, 1, 1, '🍲', '/images/thali.png', 0);

INSERT INTO `menu` VALUES ('rice-bisi-bele-bath', 'Bisi Bele Bath', 'Classic hot lentil rice cooked with vegetables and aromatic spices, served with ghee.', 162.0, 180.0, '₹18.00 Off', 'Dakshin Rice', 1, 2, 4.7, 0, 1, '🍚', '/images/thali.png', 0);
INSERT INTO `menu` VALUES ('rice-curd', 'Creamy Curd Rice', 'Soft tempered rice mixed with fresh yogurt, mustard seeds, and curry leaves.', 126.0, 140.0, '₹14.00 Off', 'Dakshin Rice', 1, 0, 4.8, 0, 1, '🍚', '/images/thali.png', 0);
INSERT INTO `menu` VALUES ('rice-lemon', 'Tangy Lemon Rice', 'Zesty basmati rice cooked with peanuts, curry leaves, and fresh lemon juice.', 135.0, 150.0, '₹15.00 Off', 'Dakshin Rice', 1, 1, 4.6, 0, 1, '🍋', '/images/thali.png', 0);

INSERT INTO `menu` VALUES ('beverage-coffee', 'Madras Filter Coffee', 'Traditional frothed milk coffee brewed in a brass metal filter.', 63.0, 70.0, '₹7.00 Off', 'Beverages', 1, 0, 4.9, 1, 1, '☕', '/images/filter_coffee.png', 0);
INSERT INTO `menu` VALUES ('beverage-buttermilk', 'Spiced Neer Mor (Buttermilk)', 'Refreshing churned yogurt drink spiced with ginger, green chillies, and coriander.', 54.0, 60.0, '₹6.00 Off', 'Beverages', 1, 1, 4.7, 0, 1, '🥛', '/images/buttermilk.png', 0);
INSERT INTO `menu` VALUES ('dessert-choco-paniyaram', 'Chocolate Sweet Paniyaram', 'Sweet rice dumplings with a molten dark chocolate core, served with ice cream.', 144.0, 160.0, '₹16.00 Off', 'Beverages', 1, 0, 4.8, 1, 1, '🍫', '/images/choco_paniyaram.png', 0);
