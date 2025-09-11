-- AlterTable
ALTER TABLE `userdetails` ADD COLUMN `status` ENUM('current', 'past') NOT NULL DEFAULT 'current';
