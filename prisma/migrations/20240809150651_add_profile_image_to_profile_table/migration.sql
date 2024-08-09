/*
  Warnings:

  - You are about to drop the column `profileImage` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "profileImage" VARCHAR(1024) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profileImage";
