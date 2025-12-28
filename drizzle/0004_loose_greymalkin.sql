CREATE TABLE `sms_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumber` varchar(32) NOT NULL,
	`messageType` varchar(64) NOT NULL,
	`messageContent` text NOT NULL,
	`status` enum('pending','sent','failed','delivered') NOT NULL DEFAULT 'pending',
	`externalId` varchar(255),
	`sentAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sms_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_verification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`verificationStatus` enum('unverified','in_review','verified','rejected','suspended') NOT NULL DEFAULT 'unverified',
	`businessName` varchar(255),
	`businessAddress` text,
	`taxNumber` varchar(64),
	`minAge` int,
	`licenseClass` varchar(10),
	`vehicleType` varchar(100),
	`insuranceValid` boolean DEFAULT false,
	`insuranceExpiryDate` timestamp,
	`rejectionReason` text,
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_verification_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_verification_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `verification_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('business_registration','id_document','tax_number','drivers_license','liability_insurance','vehicle_insurance','transport_insurance') NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`verificationStatus` enum('unverified','in_review','verified','rejected') NOT NULL DEFAULT 'unverified',
	`rejectionReason` text,
	`expiryDate` timestamp,
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_documents_id` PRIMARY KEY(`id`)
);
