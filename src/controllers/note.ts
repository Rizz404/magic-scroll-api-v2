import { RequestHandler } from "express";
import {
  FileWithFirebase,
  FilesWithFirebase,
  getErrorMessage,
  getPaginatedResponse,
} from "../utils/express";
import prisma from "../config/dbConfig";
import { Note, Permission, Tag } from "@prisma/client";
import deleteFileFirebase from "../utils/firebase";

export const createNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { studyId, title, content, isPrivate, notePermission, tags } = req.body;
    const image = req.file as FileWithFirebase;
    const files = req.files as FilesWithFirebase;

    const isPrivateBool = typeof isPrivate === "boolean" ? isPrivate : isPrivate === "true";
    const notePermissionParsed =
      typeof notePermission === "string" ? JSON.parse(notePermission) : notePermission;
    const tagsParsed = typeof tags === "string" ? JSON.parse(tags) : tags;

    const randomImages = [
      "https://i.pinimg.com/236x/f6/77/b0/f677b029c3b794a5fada3f884f91522b.jpg",
      "https://i.pinimg.com/236x/c6/20/50/c62050082632c18cf1c838120f268bfb.jpg",
      "https://i.pinimg.com/236x/9f/c2/14/9fc214fa94964af4a6728cf3571cd795.jpg",
      "https://i.pinimg.com/236x/01/dd/0c/01dd0c332d164345145156d464498df1.jpg",
    ];
    const randomIndex = Math.floor(Math.random() * randomImages.length);

    // * Many to many relation itu otomatis nambakan note ke tag juga
    const newNote = await prisma.note.create({
      data: {
        userId: id,
        studyId,
        title,
        content,
        thumbnailImage: image ? image.firebaseUrl : randomImages[randomIndex],
        ...(files &&
          files.length !== 0 && {
            attachments: files.map((file) => file.firebaseUrl),
          }),
        isPrivate: isPrivateBool,
        notePermission: {
          create:
            isPrivateBool && notePermissionParsed && notePermissionParsed.length > 0
              ? notePermissionParsed.map((note: Note) => ({
                  userId: note.userId,
                  permission: "READ",
                }))
              : undefined,
        },
        tags: { connect: tagsParsed ? tagsParsed.map((tag: Tag) => ({ id: tag.id })) : [] },
      },
      include: {
        study: true,
        tags: true,
        notePermission: {
          include: { user: { select: { id: true, username: true, email: true } } },
        },
      },
    });

    res.status(201).json({ message: "Create note successful", data: newNote });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getNotes: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;
    const totalData = await prisma.note.count({
      where: {
        OR: [
          { isPrivate: false },
          {
            ...(userId && {
              isPrivate: true,
              OR: [{ userId }, { notePermission: { some: { userId } } }],
            }),
          },
        ],
      },
    });

    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { isPrivate: false },
          {
            ...(userId && {
              isPrivate: true,
              OR: [{ userId }, { notePermission: { some: { userId } } }],
            }),
          },
        ],
      },
      take: limit,
      skip,
      include: {
        study: { select: { id: true, name: true, image: true } },
        tags: { select: { id: true, name: true } },
        ...(req.user &&
          userId && {
            noteInteraction: {
              where: { userId },
              select: { isUpvoted: true, isDownvoted: true, isFavorited: true, isSaved: true },
            },
          }),
      },
    });
    const response = getPaginatedResponse(notes, page, limit, totalData);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getNoteById: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { noteId } = req.params;
    const note = await prisma.note.findUnique({
      where: {
        id: noteId,
        OR: [
          { isPrivate: false },
          {
            ...(userId && {
              isPrivate: true,
              OR: [{ userId }, { notePermission: { some: { userId } } }],
            }),
          },
        ],
      },
      include: {
        study: true,
        tags: true,
        notePermission: {
          include: { user: { select: { id: true, username: true, email: true } } },
        },
        ...(req.user &&
          userId && {
            noteInteraction: {
              where: { userId },
              select: { isUpvoted: true, isDownvoted: true, isFavorited: true, isSaved: true },
            },
          }),
      },
    });

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

// ! Ternyata patch tidak bisa taruh id di body sebagai patokan update
export const updateNote: RequestHandler = async (req, res) => {
  try {
    const id = req.user?.id;
    const { noteId } = req.params;
    const { studyId, title, content, isPrivate, tags } = req.body;
    const image = req.file as FileWithFirebase;
    const files = req.files as FilesWithFirebase;

    const isPrivateBool = typeof isPrivate === "boolean" ? isPrivate : isPrivate === "true";
    const tagsParsed = typeof tags === "string" ? JSON.parse(tags) : tags;

    const hasReadAndWritePermission = await prisma.notePermission.findFirst({
      where: { noteId, userId: id, permission: "READ_WRITE" },
    });

    if (!hasReadAndWritePermission) {
      return res.status(403).json({ message: "You don't have permission to update this note" });
    }

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        studyId,
        title,
        content,
        ...(image && { thumbnailImage: image.firebaseUrl }),
        ...(files && files.length !== 0 && { attachments: files.map((file) => file.firebaseUrl) }),
        isPrivate: isPrivateBool,
        tags: { connect: tagsParsed.map((tag: Tag) => ({ id: tag.id })) },
      },
    });

    if (updatedNote.isPrivate === false) {
      await prisma.notePermission.deleteMany({ where: { noteId: updatedNote.id } });
    }

    res.json({ message: "Update note successful", data: updatedNote });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const deleteImageOrAttachments: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;
    const { deleteThumbnailImage, deleteAttachments } = req.body;

    const randomImages = [
      "https://i.pinimg.com/236x/f6/77/b0/f677b029c3b794a5fada3f884f91522b.jpg",
      "https://i.pinimg.com/236x/c6/20/50/c62050082632c18cf1c838120f268bfb.jpg",
      "https://i.pinimg.com/236x/9f/c2/14/9fc214fa94964af4a6728cf3571cd795.jpg",
      "https://i.pinimg.com/236x/01/dd/0c/01dd0c332d164345145156d464498df1.jpg",
    ];
    const randomIndex = Math.floor(Math.random() * randomImages.length);

    const hasReadAndWritePermission = await prisma.notePermission.findFirst({
      where: { noteId, userId: id, permission: "READ_WRITE" },
    });

    if (!hasReadAndWritePermission) {
      return res.status(403).json({ message: "You don't have permission to delete this file" });
    }

    const noteWithExistingFiles = await prisma.note.findUnique({
      where: { id: noteId },
      select: { thumbnailImage: true, attachments: true },
    });

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        ...(deleteThumbnailImage && { thumbnailImage: randomImages[randomIndex] }),
        ...(deleteAttachments &&
          deleteAttachments > 0 && {
            attachments: noteWithExistingFiles?.attachments?.map((attachment) =>
              deleteAttachments.includes(attachment) ? null : attachment
            ),
          }),
      },
    });

    if (noteWithExistingFiles) {
      if (deleteThumbnailImage && noteWithExistingFiles.thumbnailImage) {
        await deleteFileFirebase("thumbnailImage", noteWithExistingFiles.thumbnailImage);
      }

      if (deleteAttachments.length > 0) {
        const deletionPromises = deleteAttachments
          .filter((attachment: string) => noteWithExistingFiles.attachments?.includes(attachment))
          .map((attachment: string) => deleteFileFirebase("attachments", attachment));

        await Promise.all(deletionPromises);
      }
    }

    res.json({ message: "Update note successful", data: updatedNote });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const upvoteNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;

    const existingVoteInteraction = await prisma.noteInteraction.findUnique({
      where: { userId_noteId: { userId: id, noteId } },
    });

    const existingUpvote = existingVoteInteraction?.isUpvoted === true;

    let upvoteStatus;

    if (!existingVoteInteraction) {
      upvoteStatus = await prisma.$transaction(async (tx) => {
        const newInteraction = await tx.noteInteraction.create({
          data: { userId: id, noteId, isUpvoted: true },
        });

        await tx.note.update({ where: { id: noteId }, data: { upvotedCount: { increment: 1 } } });

        return newInteraction;
      });

      return res.json({ message: "Note upvote successful", data: upvoteStatus });
    }

    if (!existingUpvote) {
      upvoteStatus = await prisma.$transaction(async (tx) => {
        const updatedInteraction = await tx.noteInteraction.update({
          where: { userId_noteId: { userId: id, noteId } },
          data: { isUpvoted: true, isDownvoted: false },
        });

        await tx.note.update({
          where: { id: noteId },
          data: {
            upvotedCount: { increment: 1 },
            downvotedCount: { decrement: existingVoteInteraction.isDownvoted ? 1 : 0 },
          },
        });

        return updatedInteraction;
      });
    } else {
      upvoteStatus = await prisma.$transaction(async (tx) => {
        const updatedInteraction = await tx.noteInteraction.update({
          where: { userId_noteId: { userId: id, noteId } },
          data: { isUpvoted: false },
        });

        await tx.note.update({ where: { id: noteId }, data: { upvotedCount: { decrement: 1 } } });

        return updatedInteraction;
      });
    }

    res.json({
      message: !existingUpvote ? "Note upvote successful" : "Note remove upvote successful",
      data: upvoteStatus,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const downvoteNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;

    const existingVoteInteraction = await prisma.noteInteraction.findUnique({
      where: { userId_noteId: { userId: id, noteId } },
    });

    const existingDownvote = existingVoteInteraction?.isDownvoted === true;

    let downvoteStatus;

    if (!existingVoteInteraction) {
      downvoteStatus = await prisma.$transaction(async (tx) => {
        const newInteraction = await tx.noteInteraction.create({
          data: { userId: id, noteId, isDownvoted: true },
        });

        await tx.note.update({
          where: { id: noteId },
          data: { downvotedCount: { increment: 1 } },
        });

        return newInteraction;
      });

      return res.json({ message: "Note downvote successful", data: downvoteStatus });
    }

    if (!existingDownvote) {
      downvoteStatus = await prisma.$transaction(async (tx) => {
        const updatedInteraction = await tx.noteInteraction.update({
          where: { userId_noteId: { userId: id, noteId } },
          data: { isDownvoted: true, isUpvoted: false },
        });

        await tx.note.update({
          where: { id: noteId },
          data: {
            downvotedCount: { increment: 1 },
            upvotedCount: { decrement: existingVoteInteraction.isUpvoted ? 1 : 0 },
          },
        });

        return updatedInteraction;
      });
    } else {
      downvoteStatus = await prisma.$transaction(async (tx) => {
        const updatedInteraction = await tx.noteInteraction.update({
          where: { userId_noteId: { userId: id, noteId } },
          data: { isDownvoted: false },
        });

        await tx.note.update({ where: { id: noteId }, data: { downvotedCount: { decrement: 1 } } });

        return updatedInteraction;
      });
    }

    res.json({
      message: !existingDownvote ? "Note downvote successful" : "Note remove downvote successful",
      data: downvoteStatus,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const makeNoteFavorite: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;

    const existingNoteInteraction = await prisma.noteInteraction.findUnique({
      where: { userId_noteId: { userId: id, noteId } },
    });

    const isNoteFavorite = existingNoteInteraction?.isFavorited === true;

    let favoriteStatus;

    if (!existingNoteInteraction) {
      favoriteStatus = await prisma.$transaction(async (tx) => {
        const newInteraction = await tx.noteInteraction.create({
          data: { userId: id, noteId, isFavorited: true },
        });

        await tx.note.update({ where: { id: noteId }, data: { favoritedCount: { increment: 1 } } });

        return newInteraction;
      });

      return res.json({ message: "Note favorite successful", data: favoriteStatus });
    }

    if (!isNoteFavorite) {
      favoriteStatus = await prisma.$transaction(async (tx) => {
        const updatedInteraction = await tx.noteInteraction.update({
          where: { userId_noteId: { userId: id, noteId } },
          data: { isFavorited: true },
        });

        await tx.note.update({ where: { id: noteId }, data: { favoritedCount: { increment: 1 } } });

        return updatedInteraction;
      });
    } else {
      favoriteStatus = await prisma.$transaction(async (tx) => {
        const updatedInteraction = await tx.noteInteraction.update({
          where: { userId_noteId: { userId: id, noteId } },
          data: { isFavorited: false },
        });

        await tx.note.update({ where: { id: noteId }, data: { favoritedCount: { decrement: 1 } } });

        return updatedInteraction;
      });
    }

    res.json({
      message: !isNoteFavorite ? "Note favorite successful" : "Note remove favorite successful",
      data: favoriteStatus,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const saveNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;

    const existingNoteInteraction = await prisma.noteInteraction.findUnique({
      where: { userId_noteId: { userId: id, noteId } },
    });

    const isNoteSaved = existingNoteInteraction?.isSaved === true;

    let saveStatus;

    if (!existingNoteInteraction) {
      saveStatus = await prisma.$transaction(async (tx) => {
        const newInteraction = await tx.noteInteraction.create({
          data: { userId: id, noteId, isSaved: true },
        });

        await tx.note.update({ where: { id: noteId }, data: { savedCount: { increment: 1 } } });

        return newInteraction;
      });

      return res.json({ message: "Note save successful", data: saveStatus });
    }

    if (!isNoteSaved) {
      saveStatus = await prisma.$transaction(async (tx) => {
        const updatedInteraction = await tx.noteInteraction.update({
          where: { userId_noteId: { userId: id, noteId } },
          data: { isSaved: true },
        });

        await tx.note.update({ where: { id: noteId }, data: { savedCount: { increment: 1 } } });

        return updatedInteraction;
      });
    } else {
      saveStatus = await prisma.$transaction(async (tx) => {
        const updatedInteraction = await tx.noteInteraction.update({
          where: { userId_noteId: { userId: id, noteId } },
          data: { isSaved: false },
        });

        await tx.note.update({ where: { id: noteId }, data: { savedCount: { decrement: 1 } } });

        return updatedInteraction;
      });
    }

    res.json({
      message: !isNoteSaved ? "Note save successful" : "Note remove save successful",
      data: saveStatus,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
