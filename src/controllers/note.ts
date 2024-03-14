import { RequestHandler } from "express";
import { getErrorMessage, getPaginatedResponse } from "../utils/express";
import prisma from "../config/dbConfig";
import { ExtendedNote } from "../types/Prisma";
import { Note, NotePermission, Permission } from "@prisma/client";

export const createNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      studyId,
      title,
      content,
      thumbnailImage,
      attachments,
      isPrivate,
      notePermission,
      tags,
    }: ExtendedNote = req.body;

    // * Many to many relation itu otomatis nambakan note ke tag juga
    const newNote = await prisma.note.create({
      data: {
        userId: id,
        studyId,
        title,
        content,
        thumbnailImage,
        attachments,
        isPrivate,
        notePermission: {
          create:
            isPrivate && notePermission && notePermission.length > 0
              ? notePermission.map((note) => ({ userId: note.userId, permission: "READ" }))
              : undefined,
        },
        tags: { connect: tags.map((tag) => ({ id: tag.id })) },
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
      },
    });

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

// * Mulai sekarang patch dan post pakai req.body aja jangan pake params juga
export const updateNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user;
    const { noteId, studyId, title, content, thumbnailImage, attachments, isPrivate } = req.body;

    const hasReadAndWritePermission = await prisma.notePermission.findFirst({
      where: { noteId, userId: id, permission: "READ_WRITE" },
    });

    if (!hasReadAndWritePermission) {
      return res.status(403).json({ message: "You don't have permission to update this note" });
    }

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: { studyId, title, content, thumbnailImage, attachments, isPrivate },
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
      upvoteStatus = await prisma.noteInteraction.create({
        data: { userId: id, noteId, isUpvoted: true },
      });

      return res.json({ message: "Note upvote successful", data: upvoteStatus });
    }

    if (!existingUpvote) {
      upvoteStatus = await prisma.noteInteraction.update({
        where: { userId_noteId: { userId: id, noteId } },
        data: { isUpvoted: true, isDownvoted: false },
      });
    } else {
      upvoteStatus = await prisma.noteInteraction.update({
        where: { userId_noteId: { userId: id, noteId } },
        data: { isUpvoted: false },
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
      downvoteStatus = await prisma.noteInteraction.create({
        data: { userId: id, noteId, isDownvoted: true },
      });

      return res.json({ message: "Note downvote successful", data: downvoteStatus });
    }

    if (!existingDownvote) {
      downvoteStatus = await prisma.noteInteraction.update({
        where: { userId_noteId: { userId: id, noteId } },
        data: { isDownvoted: true, isUpvoted: false },
      });
    } else {
      downvoteStatus = await prisma.noteInteraction.update({
        where: { userId_noteId: { userId: id, noteId } },
        data: { isDownvoted: false },
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
      favoriteStatus = await prisma.noteInteraction.create({
        data: { userId: id, noteId, isFavorited: true },
      });

      return res.json({ message: "Note favorite successful", data: favoriteStatus });
    }

    if (!isNoteFavorite) {
      favoriteStatus = await prisma.noteInteraction.update({
        where: { userId_noteId: { userId: id, noteId } },
        data: { isFavorited: true },
      });
    } else {
      favoriteStatus = await prisma.noteInteraction.update({
        where: { userId_noteId: { userId: id, noteId } },
        data: { isFavorited: false },
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
      saveStatus = await prisma.noteInteraction.create({
        data: { userId: id, noteId, isSaved: true },
      });

      return res.json({ message: "Note save successful", data: saveStatus });
    }

    if (!isNoteSaved) {
      saveStatus = await prisma.noteInteraction.update({
        where: { userId_noteId: { userId: id, noteId } },
        data: { isSaved: true },
      });
    } else {
      saveStatus = await prisma.noteInteraction.update({
        where: { userId_noteId: { userId: id, noteId } },
        data: { isSaved: false },
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
    const {
      noteId,
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
    const {
      noteId,
      userId,
      permission,
    }: { noteId: string; userId: string; permission: Permission } = req.body;

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
