/*
  Warnings:

  - A unique constraint covering the columns `[shareId]` on the table `Garden` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Garden" ADD COLUMN "shareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Garden_shareId_key" ON "Garden"("shareId");
