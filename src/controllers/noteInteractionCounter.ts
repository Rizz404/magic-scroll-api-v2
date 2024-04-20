import { RequestHandler } from "express";
import { getErrorMessage } from "../utils/express";
import prisma from "../config/dbConfig";

export const getNoteInteractionCounter: RequestHandler = async (req, res) => {
  try {
    const { noteId } = req.params;
    const noteInteractionCounter = await prisma.noteInteractionCounter.findUnique({
      where: { noteId },
    });

    res.json(noteInteractionCounter);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
