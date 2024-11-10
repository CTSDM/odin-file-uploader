/*
  Warnings:

  - Added the required column `directoryId` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "directoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_directoryId_fkey" FOREIGN KEY ("directoryId") REFERENCES "directories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
