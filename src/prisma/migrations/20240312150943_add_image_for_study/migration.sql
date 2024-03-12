/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Study` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Study" ADD COLUMN     "image" TEXT;

-- CreateIndex
CREATE INDEX "Study_name_idx" ON "Study"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Study_name_key" ON "Study"("name");
