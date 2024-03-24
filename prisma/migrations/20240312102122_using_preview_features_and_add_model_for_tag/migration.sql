/*
  Warnings:

  - You are about to drop the column `keywords` on the `Notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notes" DROP COLUMN "keywords";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NotesToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_NotesToTag_AB_unique" ON "_NotesToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_NotesToTag_B_index" ON "_NotesToTag"("B");

-- AddForeignKey
ALTER TABLE "_NotesToTag" ADD CONSTRAINT "_NotesToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotesToTag" ADD CONSTRAINT "_NotesToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
