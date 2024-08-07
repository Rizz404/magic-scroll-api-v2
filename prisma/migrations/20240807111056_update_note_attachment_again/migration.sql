/*
  Warnings:

  - Added the required column `url` to the `NoteAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NoteAttachment" ADD COLUMN     "url" TEXT NOT NULL;
