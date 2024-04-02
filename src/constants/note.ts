import { Prisma } from "@prisma/client";

export type NoteCategories = "home" | "shared" | "private" | "favorited" | "saved" | "self";
export type NoteOrders = "best" | "worst" | "new" | "old";

export const filterCategoryCondition = (
  currentUserId?: string
): Record<NoteCategories, Prisma.NoteWhereInput> => {
  return {
    home: {
      OR: [
        { isPrivate: false },
        {
          ...(currentUserId && {
            isPrivate: true,
            OR: [
              { userId: currentUserId },
              { notePermission: { some: { userId: currentUserId } } },
            ],
          }),
        },
      ],
    },
    private: {
      ...(currentUserId
        ? { OR: [{ isPrivate: true }, { notePermission: { some: { userId: currentUserId } } }] }
        : { id: { equals: "unreachable" } }), // ! biar kaga nampilin apa-apa kalau user kaga login
    },
    shared: {
      ...(currentUserId
        ? { notePermission: { some: { userId: currentUserId } } }
        : { id: { equals: "unreachable" } }),
    },
    self: { ...(currentUserId ? { userId: currentUserId } : { id: { equals: "unreachable" } }) },
    favorited: {
      ...(currentUserId
        ? { noteInteraction: { some: { userId: currentUserId, isFavorited: true } } }
        : { id: { equals: "unreachable" } }),
    },
    saved: {
      ...(currentUserId
        ? { noteInteraction: { some: { userId: currentUserId, isSaved: true } } }
        : { id: { equals: "unreachable" } }),
    },
  };
};

export const orderCondition = (
  currentUserId?: string
): Record<NoteOrders, Prisma.NoteOrderByWithRelationInput> => {
  return {
    best: { upvotedCount: "desc" },
    worst: { downvotedCount: "desc" },
    new: { createdAt: "desc" },
    old: { createdAt: "asc" },
  };
};
