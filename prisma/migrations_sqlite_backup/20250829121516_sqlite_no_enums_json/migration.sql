-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Garden" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "imageUrl" TEXT,
    "palette" TEXT,
    "seedValue" INTEGER NOT NULL,
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Garden" ("createdAt", "id", "imageUrl", "palette", "period", "periodKey", "seedValue", "status", "summary", "updatedAt") SELECT "createdAt", "id", "imageUrl", "palette", "period", "periodKey", "seedValue", "status", "summary", "updatedAt" FROM "Garden";
DROP TABLE "Garden";
ALTER TABLE "new_Garden" RENAME TO "Garden";
CREATE UNIQUE INDEX "Garden_period_periodKey_key" ON "Garden"("period", "periodKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
