-- CreateEnum
CREATE TYPE "GardenType" AS ENUM ('CLASSIC', 'UNDERWATER', 'GALAXY');

-- AlterTable
ALTER TABLE "Garden" ADD COLUMN     "type" "GardenType" NOT NULL DEFAULT 'CLASSIC';
