import { Prisma } from "@prisma/client";

export type NoteCategories = "home" | "shared" | "private" | "favorited" | "saved" | "self";
export type NoteOrders = "new" | "old" | "best" | "worst";

export const filterCategoryCondition = (
  currentUserId?: string
): Record<NoteCategories, Prisma.NoteWhereInput> => {
  return {
    home: !currentUserId
      ? { isPrivate: false }
      : {
          OR: [
            { isPrivate: false },
            {
              isPrivate: true,
              userId: currentUserId,
            },
            {
              userId: { not: currentUserId },
              notePermission: { some: { userId: currentUserId } },
            },
            {
              userId: currentUserId,
              notePermission: { some: { userId: { not: currentUserId } } },
            },
          ],
        },
    private: currentUserId ? { isPrivate: true, userId: currentUserId } : { id: "unreachable" },
    shared: currentUserId
      ? {
          OR: [
            { userId: { not: currentUserId }, notePermission: { some: { userId: currentUserId } } },
            { userId: currentUserId, notePermission: { some: { userId: { not: currentUserId } } } },
          ],
        }
      : { id: "unreachable" },
    self: currentUserId ? { userId: currentUserId } : { id: "unreachable" },
    favorited: currentUserId
      ? { noteInteraction: { some: { userId: currentUserId, isFavorited: true } } }
      : { id: "unreachable" },
    saved: currentUserId
      ? { noteInteraction: { some: { userId: currentUserId, isSaved: true } } }
      : { id: "unreachable" },
  };
};

export const orderCondition = (
  currentUserId?: string
): Record<NoteOrders, Prisma.NoteOrderByWithRelationAndSearchRelevanceInput> => {
  return {
    new: { createdAt: "desc" },
    old: { createdAt: "asc" },
    best: { noteInteractionCounter: { upvotedCount: "desc" } },
    worst: { noteInteractionCounter: { downvotedCount: "desc" } },
  };
};
