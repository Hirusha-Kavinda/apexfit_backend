-- CreateTable
CREATE TABLE `ExerciseTracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `exercisePlanId` INTEGER NOT NULL,
    `day` VARCHAR(191) NOT NULL,
    `weekStartDate` DATETIME(3) NOT NULL,
    `status` ENUM('complete', 'lost') NOT NULL DEFAULT 'lost',
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExerciseTracking` ADD CONSTRAINT `ExerciseTracking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExerciseTracking` ADD CONSTRAINT `ExerciseTracking_exercisePlanId_fkey` FOREIGN KEY (`exercisePlanId`) REFERENCES `ExercisePlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;










