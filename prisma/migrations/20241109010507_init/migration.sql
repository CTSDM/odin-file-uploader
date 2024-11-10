/*
  Warnings:

  - You are about to drop the `folders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_userId_fkey";

-- DropTable
DROP TABLE "folders";

-- CreateTable
CREATE TABLE "directories" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "parentId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "directories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "directories_parentId_key" ON "directories"("parentId");

-- AddForeignKey
ALTER TABLE "directories" ADD CONSTRAINT "directories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "directories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directories" ADD CONSTRAINT "directories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
