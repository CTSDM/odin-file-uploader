/*
  Warnings:

  - Added the required column `extension` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "extension" VARCHAR(255) NOT NULL;
