CREATE TABLE `doctorBookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`patientName` varchar(255) NOT NULL,
	`patientEmail` varchar(320),
	`patientPhone` varchar(20) NOT NULL,
	`appointmentDate` timestamp,
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctorBookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialty` varchar(255) NOT NULL,
	`bio` text,
	`image` varchar(500),
	`experience` varchar(100),
	`qualifications` text,
	`phone` varchar(20),
	`email` varchar(320),
	`isActive` int NOT NULL DEFAULT 1,
	`slug` varchar(255) NOT NULL,
	`metaTitle` varchar(255),
	`metaDescription` varchar(500),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctors_id` PRIMARY KEY(`id`),
	CONSTRAINT `doctors_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `staticPages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`image` varchar(500),
	`isPublished` int NOT NULL DEFAULT 1,
	`isVisible` int NOT NULL DEFAULT 1,
	`order` int NOT NULL DEFAULT 0,
	`metaTitle` varchar(255),
	`metaDescription` varchar(500),
	`metaKeywords` varchar(500),
	`canonicalUrl` varchar(500),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staticPages_id` PRIMARY KEY(`id`),
	CONSTRAINT `staticPages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `doctorBookings` ADD CONSTRAINT `doctorBookings_doctorId_doctors_id_fk` FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staticPages` ADD CONSTRAINT `staticPages_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;