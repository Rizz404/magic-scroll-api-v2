import { RequestHandler } from "express";
import prisma from "../config/dbConfig";
import { Permission } from "@prisma/client";
import { getErrorMessage, getPaginatedResponse } from "../utils/express";

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
    const { id } = req.user!;
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
    const { id } = req.user!;
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
