CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`keyName` varchar(255) NOT NULL,
	`keyValue` varchar(255) NOT NULL,
	`keySecret` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_keyValue_unique` UNIQUE(`keyValue`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`authorId` int,
	`category` varchar(64),
	`tags` text,
	`featuredImageUrl` text,
	`publishStatus` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`viewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `driver_service_providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`businessRegistration` text,
	`taxNumber` varchar(64),
	`insuranceCertificate` text,
	`verificationStatus` enum('unverified','in_review','verified','rejected') NOT NULL DEFAULT 'unverified',
	`rating` decimal(3,2) DEFAULT '0.00',
	`totalOrders` int DEFAULT 0,
	`completedOrders` int DEFAULT 0,
	`averageResponseTime` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driver_service_providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `industry_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`industryType` varchar(128) NOT NULL,
	`industryName` varchar(255) NOT NULL,
	`description` text,
	`supportedServices` text,
	`specialRequirements` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `industry_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `industry_configs_industryType_unique` UNIQUE(`industryType`)
);
--> statement-breakpoint
CREATE TABLE `insurance_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`policyNumber` varchar(128) NOT NULL,
	`insuranceProvider` varchar(255) NOT NULL,
	`coverageAmount` decimal(10,2) NOT NULL,
	`deductible` decimal(10,2),
	`policyStartDate` timestamp NOT NULL,
	`policyEndDate` timestamp NOT NULL,
	`policyStatus` enum('active','expired','cancelled','claimed') NOT NULL DEFAULT 'active',
	`policyDocumentUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insurance_policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `insurance_policies_policyNumber_unique` UNIQUE(`policyNumber`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`driverId` int NOT NULL,
	`quotedPrice` decimal(10,2) NOT NULL,
	`estimatedDuration` int,
	`driverRating` decimal(3,2),
	`completedJobs` int,
	`offerStatus` enum('pending','accepted','rejected','expired') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricing_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceModel` enum('marketplace','transport_service') NOT NULL,
	`vehicleType` varchar(128) NOT NULL,
	`basePrice` decimal(10,2) NOT NULL,
	`pricePerKm` decimal(10,2),
	`insurancePercentage` decimal(5,2) DEFAULT '15.00',
	`commissionPercentage` decimal(5,2) DEFAULT '10.00',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`modelType` enum('marketplace','transport_service') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_models_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `telemetry_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`driverId` int NOT NULL,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`speed` decimal(6,2),
	`heading` decimal(6,2),
	`altitude` decimal(8,2),
	`accuracy` decimal(8,2),
	`timestamp` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `telemetry_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255) NOT NULL,
	`userCompany` varchar(255),
	`userRole` varchar(128),
	`content` text NOT NULL,
	`rating` int,
	`imageUrl` text,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transport_service_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`assignedDriverId` int,
	`assignedBy` int,
	`matchingScore` decimal(5,2),
	`assignmentStatus` enum('pending','assigned','accepted','rejected') NOT NULL DEFAULT 'pending',
	`assignedAt` timestamp,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transport_service_assignments_id` PRIMARY KEY(`id`)
);
