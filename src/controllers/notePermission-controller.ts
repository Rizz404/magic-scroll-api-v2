import { RequestHandler } from "express";
import prisma from "../config/dbConfig";
import { Permission } from "@prisma/client";
import { getErrorMessage, getPaginatedResponse } from "../utils/express";

interface NotePermissionReqQuery {
  page: string;
  limit: string;
}

export const getNotePermissionsFromNote: RequestHandler = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { page = 1, limit = 10 } =
      req.query as unknown as NotePermissionReqQuery;

    const skip = (+page - 1) * +limit;
    const totalData = await prisma.notePermission.count({ where: { noteId } });

    const notePermissions = await prisma.notePermission.findMany({
      where: { noteId },
      take: +limit,
      skip,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { profileImage: true } },
          },
        },
      },
    });

    const response = getPaginatedResponse(
      notePermissions,
      +page,
      +limit,
      totalData
    );

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const upsertNotePermission: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;
    const {
      userId,
      permission = Permission.READ,
    }: { noteId: string; userId: string; permission?: Permission } = req.body;

    const hasPermission = await prisma.notePermission.findUnique({
      where: {
        userId_noteId: { noteId, userId: id },
        permission: "READ_WRITE",
      },
    });

    if (!hasPermission) {
      return res
        .status(400)
        .json({ message: "You don't have permission to upsert permission" });
    }

    const newNotePermission = await prisma.notePermission.upsert({
      where: { userId_noteId: { userId, noteId } },
      create: { noteId, userId, permission },
      update: { noteId, userId, permission },
    });

    res.status(201).json({
      message: "Add user permission successful",
      data: newNotePermission,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const deleteNotePermission: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;
    const { userId } = req.body;

    const hasPermission = await prisma.note.findUnique({
      where: { id: noteId, userId: id },
      select: { id: true, userId: true },
    });

    if (!hasPermission) {
      return res
        .status(400)
        .json({ message: "You don't have permission to delete this note" });
    }

    const deletedNotePermission = await prisma.notePermission.delete({
      where: { userId_noteId: { userId, noteId } },
    });

    res.json({
      message: "Note permission deleted successfully",
      data: deletedNotePermission,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
