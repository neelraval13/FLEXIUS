CREATE TABLE `cardio_stretching` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`target_muscle` text NOT NULL,
	`category` text NOT NULL,
	`equipment_used` text NOT NULL,
	`difficulty` text NOT NULL,
	`alternatives` text NOT NULL,
	`video_url` text
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `equipment_name_unique` ON `equipment` (`name`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`target_muscle` text NOT NULL,
	`muscle_group` text NOT NULL,
	`equipment_used` text NOT NULL,
	`difficulty` text NOT NULL,
	`alternatives` text NOT NULL,
	`video_url` text
);
--> statement-breakpoint
CREATE TABLE `muscle_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`major_group` text NOT NULL,
	`target_muscle` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exercise_id` integer NOT NULL,
	`exercise_source` text NOT NULL,
	`performed_at` text NOT NULL,
	`sets` integer,
	`reps` integer,
	`weight` real,
	`unit` text,
	`duration_minutes` integer,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `workout_plan_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`exercise_source` text NOT NULL,
	`order_index` integer NOT NULL,
	`sets` integer,
	`reps` integer,
	`target_weight` real,
	`unit` text DEFAULT 'kg',
	`rest_seconds` integer,
	`notes` text,
	`completed` integer DEFAULT 0,
	FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`title` text,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_plans_date_unique` ON `workout_plans` (`date`);