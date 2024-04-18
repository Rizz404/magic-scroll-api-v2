/*
  Warnings:

  - The primary key for the `Follow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `followerId` on the `Follow` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `followingId` on the `Follow` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `Note` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `downvotedCount` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `favoritedCount` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `savedCount` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `upvotedCount` on the `Note` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Note` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `userId` on the `Note` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `studyId` on the `Note` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `title` on the `Note` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `thumbnailImage` on the `Note` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1024)`.
  - The primary key for the `NoteInteraction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `userId` on the `NoteInteraction` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `noteId` on the `NoteInteraction` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `NotePermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `NotePermission` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `noteId` on the `NotePermission` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `userId` on the `NotePermission` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `userId` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `firstName` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `lastName` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `profileImage` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1024)`.
  - You are about to alter the column `age` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `phone` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - The primary key for the `Study` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Study` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `name` on the `Study` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Tag` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `name` on the `Tag` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `username` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(320)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `A` on the `_NoteToTag` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `B` on the `_NoteToTag` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - A unique constraint covering the columns `[followerId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[followingId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `NoteInteraction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[noteId]` on the table `NoteInteraction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_studyId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropForeignKey
ALTER TABLE "NoteInteraction" DROP CONSTRAINT "NoteInteraction_noteId_fkey";

-- DropForeignKey
ALTER TABLE "NoteInteraction" DROP CONSTRAINT "NoteInteraction_userId_fkey";

-- DropForeignKey
ALTER TABLE "NotePermission" DROP CONSTRAINT "NotePermission_noteId_fkey";

-- DropForeignKey
ALTER TABLE "NotePermission" DROP CONSTRAINT "NotePermission_userId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "_NoteToTag" DROP CONSTRAINT "_NoteToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_NoteToTag" DROP CONSTRAINT "_NoteToTag_B_fkey";

-- DropIndex
DROP INDEX "Follow_followerId_followingId_key";

-- DropIndex
DROP INDEX "NoteInteraction_userId_noteId_key";

-- DropIndex
DROP INDEX "User_username_email_key";

-- AlterTable
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_pkey",
ALTER COLUMN "followerId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "followingId" SET DATA TYPE VARCHAR(30),
ADD CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId", "followingId");

-- AlterTable
ALTER TABLE "Note" DROP CONSTRAINT "Note_pkey",
DROP COLUMN "downvotedCount",
DROP COLUMN "favoritedCount",
DROP COLUMN "savedCount",
DROP COLUMN "upvotedCount",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "studyId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "thumbnailImage" SET DATA TYPE VARCHAR(1024),
ADD CONSTRAINT "Note_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "NoteInteraction" DROP CONSTRAINT "NoteInteraction_pkey",
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "noteId" SET DATA TYPE VARCHAR(30),
ADD CONSTRAINT "NoteInteraction_pkey" PRIMARY KEY ("userId", "noteId");

-- AlterTable
ALTER TABLE "NotePermission" DROP CONSTRAINT "NotePermission_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "noteId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(30),
ADD CONSTRAINT "NotePermission_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "profileImage" SET DATA TYPE VARCHAR(1024),
ALTER COLUMN "age" SET DATA TYPE SMALLINT,
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(15),
ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Study" DROP CONSTRAINT "Study_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "Study_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "Tag_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "username" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(320),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_NoteToTag" ALTER COLUMN "A" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(30);

-- CreateTable
CREATE TABLE "NoteInteractionCounter" (
    "noteId" VARCHAR(30) NOT NULL,
    "upvotedCount" INTEGER NOT NULL DEFAULT 0,
    "downvotedCount" INTEGER NOT NULL DEFAULT 0,
    "favoritedCount" INTEGER NOT NULL DEFAULT 0,
    "savedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NoteInteractionCounter_pkey" PRIMARY KEY ("noteId")
);

-- CreateIndex
CREATE UNIQUE INDEX "NoteInteractionCounter_noteId_key" ON "NoteInteractionCounter"("noteId");

-- CreateIndex
CREATE INDEX "NoteInteractionCounter_noteId_idx" ON "NoteInteractionCounter"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_key" ON "Follow"("followerId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followingId_key" ON "Follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteInteraction_userId_key" ON "NoteInteraction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteInteraction_noteId_key" ON "NoteInteraction"("noteId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteInteraction" ADD CONSTRAINT "NoteInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteInteraction" ADD CONSTRAINT "NoteInteraction_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotePermission" ADD CONSTRAINT "NotePermission_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotePermission" ADD CONSTRAINT "NotePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToTag" ADD CONSTRAINT "_NoteToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToTag" ADD CONSTRAINT "_NoteToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
