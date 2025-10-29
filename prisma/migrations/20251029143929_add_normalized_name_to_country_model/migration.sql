/*
  Warnings:

  - A unique constraint covering the columns `[normalized_name]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `normalized_name` to the `Country` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Country_name_key` ON `Country`;

-- AlterTable
ALTER TABLE `Country` ADD COLUMN `normalized_name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Country_normalized_name_key` ON `Country`(`normalized_name`);
