/*
  Warnings:

  - A unique constraint covering the columns `[followerId,followingId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Follow_followerId_key";

-- DropIndex
DROP INDEX "Follow_followingId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");
