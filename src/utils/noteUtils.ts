import { Prisma } from "@prisma/client";
import prisma from "../config/dbConfig";

interface GetNotesFunction {
  userId: string | undefined;
  where: Prisma.NoteWhereInput;
  orderBy: Prisma.NoteOrderByWithRelationAndSearchRelevanceInput;
  limit: number;
  skip: number;
}

export const getNotesFunction = async (options: GetNotesFunction) => {
  const { userId, where, orderBy, limit, skip } = options;

  const notes = await prisma.note.findMany({
    where,
    orderBy,
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
      ...(userId && {
        noteInteraction: {
          where: { userId: userId },
        },
      }),
      noteInteractionCounter: true,
    },
  });

  return notes.map((note) => ({
    ...note,
    ...(userId && { noteInteraction: note.noteInteraction[0] || undefined }),
  }));
};
