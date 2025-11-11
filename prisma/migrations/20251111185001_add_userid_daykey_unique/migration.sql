/*
  Warnings:

  - A unique constraint covering the columns `[userId,dayKey]` on the table `Entry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Entry_userId_dayKey_key" ON "Entry"("userId", "dayKey");
