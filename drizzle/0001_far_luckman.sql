CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(128) NOT NULL,
	`entityType` varchar(64),
	`entityId` int,
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driver_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`licenseNumber` varchar(64),
	`vehicleType` text,
	`experienceYears` int,
	`rating` decimal(3,2) DEFAULT '0.00',
	`totalEarnings` decimal(10,2) NOT NULL DEFAULT '0.00',
	`completedOrders` int NOT NULL DEFAULT 0,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driver_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`driverId` int,
	`vehicleType` varchar(128) NOT NULL,
	`vehicleMake` varchar(128),
	`vehicleModel` varchar(128),
	`pickupLocation` text NOT NULL,
	`deliveryLocation` text NOT NULL,
	`pickupDate` timestamp NOT NULL,
	`deliveryDate` timestamp,
	`status` enum('erstellt','bestätigt','unterwegs','abgeschlossen','storniert') NOT NULL DEFAULT 'erstellt',
	`totalPrice` decimal(10,2) NOT NULL,
	`insuranceFee` decimal(10,2) NOT NULL,
	`systemCommission` decimal(10,2) NOT NULL,
	`driverPayout` decimal(10,2) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`clientId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('stripe','paypal') NOT NULL,
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(255),
	`paymentIntentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`driverId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`payoutStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`payoutMethod` varchar(64),
	`transactionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configKey` varchar(128) NOT NULL,
	`configValue` text NOT NULL,
	`description` text,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_config_configKey_unique` UNIQUE(`configKey`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(64) NOT NULL DEFAULT 'password';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','admin','client','driver') NOT NULL DEFAULT 'client';--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);