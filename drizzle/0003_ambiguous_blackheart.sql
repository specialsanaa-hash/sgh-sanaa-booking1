CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`appointmentDate` timestamp NOT NULL,
	`duration` int NOT NULL DEFAULT 30,
	`reason` text,
	`status` enum('scheduled','completed','cancelled','no-show') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`appointmentId` int,
	`invoiceNumber` varchar(50) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'YER',
	`description` text,
	`status` enum('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
	`dueDate` timestamp,
	`paidDate` timestamp,
	`paymentMethod` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `medicalRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`appointmentId` int,
	`recordType` enum('diagnosis','prescription','lab_report','imaging','procedure','note') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`findings` text,
	`recommendations` text,
	`attachmentUrl` varchar(500),
	`isVisible` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicalRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`senderId` int NOT NULL,
	`subject` varchar(255),
	`content` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`attachmentUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nationalId` varchar(20),
	`phone` varchar(20) NOT NULL,
	`dateOfBirth` timestamp,
	`gender` enum('male','female','other'),
	`bloodType` varchar(10),
	`address` text,
	`city` varchar(100),
	`emergencyContact` varchar(255),
	`emergencyPhone` varchar(20),
	`allergies` text,
	`chronicDiseases` text,
	`currentMedications` text,
	`insuranceProvider` varchar(255),
	`insuranceNumber` varchar(100),
	`profileImage` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `patients_nationalId_unique` UNIQUE(`nationalId`)
);
--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`appointmentId` int,
	`medicationName` varchar(255) NOT NULL,
	`dosage` varchar(100) NOT NULL,
	`frequency` varchar(100) NOT NULL,
	`duration` varchar(100) NOT NULL,
	`instructions` text,
	`sideEffects` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prescriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_doctorId_doctors_id_fk` FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_appointmentId_appointments_id_fk` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medicalRecords` ADD CONSTRAINT `medicalRecords_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medicalRecords` ADD CONSTRAINT `medicalRecords_doctorId_doctors_id_fk` FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medicalRecords` ADD CONSTRAINT `medicalRecords_appointmentId_appointments_id_fk` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_doctorId_doctors_id_fk` FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patients` ADD CONSTRAINT `patients_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_doctorId_doctors_id_fk` FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_appointmentId_appointments_id_fk` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE set null ON UPDATE no action;