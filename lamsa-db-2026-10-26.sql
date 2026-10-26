-- Lamsa Store DB Backup
-- Date: 2026-10-26T13:06:32.993Z
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userEmail` varchar(255) NOT NULL,
  `productId` varchar(50) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `color` varchar(50) DEFAULT NULL,
  `size` varchar(20) DEFAULT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `unique_cart` (`userEmail`,`productId`,`color`,`size`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

INSERT INTO `carts` (id, userEmail, productId, quantity, color, size, createdAt) VALUES (1, 'admin@lamsa.com', 'p1', 2, 'أبيض', 'S', Sun Oct 25 2026 14:12:59 GMT+0300 (Arabian Standard Time));

DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discountPercent` int NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `type` varchar(50) DEFAULT 'info',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` varchar(50) NOT NULL,
  `color` varchar(50) NOT NULL,
  `size` varchar(20) NOT NULL,
  `price` int NOT NULL,
  `stock` int DEFAULT '10',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `unique_variant` (`productId`,`color`,`size`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;

INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (1, 'p1', 'أحمر', 'M', 18000, 5, Sun Oct 25 2026 00:14:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (2, 'p2', 'أحمر', 'S', 12000, 5, Sun Oct 25 2026 00:16:54 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (3, 'p2', 'أحمر', 'M', 15000, 10, Sun Oct 25 2026 00:16:54 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (4, 'p2', 'أسود', 'L', 13000, 3, Sun Oct 25 2026 00:16:54 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (5, 'p2', 'أبيض', 'XL', 14000, 7, Sun Oct 25 2026 00:16:54 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (6, 'p1', 'أحمر', 'S', 15000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (8, 'p1', 'أحمر', 'L', 17000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (9, 'p1', 'أحمر', 'XL', 18000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (10, 'p1', 'أسود', 'S', 15000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (11, 'p1', 'أسود', 'M', 16000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (12, 'p1', 'أسود', 'L', 17000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (13, 'p1', 'أسود', 'XL', 18000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (14, 'p1', 'أبيض', 'S', 15000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (15, 'p1', 'أبيض', 'M', 16000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (16, 'p1', 'أبيض', 'L', 17000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (17, 'p1', 'أبيض', 'XL', 18000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (18, 'p10', 'أحمر', 'S', 35000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (19, 'p10', 'أحمر', 'M', 36000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (20, 'p10', 'أحمر', 'L', 37000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (21, 'p10', 'أحمر', 'XL', 38000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (22, 'p10', 'أسود', 'S', 35000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (23, 'p10', 'أسود', 'M', 36000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (24, 'p10', 'أسود', 'L', 37000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (25, 'p10', 'أسود', 'XL', 38000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (26, 'p10', 'أبيض', 'S', 35000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (27, 'p10', 'أبيض', 'M', 36000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (28, 'p10', 'أبيض', 'L', 37000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (29, 'p10', 'أبيض', 'XL', 38000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (30, 'p11', 'أحمر', 'S', 80000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (31, 'p11', 'أحمر', 'M', 81000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (32, 'p11', 'أحمر', 'L', 82000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (33, 'p11', 'أحمر', 'XL', 83000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (34, 'p11', 'أسود', 'S', 80000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (35, 'p11', 'أسود', 'M', 81000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (36, 'p11', 'أسود', 'L', 82000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (37, 'p11', 'أسود', 'XL', 83000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (38, 'p11', 'أبيض', 'S', 80000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (39, 'p11', 'أبيض', 'M', 81000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (40, 'p11', 'أبيض', 'L', 82000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (41, 'p11', 'أبيض', 'XL', 83000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (42, 'p12', 'أحمر', 'S', 18000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (43, 'p12', 'أحمر', 'M', 19000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (44, 'p12', 'أحمر', 'L', 20000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (45, 'p12', 'أحمر', 'XL', 21000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (46, 'p12', 'أسود', 'S', 18000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (47, 'p12', 'أسود', 'M', 19000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (48, 'p12', 'أسود', 'L', 20000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (49, 'p12', 'أسود', 'XL', 21000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (50, 'p12', 'أبيض', 'S', 18000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (51, 'p12', 'أبيض', 'M', 19000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (52, 'p12', 'أبيض', 'L', 20000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (53, 'p12', 'أبيض', 'XL', 21000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (56, 'p2', 'أحمر', 'L', 24000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (57, 'p2', 'أحمر', 'XL', 25000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (58, 'p2', 'أسود', 'S', 22000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (59, 'p2', 'أسود', 'M', 23000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (61, 'p2', 'أسود', 'XL', 25000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (62, 'p2', 'أبيض', 'S', 22000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (63, 'p2', 'أبيض', 'M', 23000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (64, 'p2', 'أبيض', 'L', 24000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (66, 'p20', 'أحمر', 'S', 45000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (67, 'p20', 'أحمر', 'M', 46000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (68, 'p20', 'أحمر', 'L', 47000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (69, 'p20', 'أحمر', 'XL', 48000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (70, 'p20', 'أسود', 'S', 45000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (71, 'p20', 'أسود', 'M', 46000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (72, 'p20', 'أسود', 'L', 47000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (73, 'p20', 'أسود', 'XL', 48000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (74, 'p20', 'أبيض', 'S', 45000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (75, 'p20', 'أبيض', 'M', 46000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (76, 'p20', 'أبيض', 'L', 47000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (77, 'p20', 'أبيض', 'XL', 48000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (78, 'p21', 'أحمر', 'S', 12000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (79, 'p21', 'أحمر', 'M', 13000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (80, 'p21', 'أحمر', 'L', 14000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (81, 'p21', 'أحمر', 'XL', 15000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (82, 'p21', 'أسود', 'S', 12000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (83, 'p21', 'أسود', 'M', 13000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (84, 'p21', 'أسود', 'L', 14000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (85, 'p21', 'أسود', 'XL', 15000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (86, 'p21', 'أبيض', 'S', 12000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (87, 'p21', 'أبيض', 'M', 13000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (88, 'p21', 'أبيض', 'L', 14000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (89, 'p21', 'أبيض', 'XL', 15000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (90, 'p3', 'أحمر', 'S', 8000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (91, 'p3', 'أحمر', 'M', 9000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (92, 'p3', 'أحمر', 'L', 10000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (93, 'p3', 'أحمر', 'XL', 11000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (94, 'p3', 'أسود', 'S', 8000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (95, 'p3', 'أسود', 'M', 9000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (96, 'p3', 'أسود', 'L', 10000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (97, 'p3', 'أسود', 'XL', 11000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (98, 'p3', 'أبيض', 'S', 8000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (99, 'p3', 'أبيض', 'M', 9000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (100, 'p3', 'أبيض', 'L', 10000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (101, 'p3', 'أبيض', 'XL', 11000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (102, 'p30', 'أحمر', 'S', 6500, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (103, 'p30', 'أحمر', 'M', 7500, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (104, 'p30', 'أحمر', 'L', 8500, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (105, 'p30', 'أحمر', 'XL', 9500, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (106, 'p30', 'أسود', 'S', 6500, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (107, 'p30', 'أسود', 'M', 7500, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (108, 'p30', 'أسود', 'L', 8500, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (109, 'p30', 'أسود', 'XL', 9500, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (110, 'p30', 'أبيض', 'S', 6500, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (111, 'p30', 'أبيض', 'M', 7500, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (112, 'p30', 'أبيض', 'L', 8500, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (113, 'p30', 'أبيض', 'XL', 9500, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (114, 'p31', 'أحمر', 'S', 20000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (115, 'p31', 'أحمر', 'M', 21000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (116, 'p31', 'أحمر', 'L', 22000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (117, 'p31', 'أحمر', 'XL', 23000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (118, 'p31', 'أسود', 'S', 20000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (119, 'p31', 'أسود', 'M', 21000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (120, 'p31', 'أسود', 'L', 22000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (121, 'p31', 'أسود', 'XL', 23000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (122, 'p31', 'أبيض', 'S', 20000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (123, 'p31', 'أبيض', 'M', 21000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (124, 'p31', 'أبيض', 'L', 22000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (125, 'p31', 'أبيض', 'XL', 23000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (126, 'p4', 'أحمر', 'S', 12000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (127, 'p4', 'أحمر', 'M', 13000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (128, 'p4', 'أحمر', 'L', 14000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (129, 'p4', 'أحمر', 'XL', 15000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (130, 'p4', 'أسود', 'S', 12000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (131, 'p4', 'أسود', 'M', 13000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (132, 'p4', 'أسود', 'L', 14000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (133, 'p4', 'أسود', 'XL', 15000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (134, 'p4', 'أبيض', 'S', 12000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (135, 'p4', 'أبيض', 'M', 13000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (136, 'p4', 'أبيض', 'L', 14000, 14, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (137, 'p4', 'أبيض', 'XL', 15000, 16, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (138, 'p40', 'أحمر', 'S', 15000, 10, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (139, 'p40', 'أحمر', 'M', 16000, 12, Sun Oct 25 2026 00:22:48 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (140, 'p40', 'أحمر', 'L', 17000, 14, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (141, 'p40', 'أحمر', 'XL', 18000, 16, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (142, 'p40', 'أسود', 'S', 15000, 10, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (143, 'p40', 'أسود', 'M', 16000, 12, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (144, 'p40', 'أسود', 'L', 17000, 14, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (145, 'p40', 'أسود', 'XL', 18000, 16, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (146, 'p40', 'أبيض', 'S', 15000, 10, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (147, 'p40', 'أبيض', 'M', 16000, 12, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (148, 'p40', 'أبيض', 'L', 17000, 14, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (149, 'p40', 'أبيض', 'XL', 18000, 16, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (150, 'p41', 'أحمر', 'S', 7500, 10, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (151, 'p41', 'أحمر', 'M', 8500, 12, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (152, 'p41', 'أحمر', 'L', 9500, 14, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (153, 'p41', 'أحمر', 'XL', 10500, 16, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (154, 'p41', 'أسود', 'S', 7500, 10, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (155, 'p41', 'أسود', 'M', 8500, 12, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (156, 'p41', 'أسود', 'L', 9500, 14, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (157, 'p41', 'أسود', 'XL', 10500, 16, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (158, 'p41', 'أبيض', 'S', 7500, 10, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (159, 'p41', 'أبيض', 'M', 8500, 12, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (160, 'p41', 'أبيض', 'L', 9500, 14, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `product_variants` (id, productId, color, size, price, stock, createdAt) VALUES (161, 'p41', 'أبيض', 'XL', 10500, 16, Sun Oct 25 2026 00:22:49 GMT+0300 (Arabian Standard Time));

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` varchar(50) NOT NULL,
  `userName` varchar(100) NOT NULL,
  `rating` int NOT NULL,
  `comment` text DEFAULT NULL,
  `imageUrl` varchar(500) DEFAULT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int NOT NULL DEFAULT '1',
  `storeName` varchar(255) DEFAULT 'متجر لمسة',
  `logoUrl` varchar(500) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

DROP TABLE IF EXISTS `store_orders`;
CREATE TABLE `store_orders` (
  `id` varchar(50) NOT NULL,
  `orderNumber` varchar(50) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `customerName` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `customerEmail` varchar(255) DEFAULT NULL,
  `items` text NOT NULL,
  `totalAmount` int NOT NULL,
  `subtotalHalalas` int DEFAULT '0',
  `totalHalalas` int DEFAULT '0',
  `status` varchar(50) DEFAULT 'pending',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-052410', 'LMS-052410', NULL, 'اختبار', '123', 'صنعاء', NULL, NULL, '[{"id":"p1","quantity":1}]', 100, 0, 10000, 'cancelled', Sat Oct 24 2026 22:10:52 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-106653', 'LMS-106653', NULL, 'برهان الزكري', '775799926', 'تعز', NULL, NULL, '[{"id":"p10","name":"فستان سهرة مخملي","category":"فساتين","description":"منتج تجريبي لمتجر لمسة","image":"https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500","images":"https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500","price":35000,"compareAtHalalas":4000000,"badge":"جديد","material":null,"rating":"4.9","stock":20,"quantity":1,"size":"","color":""},{"id":"p1","name":"فستان صيفي برقوقي","category":"فساتين","description":"فستان أنيق","image":"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500","images":"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500,https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500","price":15000,"compareAtHalalas":1505000,"badge":"الأكثر مبيعاً","material":null,"rating":"4.8","stock":20,"quantity":1,"size":"","color":""}]', 50000, 0, 5000000, 'pending', Sat Oct 24 2026 22:11:46 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-290531', 'LMS-290531', NULL, 'اختبار', '123', 'صنعاء', NULL, 'test@lamsa.com', '[{"id":"p1","quantity":1}]', 100, 0, 10000, 'shipped', Sat Oct 24 2026 22:31:30 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-342936', 'LMS-342936', NULL, 'اختبار', '123', 'صنعاء', NULL, 'test@lamsa.com', '[{"id":"p1","quantity":1}]', 100, 0, 10000, 'shipped', Sat Oct 24 2026 22:32:22 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-395877', 'LMS-395877', NULL, 'برهان', '775799926', 'التربه', NULL, 'admin@lamsa.com', '[{"id":"p11","name":"فستان زفاف كلاسيك","category":"فساتين","description":"منتج تجريبي لمتجر لمسة","image":"https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=500","images":"https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=500","price":80000,"compareAtHalalas":8500000,"badge":"مميز","material":null,"rating":"5.0","stock":20,"quantity":1,"size":"","color":""}]', 80000, 0, 8000000, 'pending', Sat Oct 24 2026 22:33:15 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-596076', 'LMS-596076', NULL, 'برهان الزكري', '775799926', 'تعز', NULL, 'admin@lamsa.com', '[{"id":"p40","name":"حذاء رياضي أبيض","category":"أحذية","description":"منتج تجريبي لمتجر لمسة","image":"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500","images":"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500","price":15000,"compareAtHalalas":2000000,"badge":"","material":null,"rating":"4.7","stock":20,"quantity":1,"size":"","color":""}]', 15000, 0, 1500000, 'completed', Sat Oct 24 2026 22:36:36 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-REP-1', 'LMS-REP-1', NULL, 'عميل تجريبي', '0000000000', 'صنعاء', NULL, 'test@lamsa.com', '[]', 6000, 0, 0, 'completed', Fri Oct 23 2026 21:27:42 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-REP-10', 'LMS-REP-10', NULL, 'عميل تجريبي', '0000000000', 'صنعاء', NULL, 'test@lamsa.com', '[]', 15000, 0, 0, 'completed', Wed Oct 14 2026 21:27:43 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-REP-15', 'LMS-REP-15', NULL, 'عميل تجريبي', '0000000000', 'صنعاء', NULL, 'test@lamsa.com', '[]', 20000, 0, 0, 'completed', Fri Oct 09 2026 21:27:43 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-REP-20', 'LMS-REP-20', NULL, 'عميل تجريبي', '0000000000', 'صنعاء', NULL, 'test@lamsa.com', '[]', 25000, 0, 0, 'completed', Sun Oct 04 2026 21:27:43 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-REP-3', 'LMS-REP-3', NULL, 'عميل تجريبي', '0000000000', 'صنعاء', NULL, 'test@lamsa.com', '[]', 8000, 0, 0, 'completed', Wed Oct 21 2026 21:27:43 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-REP-5', 'LMS-REP-5', NULL, 'عميل تجريبي', '0000000000', 'صنعاء', NULL, 'test@lamsa.com', '[]', 10000, 0, 0, 'completed', Mon Oct 19 2026 21:27:43 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_orders` (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) VALUES ('LMS-REP-7', 'LMS-REP-7', NULL, 'عميل تجريبي', '0000000000', 'صنعاء', NULL, 'test@lamsa.com', '[]', 12000, 0, 0, 'completed', Sat Oct 17 2026 21:27:43 GMT+0300 (Arabian Standard Time));

DROP TABLE IF EXISTS `store_product_variants`;
CREATE TABLE `store_product_variants` (
  `id` varchar(32) NOT NULL,
  `productId` varchar(32) NOT NULL,
  `name` varchar(80) NOT NULL,
  `hex` varchar(16) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `store_variants_product_idx` (`productId`),
  UNIQUE KEY `store_variant_product_color_unique` (`productId`,`name`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

DROP TABLE IF EXISTS `store_products`;
CREATE TABLE `store_products` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `imageUrl` varchar(500) DEFAULT NULL,
  `images` text DEFAULT NULL,
  `priceHalalas` int NOT NULL,
  `costHalalas` int DEFAULT '0',
  `compareAtHalalas` int DEFAULT NULL,
  `badge` varchar(50) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT '4.5',
  `stock` int DEFAULT '20',
  `active` tinyint(1) DEFAULT '1',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p1', 'فستان صيفي برقوقي', 'فستان أنيق', 'فساتين', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500,https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500', 1500000, 500000, 1505000, 'الأكثر مبيعاً', NULL, '4.8', 19, 1, Sat Oct 24 2026 20:24:54 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p10', 'فستان سهرة مخملي', 'منتج تجريبي لمتجر لمسة', 'فساتين', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500', 3500000, 1200000, 4000000, 'جديد', NULL, '4.9', 20, 1, Sat Oct 24 2026 21:23:50 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p11', 'فستان زفاف كلاسيك', 'منتج تجريبي لمتجر لمسة', 'فساتين', 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=500', 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=500', 8000000, 3000000, 8500000, 'مميز', NULL, '5.0', 19, 1, Sat Oct 24 2026 21:23:50 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p12', 'فستان صيفي مشجر', 'منتج تجريبي لمتجر لمسة', 'فساتين', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', 1800000, 600000, 2300000, '', NULL, '4.2', 20, 1, Sat Oct 24 2026 21:23:50 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p2', 'عباية كلاسيكية', 'عباية سوداء', 'عبايات', 'https://images.unsplash.com/photo-1583391733959-4705f205e5b2?w=500', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500,https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500', 2200000, 800000, 2205000, 'الأكثر مبيعاً', NULL, '4.8', 20, 1, Sat Oct 24 2026 20:24:54 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p20', 'عباية مطرزة فاخرة', 'منتج تجريبي لمتجر لمسة', 'عبايات', 'https://images.unsplash.com/photo-1584285405401-0e5f9675e8d2?w=500', 'https://images.unsplash.com/photo-1584285405401-0e5f9675e8d2?w=500', 4500000, 1500000, 5000000, 'الأكثر مبيعاً', NULL, '4.8', 20, 1, Sat Oct 24 2026 21:23:50 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p21', 'عباية كاجوال', 'منتج تجريبي لمتجر لمسة', 'عبايات', 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=500', 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=500', 1200000, 400000, 1700000, '', NULL, '4.0', 20, 1, Sat Oct 24 2026 21:23:50 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p3', 'حقيبة يد جلدية', 'حقيبة بسيطة', 'حقائب', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500,https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500', 800000, 300000, 805000, 'الأكثر مبيعاً', NULL, '4.8', 20, 1, Sat Oct 24 2026 20:24:54 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p30', 'حقيبة كتف صغيرة', 'منتج تجريبي لمتجر لمسة', 'حقائب', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500', 650000, 200000, 1150000, '', NULL, '4.3', 20, 1, Sat Oct 24 2026 21:23:50 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p31', 'حقيبة سفر جلدية', 'منتج تجريبي لمتجر لمسة', 'حقائب', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 2000000, 700000, 2500000, 'عرض', NULL, '4.6', 20, 1, Sat Oct 24 2026 21:23:50 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p4', 'حذاء كعب عالي', 'حذاء أنيق', 'أحذية', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500,https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500', 1200000, 400000, 1205000, 'الأكثر مبيعاً', NULL, '4.8', 20, 1, Sat Oct 24 2026 20:24:54 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p40', 'حذاء رياضي أبيض', 'منتج تجريبي لمتجر لمسة', 'أحذية', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', 1500000, 500000, 2000000, '', NULL, '4.7', 19, 1, Sat Oct 24 2026 21:23:50 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('p41', 'صندل صيفي', 'منتج تجريبي لمتجر لمسة', 'أحذية', 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=500', 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=500', 750000, 250000, 1250000, '', NULL, '4.1', 20, 1, Sat Oct 24 2026 21:23:50 GMT+0300 (Arabian Standard Time));
INSERT INTO `store_products` (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) VALUES ('test_1793019047540', 'Test Product After Edit', 'Test Description', 'Shoes', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500', NULL, 20000, 5000, NULL, NULL, NULL, '4.5', 10, 1, Mon Oct 26 2026 12:50:48 GMT+0300 (Arabian Standard Time));

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `openId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=120001;

INSERT INTO `users` (id, name, email, password, role, openId, createdAt) VALUES (1, 'مدير المتجر', 'admin@lamsa.com', '$2b$10$ZUD4LsmZsnlhYzDs0vzF3eqc8axfquOan6bb5JGwXw7Xt5n1ZAXVi', 'admin', NULL, Sat Oct 24 2026 22:35:20 GMT+0300 (Arabian Standard Time));
INSERT INTO `users` (id, name, email, password, role, openId, createdAt) VALUES (60001, 'برهان الزكري', 'burhanalzekri77@gmail.com', '$2b$10$BIcTNyoeQKAKl8H36MXhl.F98vN2QXjVlzj4wJNHbRHWLMgpGXvUW', 'user', 'burhanalzekri77@gmail.com', Sun Oct 25 2026 16:29:49 GMT+0300 (Arabian Standard Time));
INSERT INTO `users` (id, name, email, password, role, openId, createdAt) VALUES (90001, 'برهان الزكري', 'burhanalzekri733@gmail.com', '$2b$10$damXjiRnwFMwrR27azYeW.JPMsDuNzI8dhSAlr0unTWif6pvg65MG', 'user', 'burhanalzekri733@gmail.com', Sun Oct 25 2026 16:41:08 GMT+0300 (Arabian Standard Time));

DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userEmail` varchar(255) NOT NULL,
  `productId` varchar(50) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `unique_wish` (`userEmail`,`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

SET FOREIGN_KEY_CHECKS=1;
