/*
  Warnings:

  - The values [CONTRIBUTOR] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('READ', 'READ_WRITE');
ALTER TABLE "NotePermission" ALTER COLUMN "permission" DROP DEFAULT;
ALTER TABLE "NotePermission" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "Permission_old";
ALTER TABLE "NotePermission" ALTER COLUMN "permission" SET DEFAULT 'READ';
COMMIT;
