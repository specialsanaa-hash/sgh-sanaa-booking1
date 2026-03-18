CREATE TABLE `apiKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`secret` varchar(255) NOT NULL,
	`description` text,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiKeys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `messageSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platformUrl` varchar(500) NOT NULL,
	`socketUrl` varchar(500) NOT NULL,
	`apiKey` varchar(255) NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messageSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socketConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiKeyId` int NOT NULL,
	`socketId` varchar(255) NOT NULL,
	`deviceId` varchar(255),
	`platform` varchar(50),
	`deviceInfo` json,
	`batteryLevel` int,
	`batteryState` varchar(50),
	`isCharging` tinyint DEFAULT 0,
	`networkType` varchar(50),
	`isOnline` tinyint NOT NULL DEFAULT 1,
	`lastHeartbeat` timestamp,
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`disconnectedAt` timestamp,
	CONSTRAINT `socketConnections_id` PRIMARY KEY(`id`),
	CONSTRAINT `socketConnections_socketId_unique` UNIQUE(`socketId`)
);
--> statement-breakpoint
CREATE TABLE `socketMessageLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`socketConnectionId` int NOT NULL,
	`messageId` varchar(255) NOT NULL,
	`type` enum('send_message','device_status','message_response','command','command_response') NOT NULL,
	`direction` enum('sent','received') NOT NULL,
	`payload` json,
	`status` enum('pending','sent','delivered','failed') NOT NULL DEFAULT 'pending',
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `socketMessageLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `messages` DROP FOREIGN KEY `messages_patientId_patients_id_fk`;
--> statement-breakpoint
ALTER TABLE `messages` DROP FOREIGN KEY `messages_doctorId_doctors_id_fk`;
--> statement-breakpoint
ALTER TABLE `messages` DROP FOREIGN KEY `messages_senderId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `messages` ADD `messageText` text NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `messageType` enum('SMS','WhatsApp') NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `direction` enum('sent','received') NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `status` enum('pending','sent','delivered','failed','read') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `externalId` varchar(255);--> statement-breakpoint
ALTER TABLE `messages` ADD `relatedBookingId` int;--> statement-breakpoint
ALTER TABLE `messages` ADD `relatedPatientId` int;--> statement-breakpoint
ALTER TABLE `messages` ADD `metadata` json;--> statement-breakpoint
ALTER TABLE `apiKeys` ADD CONSTRAINT `apiKeys_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `socketConnections` ADD CONSTRAINT `socketConnections_apiKeyId_apiKeys_id_fk` FOREIGN KEY (`apiKeyId`) REFERENCES `apiKeys`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `socketMessageLogs` ADD CONSTRAINT `socketMessageLogs_socketConnectionId_socketConnections_id_fk` FOREIGN KEY (`socketConnectionId`) REFERENCES `socketConnections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `patientId`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `doctorId`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `senderId`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `subject`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `content`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `isRead`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `attachmentUrl`;