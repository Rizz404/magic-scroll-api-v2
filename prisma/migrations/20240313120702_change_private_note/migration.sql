/*
  Warnings:

  - You are about to drop the `PrivateNote` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ', 'CONTRIBUTOR');

-- DropForeignKey
ALTER TABLE "PrivateNote" DROP CONSTRAINT "PrivateNote_noteId_fkey";

-- DropTable
DROP TABLE "PrivateNote";

-- CreateTable
CREATE TABLE "NotePermission" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "Permission" NOT NULL DEFAULT 'READ',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotePermission_noteId_idx" ON "NotePermission"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "NotePermission_noteId_key" ON "NotePermission"("noteId");

-- AddForeignKey
ALTER TABLE "NotePermission" ADD CONSTRAINT "NotePermission_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotePermission" ADD CONSTRAINT "NotePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
