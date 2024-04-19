import { RequestHandler } from "express";
import {
  FileWithFirebase,
  FilesWithFirebase,
  getErrorMessage,
  getPaginatedResponse,
} from "../utils/express";
import prisma from "../config/dbConfig";
import { Note, Tag } from "@prisma/client";
import deleteFileFirebase from "../utils/firebase";
import {
  NoteCategories,
  NoteOrders,
  filterCategoryCondition,
  orderCondition,
} from "../constants/note";

export const createNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { studyId, title, content, isPrivate, tags } = req.body;
    const image = req.file as FileWithFirebase;

    const isPrivateBool = typeof isPrivate === "boolean" ? isPrivate : isPrivate === "true";
    const tagsParsed = typeof tags === "string" ? JSON.parse(tags) : tags;

    const randomImages = [
      "https://i.pinimg.com/236x/f6/77/b0/f677b029c3b794a5fada3f884f91522b.jpg",
      "https://i.pinimg.com/236x/c6/20/50/c62050082632c18cf1c838120f268bfb.jpg",
      "https://i.pinimg.com/236x/9f/c2/14/9fc214fa94964af4a6728cf3571cd795.jpg",
      "https://i.pinimg.com/236x/01/dd/0c/01dd0c332d164345145156d464498df1.jpg",
    ];
    const randomIndex = Math.floor(Math.random() * randomImages.length);

    // * Many to many relation itu otomatis nambakan note ke tag juga
    const newNote = await prisma.note.create({
      data: {
        userId: id,
        studyId,
        title,
        content,
        thumbnailImage: image ? image.firebaseUrl : randomImages[randomIndex],
        isPrivate: isPrivateBool ? isPrivateBool : false,
        notePermission: {
          create: { userId: id, permission: "READ_WRITE" },
        },
        tags: { connect: tagsParsed ? tagsParsed.map((tag: Tag) => ({ id: tag.id })) : [] },
      },
    });

    res.status(201).json({ message: "Create note successful", data: newNote });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const addAttachmentsToNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;
    const files = req.files as FilesWithFirebase;
    const addedAttachments = await prisma.note.update({
      where: { id: noteId, userId: id },
      data: { attachments: { push: files.map((file) => file.firebaseUrl) } },
    });

    res.status(201).json({ message: "Add attachments successful", data: addedAttachments });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const deleteMultipleAttachmentsInNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { noteId } = req.params;
    const { attachmentsIndexes }: { attachmentsIndexes: number[] } = req.body;
    const note = await prisma.note.findUnique({
      where: { id: noteId, userId: id },
    });

    if (!note) return res.status(404).json({ message: "Invalid note or userId" });

    const deletedAttachments = note.attachments.filter((_, index) =>
      attachmentsIndexes.includes(index)
    );
    const updatedAttachments = note.attachments.filter(
      (_, index) => !attachmentsIndexes.includes(index)
    );

    for (const attachment of deletedAttachments) {
      await deleteFileFirebase("note", attachment);
    }

    const updatedNote = await prisma.note.update({
      where: { id: noteId, userId: id },
      data: { attachments: updatedAttachments },
    });

    res.json({ message: "Delete attachments successful", data: updatedNote });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getNotes: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as NoteCategories;
    const order = req.query.order as NoteOrders;

    const categoryAvailable = ["home", "shared", "private", "favorited", "saved", "self"];
    const orderAvailable = ["new", "old", "best", "worst"];

    // * Walaupun userId di function tidak required tetap harus masukin biar tidak error
    const filterByCategory =
      filterCategoryCondition(userId)[category] || filterCategoryCondition(userId).home;
    const sortByOrder = orderCondition(userId)[order] || orderCondition(userId).new;

    const skip = (page - 1) * limit;
    const totalData = await prisma.note.count({ where: filterByCategory });

    const notes = await prisma.note.findMany({
      where: filterByCategory,
      orderBy: sortByOrder,
      take: limit,
      skip,
      include: {
        user: {
          select: {
            username: true,
            email: true,
            isVerified: true,
            profile: { select: { profileImage: true } },
          },
        },
        study: { select: { id: true, name: true, image: true } },
        tags: { select: { id: true, name: true } },
      },
      cacheStrategy: { ttl: 3600 },
    });
    const response = getPaginatedResponse(notes, page, limit, totalData, {
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as NoteCategories;
    const order = req.query.order as NoteOrders;

    const categoryAvailable = ["home", "shared"];
    const orderAvailable = ["best", "worst", "new", "old"];

    const filterByCategory =
      filterCategoryCondition(currentUserId)[category] ||
      filterCategoryCondition(currentUserId).home;
    const sortByOrder = orderCondition(currentUserId)[order] || orderCondition(currentUserId).new;

    const skip = (page - 1) * limit;
    const totalData = await prisma.note.count({ where: { AND: [{ userId }, filterByCategory] } });

    const notes = await prisma.note.findMany({
      where: filterByCategory,
      orderBy: sortByOrder,
      take: limit,
      skip,
      include: {
        user: {
          select: {
            username: true,
            email: true,
            isVerified: true,
            profile: { select: { profileImage: true } },
          },
        },
        study: { select: { id: true, name: true, image: true } },
        tags: { select: { id: true, name: true } },
        ...(currentUserId && {
          noteInteraction: {
            where: { userId: currentUserId },
            select: { isUpvoted: true, isDownvoted: true, isFavorited: true, isSaved: true },
          },
        }),
      },
    });

    const response = getPaginatedResponse(notes, page, limit, totalData, {
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
        study: true,
        tags: true,
        user: {
          select: {
            username: true,
            email: true,
            isVerified: true,
            profile: { select: { profileImage: true } },
          },
        },
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

// ! Ternyata patch tidak bisa taruh id di body sebagai patokan update
export const updateNote: RequestHandler = async (req, res) => {
  try {
    const id = req.user?.id;
    const { noteId } = req.params;
    const { studyId, title, content, isPrivate, tags } = req.body;
    const image = req.file as FileWithFirebase;

    const isPrivateBool = typeof isPrivate === "boolean" ? isPrivate : isPrivate === "true";
    const tagsParsed = typeof tags === "string" ? JSON.parse(tags) : tags;

    const hasReadAndWritePermission = await prisma.notePermission.findUnique({
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
        isPrivate: isPrivateBool,
        tags: { connect: tagsParsed.map((tag: Tag) => ({ id: tag.id })) },
      },
    });

    if (updatedNote.isPrivate === false) {
      await prisma.notePermission.deleteMany({
        where: { noteId: updatedNote.id, permission: "READ" },
      });
    }

    res.json({ message: "Update note successful", data: updatedNote });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

// type interaction = "upvote" | "downvote" | "favorite" | "save";

// export const noteInteractionHandler = (interaction: interaction) => {
//   const interactionBoolean: Record<interaction, string> = {
//     upvote: "isUpvoted",
//     downvote: "isDownvoted",
//     favorite: "isFavorited",
//     save: "isSaved",
//   };

//   const interactionOperation: RequestHandler = async (req, res) => {
//     try {
//       const { id } = req.user!;
//       const { noteId } = req.params;

//       const existingVoteInteraction = await prisma.noteInteraction.findUnique({
//         where: { userId_noteId: { userId: id, noteId } },
//       });

//       const existingState = existingVoteInteraction?.[interactionBoolean[interaction]] === true;
//     } catch (error) {
//       res.status(500).json({ message: getErrorMessage(error) });
//     }
//   };

//   return interactionOperation;
// };

export const upvoteNote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
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

        await tx.noteInteractionCounter.update({
          where: { noteId },
          data: { upvotedCount: { increment: 1 } },
        });

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

        await tx.noteInteractionCounter.update({
          where: { noteId },
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

        await tx.noteInteractionCounter.update({
          where: { noteId },
          data: { upvotedCount: { decrement: 1 } },
        });

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
    const { id } = req.user!;
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

        await tx.noteInteractionCounter.update({
          where: { noteId },
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

        await tx.noteInteractionCounter.update({
          where: { noteId },
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

        await tx.noteInteractionCounter.update({
          where: { noteId },
          data: { downvotedCount: { decrement: 1 } },
        });

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
    const { id } = req.user!;
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

        await tx.noteInteractionCounter.update({
          where: { noteId },
          data: { favoritedCount: { increment: 1 } },
        });

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

        await tx.noteInteractionCounter.update({
          where: { noteId },
          data: { favoritedCount: { increment: 1 } },
        });

        return updatedInteraction;
      });
    } else {
      favoriteStatus = await prisma.$transaction(async (tx) => {
        const updatedInteraction = await tx.noteInteraction.update({
          where: { userId_noteId: { userId: id, noteId } },
          data: { isFavorited: false },
        });

        await tx.noteInteractionCounter.update({
          where: { noteId },
          data: { favoritedCount: { decrement: 1 } },
        });

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
    const { id } = req.user!;
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

        await tx.noteInteractionCounter.update({
          where: { noteId },
          data: { savedCount: { increment: 1 } },
        });

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

        await tx.noteInteractionCounter.update({
          where: { noteId },
          data: { savedCount: { increment: 1 } },
        });

        return updatedInteraction;
      });
    } else {
      saveStatus = await prisma.$transaction(async (tx) => {
        const updatedInteraction = await tx.noteInteraction.update({
          where: { userId_noteId: { userId: id, noteId } },
          data: { isSaved: false },
        });

        await tx.noteInteractionCounter.update({
          where: { noteId },
          data: { savedCount: { decrement: 1 } },
        });

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
