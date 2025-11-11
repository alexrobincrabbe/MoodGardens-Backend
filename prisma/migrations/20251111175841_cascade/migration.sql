/*
  Warnings:

  - You are about to drop the column `songUrl` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `palette` on the `Garden` table. All the data in the column will be lost.
  - You are about to drop the column `seedValue` on the `Garden` table. All the data in the column will be lost.
  - The `period` column on the `Garden` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Garden` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `userId` on table `Entry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Garden` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GardenPeriod" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "GardenStatus" AS ENUM ('PENDING', 'GENERATING', 'READY', 'FAILED');

-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_userId_fkey";

-- DropForeignKey
ALTER TABLE "Garden" DROP CONSTRAINT "Garden_userId_fkey";

-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "songUrl",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Garden" DROP COLUMN "palette",
DROP COLUMN "seedValue",
DROP COLUMN "period",
ADD COLUMN     "period" "GardenPeriod" NOT NULL DEFAULT 'DAY',
DROP COLUMN "status",
ADD COLUMN     "status" "GardenStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Garden_userId_period_periodKey_key" ON "Garden"("userId", "period", "periodKey");

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garden" ADD CONSTRAINT "Garden_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
