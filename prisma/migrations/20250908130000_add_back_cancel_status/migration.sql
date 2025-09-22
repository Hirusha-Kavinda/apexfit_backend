-- AlterEnum
ALTER TABLE `Meeting` MODIFY COLUMN `status` ENUM('pending', 'cancel', 'complete') NOT NULL DEFAULT 'pending';















