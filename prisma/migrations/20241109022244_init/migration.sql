/*
  Warnings:

  - Made the column `userId` on table `files` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_userId_fkey";

-- AlterTable
ALTER TABLE "files" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
