/*
  Warnings:

  - Made the column `thumbnailImage` on table `Note` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `Study` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "thumbnailImage" SET NOT NULL;

-- AlterTable
ALTER TABLE "Study" ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "image" SET DEFAULT 'https://i.pinimg.com/236x/a2/6a/27/a26a27a5ff6a2cb80d5b872a73d1413b.jpg';
