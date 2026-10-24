CREATE TABLE `store_order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(32) NOT NULL,
	`productId` varchar(32) NOT NULL,
	`variantId` varchar(32) NOT NULL,
	`productName` varchar(220) NOT NULL,
	`colorName` varchar(80) NOT NULL,
	`unitPriceHalalas` int NOT NULL,
	`unitCostHalalas` int NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `store_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `store_orders` (
	`id` varchar(32) NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`customerName` varchar(180) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`city` varchar(120) NOT NULL,
	`address` text NOT NULL,
	`status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
	`subtotalHalalas` int NOT NULL,
	`shippingHalalas` int NOT NULL DEFAULT 0,
	`totalHalalas` int NOT NULL,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `store_orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `store_products` (
	`id` varchar(32) NOT NULL,
	`name` varchar(220) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`material` varchar(180),
	`imageUrl` text,
	`badge` varchar(80),
	`priceHalalas` int NOT NULL,
	`costHalalas` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `store_product_variants` (
	`id` varchar(32) NOT NULL,
	`productId` varchar(32) NOT NULL,
	`name` varchar(80) NOT NULL,
	`hex` varchar(16) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_product_variants_id` PRIMARY KEY(`id`),
	CONSTRAINT `store_variant_product_color_unique` UNIQUE(`productId`,`name`)
);
--> statement-breakpoint
ALTER TABLE `store_order_items` ADD CONSTRAINT `store_order_items_orderId_store_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `store_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `store_order_items` ADD CONSTRAINT `store_order_items_productId_store_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `store_products`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `store_order_items` ADD CONSTRAINT `store_order_items_variantId_store_product_variants_id_fk` FOREIGN KEY (`variantId`) REFERENCES `store_product_variants`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `store_orders` ADD CONSTRAINT `store_orders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `store_product_variants` ADD CONSTRAINT `store_product_variants_productId_store_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `store_products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `store_order_items_order_idx` ON `store_order_items` (`orderId`);--> statement-breakpoint
CREATE INDEX `store_orders_user_created_idx` ON `store_orders` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `store_orders_payment_created_idx` ON `store_orders` (`paymentStatus`,`createdAt`);--> statement-breakpoint
CREATE INDEX `store_products_active_created_idx` ON `store_products` (`active`,`createdAt`);--> statement-breakpoint
CREATE INDEX `store_variants_product_idx` ON `store_product_variants` (`productId`);