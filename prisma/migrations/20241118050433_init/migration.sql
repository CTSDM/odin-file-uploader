/*
  Warnings:

  - A unique constraint covering the columns `[name,extension,directoryId]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "files_name_extension_directoryId_key" ON "files"("name", "extension", "directoryId");
