/*
  Warnings:

  - You are about to drop the column `isEdited` on the `Note` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[editorId]` on the table `Note` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "isEdited",
ADD COLUMN     "editorId" VARCHAR(30);

-- CreateIndex
CREATE UNIQUE INDEX "Note_editorId_key" ON "Note"("editorId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
