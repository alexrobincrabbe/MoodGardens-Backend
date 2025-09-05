-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "songUrl" TEXT,
    "dayKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "Entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Entry" ("createdAt", "dayKey", "id", "songUrl", "text") SELECT "createdAt", "dayKey", "id", "songUrl", "text" FROM "Entry";
DROP TABLE "Entry";
ALTER TABLE "new_Entry" RENAME TO "Entry";
CREATE INDEX "Entry_dayKey_idx" ON "Entry"("dayKey");
CREATE INDEX "Entry_userId_dayKey_idx" ON "Entry"("userId", "dayKey");
CREATE TABLE "new_Garden" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "imageUrl" TEXT,
    "palette" TEXT,
    "seedValue" INTEGER NOT NULL,
    "summary" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Garden_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Garden" ("createdAt", "id", "imageUrl", "palette", "period", "periodKey", "progress", "seedValue", "status", "summary", "updatedAt") SELECT "createdAt", "id", "imageUrl", "palette", "period", "periodKey", "progress", "seedValue", "status", "summary", "updatedAt" FROM "Garden";
DROP TABLE "Garden";
ALTER TABLE "new_Garden" RENAME TO "Garden";
CREATE UNIQUE INDEX "Garden_userId_period_periodKey_key" ON "Garden"("userId", "period", "periodKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
