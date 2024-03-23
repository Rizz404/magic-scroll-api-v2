import { RequestHandler } from "express";
import {
  FileWithFirebase,
  FilesWithFirebase,
  getErrorMessage,
  getPaginatedResponse,
} from "../utils/express";
import prisma from "../config/dbConfig";
import { Note, Permission, Tag } from "@prisma/client";

export const createNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user;
    const { studyId, title, content, isPrivate, notePermission, tags } = req.body;
    const image = req.file as FileWithFirebase;
    const files = req.files as FilesWithFirebase;

    // * Many to many relation itu otomatis nambakan note ke tag juga
    const newNote = await prisma.note.create({
      data: {
        userId: id,
        studyId,
        title,
        content,
        ...(image && { thumbnailImage: image.firebaseUrl }),
        ...(files &&
          files.length !== 0 && {
            attachments: files.map((file) => file.firebaseUrl),
          }),
        isPrivate,
        notePermission: {
          create:
            isPrivate && notePermission && notePermission.length > 0
              ? notePermission.map((note: Note) => ({ userId: note.userId, permission: "READ" }))
              : undefined,
        },
        tags: { connect: tags.map((tag: Tag) => ({ id: tag.id })) },
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
    const { id } = req.user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;
    const totalData = await prisma.note.count();

    const notes = await prisma.note.findMany({
      take: limit,
      skip,
      include: {
        study: { select: { id: true, name: true, image: true } },
        tags: { select: { id: true, name: true } },
        ...(req.user &&
          id && {
            noteInteraction: {
              where: { userId: id },
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
    const { id } = req.user;
    const { noteId } = req.params;
    const note = await prisma.note.findUnique({
      where: {
        id: noteId,
        ...(req.user && id
          ? {
              OR: [
                { isPrivate: false },
                { isPrivate: true, notePermission: { some: { userId: id } } },
              ],
            }
          : { isPrivate: false }),
      },
      include: {
        study: true,
        tags: true,
        notePermission: {
          include: { user: { select: { id: true, username: true, email: true } } },
        },
        ...(req.user &&
          id && {
            noteInteraction: {
              where: { userId: id },
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
    const { id } = req.user;
    const { noteId } = req.params;
    const { studyId, title, content, isPrivate }: Note = req.body;
    const image = req.file as FileWithFirebase;
    const files = req.files as FilesWithFirebase;

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
        isPrivate,
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

export const upvoteNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user;
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
    const { id } = req.user;
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
    const { id } = req.user;
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
    const { id } = req.user;
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

// * NotePermission
export const getNotePermissionsFromNote: RequestHandler = async (req, res) => {
  try {
    const { noteId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;
    const totalData = await prisma.notePermission.count();

    const notePermissions = await prisma.notePermission.findMany({
      where: { noteId },
      take: limit,
      skip,
      include: { user: { select: { id: true, username: true, email: true } } },
    });

    const response = getPaginatedResponse(notePermissions, page, limit, totalData);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const addNotePermission: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user;
    const { noteId } = req.params;
    const {
      userId,
      permission = Permission.READ,
    }: { noteId: string; userId: string; permission?: Permission } = req.body;

    const isNoteCreator = await prisma.note.findUnique({ where: { id: noteId, userId: id } });

    if (!isNoteCreator) {
      return res.status(400).json({ message: "Only note creator can add note permission" });
    }

    const isAlreadyContributor = await prisma.notePermission.findUnique({
      where: { noteId, userId },
    });

    if (isAlreadyContributor) {
      return res.status(400).json({ message: "User is already contributor" });
    }

    const newNotePermission = await prisma.notePermission.create({
      data: { noteId, userId, permission },
    });

    res.status(201).json({ message: "Add user permission successful", data: newNotePermission });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const changeNotePermission: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user;
    const { noteId } = req.params;
    const { userId, permission }: { noteId: string; userId: string; permission: Permission } =
      req.body;

    const isFounderOrHasReadAndWriteAccess = await prisma.note.findUnique({
      where: { id: noteId, userId: id, notePermission: { some: { userId: id } } },
    });

    if (!isFounderOrHasReadAndWriteAccess) {
      return res.status(400).json({
        message:
          "Only note creator and user who has read and write access can update note permission",
      });
    }

    const updatedNotePermission = await prisma.notePermission.update({
      where: { noteId, userId },
      data: { permission },
    });

    res
      .status(200)
      .json({ message: "Change user permission successful", data: updatedNotePermission });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
