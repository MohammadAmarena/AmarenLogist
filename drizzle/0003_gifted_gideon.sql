CREATE TABLE `invoice_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`description` text NOT NULL,
	`quantity` decimal(10,2) NOT NULL DEFAULT '1',
	`unitPrice` decimal(10,2) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`taxRate` decimal(5,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`paymentAmount` decimal(10,2) NOT NULL,
	`paymentDate` timestamp NOT NULL DEFAULT (now()),
	`paymentMethod` varchar(64),
	`transactionId` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(64) NOT NULL,
	`orderId` int NOT NULL,
	`recipientType` enum('client','driver') NOT NULL,
	`recipientId` int NOT NULL,
	`recipientName` text NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`recipientAddress` text,
	`invoiceDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` timestamp,
	`totalAmount` decimal(10,2) NOT NULL,
	`taxAmount` decimal(10,2) DEFAULT '0.00',
	`invoiceStatus` enum('draft','sent','viewed','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`pdfUrl` text,
	`pdfKey` varchar(255),
	`notes` text,
	`paymentTerms` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
