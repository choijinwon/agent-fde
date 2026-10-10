CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`payload_hash` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`service` text NOT NULL,
	`budget` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT '접수 완료' NOT NULL,
	`consent_version` text DEFAULT '2026-10-11' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_reference_unique` ON `inquiries` (`reference`);--> statement-breakpoint
CREATE INDEX `inquiries_created_at_idx` ON `inquiries` (`created_at`);--> statement-breakpoint
CREATE TABLE `inquiry_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 1 NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `inquiry_rate_limits_expiry_idx` ON `inquiry_rate_limits` (`expires_at`);