import { RequestHandler } from "express";
import { FilesWithFirebase, getErrorMessage } from "../utils/express";
import prisma from "../config/dbConfig";
import deleteFileFirebase from "../utils/firebase";

export const addAttachments: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;
    const attachments = req.files as FilesWithFirebase;

    const attachmentsData =
      attachments?.map(
        ({
          fieldname,
          originalname,
          mimetype,
          size,
          destination,
          filename,
          path,
          firebaseUrl,
        }) => ({
          fieldname: fieldname || "",
          originalname: originalname || "",
          mimetype: mimetype || "",
          size: size || 0,
          destination: destination || "",
          filename: filename || "",
          path: path || "",
          url: firebaseUrl,
          noteId,
        })
      ) || [];

    const hasPermission = await prisma.notePermission.findUnique({
      where: {
        userId_noteId: { noteId, userId: id },
        permission: "READ_WRITE",
      },
    });

    if (!hasPermission) {
      return res
        .status(403)
        .json({ message: "You don't have permission to add attachment" });
    }

    const createdAttachments = await prisma.noteAttachment.createManyAndReturn({
      data: attachmentsData,
      skipDuplicates: true,
    });

    res.status(201).json({
      message: "Add attachments successfull",
      data: createdAttachments,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const deleteAttachments: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteAttachmentId } = req.params;
    const { noteId } = req.body;

    const hasPermission = await prisma.notePermission.findUnique({
      where: {
        userId_noteId: { noteId, userId: id },
        permission: "READ_WRITE",
      },
    });

    if (!hasPermission) {
      return res
        .status(403)
        .json({ message: "You don't have permission to add attachment" });
    }

    const deletedAttachment = await prisma.noteAttachment.delete({
      where: { id: noteAttachmentId },
    });

    await deleteFileFirebase("note", deletedAttachment.url);

    res.json({
      message: "Delete attachment successfull",
      data: deletedAttachment,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
