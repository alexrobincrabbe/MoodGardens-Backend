-- DropForeignKey
ALTER TABLE "UserKey" DROP CONSTRAINT "UserKey_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserKey" ADD CONSTRAINT "UserKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
