/*
  Warnings:

  - You are about to drop the column `isFavorited` on the `Note` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "isFavorited";

-- CreateTable
CREATE TABLE "FavoriteNote" (
    "userId" VARCHAR(30) NOT NULL,
    "noteId" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteNote_pkey" PRIMARY KEY ("userId","noteId")
);

-- CreateIndex
CREATE INDEX "FavoriteNote_userId_noteId_idx" ON "FavoriteNote"("userId", "noteId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteNote_userId_noteId_key" ON "FavoriteNote"("userId", "noteId");

-- AddForeignKey
ALTER TABLE "FavoriteNote" ADD CONSTRAINT "FavoriteNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteNote" ADD CONSTRAINT "FavoriteNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
