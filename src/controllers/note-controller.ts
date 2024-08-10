import { RequestHandler } from "express";
import {
  FileWithFirebase,
  FilesWithFirebase,
  getErrorMessage,
  getPaginatedResponse,
} from "../utils/express";
import prisma from "../config/dbConfig";
import { Tag } from "@prisma/client";
import deleteFileFirebase from "../utils/firebase";
import {
  NoteCategories,
  NoteOrders,
  filterCategoryCondition,
  orderCondition,
} from "../constants/note-constant";

interface NoteReqQuery {
  page: string;
  limit: string;
  category: NoteCategories;
  order: NoteOrders;
}

export const createNote: RequestHandler = async (req, res) => {
  console.log("test");
  try {
    const { id } = req.user!;
    const { title, content, isPrivate, tags } = req.body;
    const attachments = req.files as FilesWithFirebase;

    const isPrivateBool =
      typeof isPrivate === "boolean" ? isPrivate : isPrivate === "true";
    const tagsParsed = typeof tags === "string" ? JSON.parse(tags) : tags;
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
        })
      ) || [];

    // * Many to many relation itu otomatis nambakan note ke tag juga
    const newNote = await prisma.note.create({
      data: {
        userId: id,
        title,
        content,
        isPrivate: isPrivateBool ? isPrivateBool : false,
        notePermission: {
          create: { userId: id, permission: "READ_WRITE" },
        },
        tags: {
          connect: tagsParsed
            ? tagsParsed.map((tag: Tag) => ({ id: tag.id }))
            : [],
        },
        noteAttachments: {
          createMany: {
            data: attachmentsData,
          },
        },
      },
      include: {
        tags: true,
        noteAttachments: true,
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
    const {
      page = 1,
      limit = 10,
      category,
      order,
    } = req.query as unknown as NoteReqQuery;

    const categoryAvailable = [
      "home",
      "shared",
      "private",
      "self",
      "deleted",
      "archived",
      "favorited",
    ];
    const orderAvailable = ["new", "old", "best", "worst"];

    // * Walaupun userId di function tidak required tetap harus masukin biar tidak error
    const filterByCategory =
      filterCategoryCondition(userId)[category] ||
      filterCategoryCondition(userId).home;
    const sortByOrder =
      orderCondition(userId)[order] || orderCondition(userId).new;

    const skip = (+page - 1) * +limit;
    const totalData = await prisma.note.count({ where: filterByCategory });

    const notes = await prisma.note.findMany({
      where: filterByCategory,
      orderBy: sortByOrder,
      take: +limit,
      skip,
      include: { noteAttachments: { select: { id: true, url: true } } },
    });

    console.log("test");

    const response = getPaginatedResponse(notes, +page, +limit, totalData, {
      category: category || "home",
      categoryAvailable,
      order: order || "new",
      orderAvailable,
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getNotesByUserId: RequestHandler = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      category,
      order,
    } = req.query as unknown as NoteReqQuery;

    const categoryAvailable = ["home", "shared"];
    const orderAvailable = ["best", "worst", "new", "old"];

    const filterByCategory =
      filterCategoryCondition(currentUserId)[category] ||
      filterCategoryCondition(currentUserId).home;
    const sortByOrder =
      orderCondition(currentUserId)[order] || orderCondition(currentUserId).new;

    const skip = (+page - 1) * +limit;
    const totalData = await prisma.note.count({
      where: { AND: [{ userId }, filterByCategory] },
    });

    const notes = await prisma.note.findMany({
      where: { AND: [{ userId }, filterByCategory] },
      orderBy: sortByOrder,
      take: +limit,
      skip,
      include: { noteAttachments: { select: { id: true, url: true } } },
    });

    const response = getPaginatedResponse(notes, +page, +limit, totalData, {
      category: category || "home",
      categoryAvailable,
      order: order || "new",
      orderAvailable,
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getNotesByTagName: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { tagName } = req.params;
    const {
      page = 1,
      limit = 10,
      order,
    } = req.query as unknown as NoteReqQuery;

    const sortByOrder =
      orderCondition(userId)[order] || orderCondition(userId).new;

    const orderAvailable = ["new", "old", "best"];

    const skip = (+page - 1) * +limit;
    const totalData = await prisma.note.count({
      where: { tags: { some: { name: tagName } } },
    });

    const notes = await prisma.note.findMany({
      where: { tags: { some: { name: tagName } } },
      orderBy: sortByOrder,
      take: +limit,
      skip,
      include: { noteAttachments: { select: { id: true, url: true } } },
    });

    const response = getPaginatedResponse(notes, +page, +limit, totalData, {
      order: order || "new",
      orderAvailable,
    });

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
            ...(userId && { notePermission: { some: { userId } } }),
          },
        ],
      },
      include: {
        tags: true,
        user: {
          select: {
            username: true,
            email: true,
            isVerified: true,
          },
          include: { profile: { select: { profileImage: true } } },
        },
        notePermission: {
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
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
    const { title, content, isPrivate, tags } = req.body;

    const isPrivateBool =
      typeof isPrivate === "boolean" ? isPrivate : isPrivate === "true";
    const tagsParsed = typeof tags === "string" ? JSON.parse(tags) : tags;

    const hasReadAndWritePermission = await prisma.notePermission.findUnique({
      where: { noteId, userId: id, permission: "READ_WRITE" },
    });

    if (!hasReadAndWritePermission) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this note" });
    }

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        title,
        content,
        isPrivate: isPrivateBool,
        tags: { connect: tagsParsed.map((tag: Tag) => ({ id: tag.id })) },
      },
    });

    if (!updatedNote.isPrivate) {
      await prisma.notePermission.deleteMany({
        where: { noteId: updatedNote.id, permission: "READ" },
      });
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

    const noteUpvoted = await prisma.upvotedNote.findUnique({
      where: { userId_noteId: { userId: id, noteId } },
    });
    const noteDownvoted = await prisma.downvoteNote.findUnique({
      where: { userId_noteId: { userId: id, noteId } },
    });

    let response;

    if (!noteUpvoted) {
      response = await prisma.upvotedNote.create({
        data: { userId: id, noteId },
      });

      if (noteDownvoted) {
        await prisma.downvoteNote.delete({ where: { userId: id, noteId } });
        await prisma.note.update({
          where: { id: noteId },
          select: { downvotedCount: true },
          data: { downvotedCount: { decrement: 1 } },
        });
      }

      await prisma.note.update({
        where: { id: noteId },
        select: { upvotedCount: true },
        data: { upvotedCount: { increment: 1 } },
      });
    } else {
      response = await prisma.upvotedNote.delete({
        where: { userId: id, noteId },
      });

      await prisma.note.update({
        where: { id: noteId },
        select: { upvotedCount: true },
        data: { upvotedCount: { decrement: 1 } },
      });
    }

    res.json({
      message: !noteUpvoted
        ? "Note upvoted successful"
        : "Remove upvoted from note successful",
      ...(!noteUpvoted && { data: response }),
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const downvoteNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;

    const noteDownvoted = await prisma.downvoteNote.findUnique({
      where: { userId_noteId: { userId: id, noteId } },
    });
    const noteUpvoted = await prisma.upvotedNote.findUnique({
      where: { userId_noteId: { userId: id, noteId } },
    });

    let response;

    if (!noteDownvoted) {
      response = await prisma.downvoteNote.create({
        data: { userId: id, noteId },
      });

      if (noteUpvoted) {
        await prisma.upvotedNote.delete({ where: { userId: id, noteId } });
        await prisma.note.update({
          where: { id: noteId },
          select: { upvotedCount: true },
          data: { upvotedCount: { decrement: 1 } },
        });
      }

      await prisma.note.update({
        where: { id: noteId },
        select: { downvotedCount: true },
        data: { downvotedCount: { increment: 1 } },
      });
    } else {
      response = await prisma.downvoteNote.delete({
        where: { userId: id, noteId },
      });

      await prisma.note.update({
        where: { id: noteId },
        select: { downvotedCount: true },
        data: { downvotedCount: { increment: 1 } },
      });
    }

    res.json({
      message: !noteUpvoted
        ? "Note downvoted successful"
        : "Remove downvoted from note successful",
      ...(!noteUpvoted && { data: response }),
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const saveNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;

    const isNoteSaved = await prisma.savedNote.findUnique({
      where: { userId_noteId: { userId: id, noteId } },
    });

    let response;

    if (!isNoteSaved) {
      response = await prisma.savedNote.create({
        data: { userId: id, noteId },
      });

      await prisma.note.update({
        where: { id: noteId },
        data: { savedCount: { increment: 1 } },
      });
    } else {
      response = await prisma.savedNote.delete({
        where: { userId: id, noteId },
      });

      await prisma.note.update({
        where: { id: noteId },
        data: { savedCount: { decrement: 1 } },
      });
    }

    res.json({
      message: !isNoteSaved
        ? "Note saved successfully"
        : "Note unsaved successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
