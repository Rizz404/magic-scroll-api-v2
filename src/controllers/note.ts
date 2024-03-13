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

export const addUserPermission: RequestHandler = async (req, res) => {
  try {
    const {
      noteId,
      userId,
      permission = Permission.READ,
    }: { noteId: string; userId: string; permission?: Permission } = req.body;

    const isAlreadyContributor = await prisma.notePermission.findUnique({
      where: { noteId, userId },
    });

    if (isAlreadyContributor) {
      return res.status(400).json({ message: "You are already contributor" });
    }

    const newNotePermission = await prisma.notePermission.create({
      data: { noteId, userId, permission },
    });

    res.status(201).json({ message: "Add user permission successful", data: newNotePermission });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const changeUserPermission: RequestHandler = async (req, res) => {
  try {
    const {
      noteId,
      userId,
      permission,
    }: { noteId: string; userId: string; permission: Permission } = req.body;

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
