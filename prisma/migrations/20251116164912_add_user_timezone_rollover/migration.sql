-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dayRolloverHour" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "notifyMonthlyGarden" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyWeeklyGarden" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyYearlyGarden" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';
