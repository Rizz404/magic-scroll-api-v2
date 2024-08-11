/*
  Warnings:

  - A unique constraint covering the columns `[userId,noteId]` on the table `DownvoteNote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,noteId]` on the table `NotePermission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,noteId]` on the table `SavedNote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,noteId]` on the table `UpvotedNote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DownvoteNote_noteId_key";

-- DropIndex
DROP INDEX "DownvoteNote_userId_key";

-- DropIndex
DROP INDEX "NotePermission_noteId_key";

-- DropIndex
DROP INDEX "NotePermission_userId_key";

-- DropIndex
DROP INDEX "SavedNote_noteId_key";

-- DropIndex
DROP INDEX "SavedNote_userId_key";

-- DropIndex
DROP INDEX "UpvotedNote_noteId_key";

-- DropIndex
DROP INDEX "UpvotedNote_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "DownvoteNote_userId_noteId_key" ON "DownvoteNote"("userId", "noteId");

-- CreateIndex
CREATE UNIQUE INDEX "NotePermission_userId_noteId_key" ON "NotePermission"("userId", "noteId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedNote_userId_noteId_key" ON "SavedNote"("userId", "noteId");

-- CreateIndex
CREATE UNIQUE INDEX "UpvotedNote_userId_noteId_key" ON "UpvotedNote"("userId", "noteId");
