-- AlterTable
ALTER TABLE "Garden" ADD COLUMN     "summaryAuthTag" BYTEA,
ADD COLUMN     "summaryCiphertext" BYTEA,
ADD COLUMN     "summaryIv" BYTEA,
ADD COLUMN     "summaryKeyVersion" INTEGER DEFAULT 1;
