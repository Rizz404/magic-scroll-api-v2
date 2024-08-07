/*
  Warnings:

  - You are about to drop the column `file` on the `NoteAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `NoteAttachment` table. All the data in the column will be lost.
  - Added the required column `destination` to the `NoteAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fieldname` to the `NoteAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `NoteAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `NoteAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalname` to the `NoteAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `NoteAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NoteAttachment" DROP COLUMN "file",
DROP COLUMN "mimeType",
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "fieldname" TEXT NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL,
ADD COLUMN     "originalname" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
