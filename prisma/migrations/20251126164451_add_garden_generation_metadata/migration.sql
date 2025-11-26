-- AlterTable
ALTER TABLE "Garden" ADD COLUMN     "archetype" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "earnestness" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "intensity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "intensityBand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "normalisedIntensity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "primaryEmotion" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "prompt" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "secondaryEmotions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "valence" TEXT NOT NULL DEFAULT '';
