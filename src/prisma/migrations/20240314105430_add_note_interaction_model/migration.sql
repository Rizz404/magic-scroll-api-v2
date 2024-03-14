/*
  Warnings:

  - The primary key for the `Follow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the `Downvote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Upvote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Downvote" DROP CONSTRAINT "Downvote_noteId_fkey";

-- DropForeignKey
ALTER TABLE "Downvote" DROP CONSTRAINT "Downvote_userId_fkey";

-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_noteId_fkey";

-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_userId_fkey";

-- AlterTable
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
ADD CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId", "followingId");

-- DropTable
DROP TABLE "Downvote";

-- DropTable
DROP TABLE "Upvote";

-- CreateTable
CREATE TABLE "NoteInteraction" (
    "userId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "isUpvoted" BOOLEAN NOT NULL DEFAULT false,
    "isDownvoted" BOOLEAN NOT NULL DEFAULT false,
    "isFavorited" BOOLEAN NOT NULL DEFAULT false,
    "isSaved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NoteInteraction_pkey" PRIMARY KEY ("userId","noteId")
);

-- CreateIndex
CREATE INDEX "NoteInteraction_userId_noteId_idx" ON "NoteInteraction"("userId", "noteId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteInteraction_userId_noteId_key" ON "NoteInteraction"("userId", "noteId");

-- CreateIndex
CREATE INDEX "Follow_followerId_followingId_idx" ON "Follow"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "NoteInteraction" ADD CONSTRAINT "NoteInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteInteraction" ADD CONSTRAINT "NoteInteraction_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
