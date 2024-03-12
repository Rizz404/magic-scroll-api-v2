import { RequestHandler } from "express";
import { getErrorMessage } from "../utils/express";
import prisma from "../config/dbConfig";
import { ExtendedNote } from "../types/Prisma";
import bcrypt from "bcrypt";

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
      password,
      sharedUsers,
      tags,
    }: ExtendedNote = req.body;

    let hashedPassword: string | null = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

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
        tags: { connect: tags.map((tag) => ({ id: tag.id })) },
        privateNote: isPrivate
          ? {
              create: {
                ...(password !== null && { password: hashedPassword }),
                sharedUsers: sharedUsers || [],
              },
            }
          : undefined,
      },
      include: { ...(isPrivate && { privateNote: true }), tags: true },
    });

    res.status(201).json({ message: "Create note successful", data: newNote });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
