import { RequestHandler } from "express";
import { getErrorMessage } from "../utils/express";
import prisma from "../config/dbConfig";

export const getUserNoteInteractionByNoteId: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;
    const noteInteraction = await prisma.noteInteraction.findUnique({
      where: { userId_noteId: { userId: id, noteId } },
    });

    res.json(noteInteraction);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
