CREATE TABLE `favorite_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`exercise_id` integer NOT NULL,
	`source` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `favorite_exercises_user_id_exercise_id_source_unique` ON `favorite_exercises` (`user_id`,`exercise_id`,`source`);--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`height` real,
	`weight` real,
	`height_unit` text DEFAULT 'cm' NOT NULL,
	`weight_unit` text DEFAULT 'kg' NOT NULL,
	`date_of_birth` text,
	`gender` text,
	`fitness_goal` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
DROP TABLE `cardio_stretching`;--> statement-breakpoint
DROP TABLE `equipment`;--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
DROP TABLE `muscle_groups`;--> statement-breakpoint
DROP TABLE `workout_logs`;--> statement-breakpoint
DROP TABLE `workout_plan_exercises`;--> statement-breakpoint
DROP TABLE `workout_plans`;