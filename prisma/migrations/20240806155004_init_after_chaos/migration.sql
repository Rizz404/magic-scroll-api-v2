-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ', 'READ_WRITE');

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(30) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password" VARCHAR(255),
    "role" "Roles" NOT NULL DEFAULT 'USER',
    "isOauth" BOOLEAN NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileImage" VARCHAR(1024) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" VARCHAR(30) NOT NULL,
    "userId" VARCHAR(30) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL DEFAULT '',
    "lastName" VARCHAR(255) NOT NULL DEFAULT '',
    "age" SMALLINT,
    "phone" VARCHAR(15) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "followerId" VARCHAR(30) NOT NULL,
    "followingId" VARCHAR(30) NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" VARCHAR(30) NOT NULL,
    "userId" VARCHAR(30) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isFavorited" BOOLEAN NOT NULL DEFAULT false,
    "upvotedCount" INTEGER NOT NULL DEFAULT 0,
    "downvotedCount" INTEGER NOT NULL DEFAULT 0,
    "savedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpvotedNote" (
    "userId" VARCHAR(30) NOT NULL,
    "noteId" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpvotedNote_pkey" PRIMARY KEY ("userId","noteId")
);

-- CreateTable
CREATE TABLE "DownvoteNote" (
    "userId" VARCHAR(30) NOT NULL,
    "noteId" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownvoteNote_pkey" PRIMARY KEY ("userId","noteId")
);

-- CreateTable
CREATE TABLE "SavedNote" (
    "userId" VARCHAR(30) NOT NULL,
    "noteId" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedNote_pkey" PRIMARY KEY ("userId","noteId")
);

-- CreateTable
CREATE TABLE "NotePermission" (
    "userId" VARCHAR(30) NOT NULL,
    "noteId" VARCHAR(30) NOT NULL,
    "permission" "Permission" NOT NULL DEFAULT 'READ',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotePermission_pkey" PRIMARY KEY ("userId","noteId")
);

-- CreateTable
CREATE TABLE "NoteAttachment" (
    "id" VARCHAR(30) NOT NULL,
    "noteId" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NoteToTag" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_email_idx" ON "User"("username", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_userId_idx" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_key" ON "Follow"("followerId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followingId_key" ON "Follow"("followingId");

-- CreateIndex
CREATE INDEX "Follow_followerId_followingId_idx" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "Note_userId_title_idx" ON "Note"("userId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "UpvotedNote_userId_key" ON "UpvotedNote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UpvotedNote_noteId_key" ON "UpvotedNote"("noteId");

-- CreateIndex
CREATE INDEX "UpvotedNote_userId_noteId_idx" ON "UpvotedNote"("userId", "noteId");

-- CreateIndex
CREATE UNIQUE INDEX "DownvoteNote_userId_key" ON "DownvoteNote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DownvoteNote_noteId_key" ON "DownvoteNote"("noteId");

-- CreateIndex
CREATE INDEX "DownvoteNote_userId_noteId_idx" ON "DownvoteNote"("userId", "noteId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedNote_userId_key" ON "SavedNote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedNote_noteId_key" ON "SavedNote"("noteId");

-- CreateIndex
CREATE INDEX "SavedNote_userId_noteId_idx" ON "SavedNote"("userId", "noteId");

-- CreateIndex
CREATE UNIQUE INDEX "NotePermission_userId_key" ON "NotePermission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotePermission_noteId_key" ON "NotePermission"("noteId");

-- CreateIndex
CREATE INDEX "NotePermission_userId_noteId_idx" ON "NotePermission"("userId", "noteId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_NoteToTag_AB_unique" ON "_NoteToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_NoteToTag_B_index" ON "_NoteToTag"("B");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpvotedNote" ADD CONSTRAINT "UpvotedNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpvotedNote" ADD CONSTRAINT "UpvotedNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownvoteNote" ADD CONSTRAINT "DownvoteNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownvoteNote" ADD CONSTRAINT "DownvoteNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedNote" ADD CONSTRAINT "SavedNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedNote" ADD CONSTRAINT "SavedNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotePermission" ADD CONSTRAINT "NotePermission_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotePermission" ADD CONSTRAINT "NotePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteAttachment" ADD CONSTRAINT "NoteAttachment_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToTag" ADD CONSTRAINT "_NoteToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToTag" ADD CONSTRAINT "_NoteToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
