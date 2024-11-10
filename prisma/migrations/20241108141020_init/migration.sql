/*
  Warnings:

  - You are about to drop the column `folderId` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `folders` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `folders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[predecessorId]` on the table `folders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_folderId_fkey";

-- AlterTable
ALTER TABLE "files" DROP COLUMN "folderId";

-- AlterTable
ALTER TABLE "folders" DROP COLUMN "content",
DROP COLUMN "createdAt",
ADD COLUMN     "predecessorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "folders_predecessorId_key" ON "folders"("predecessorId");
