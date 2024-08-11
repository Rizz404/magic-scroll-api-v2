import { Prisma } from "@prisma/client";

export type NoteCategories =
  | "home"
  | "shared"
  | "private"
  | "self"
  | "deleted"
  | "archived";
export type NoteOrders = "new" | "old" | "best" | "worst";

export const filterCategoryCondition = (
  currentUserId?: string
): Record<NoteCategories, Prisma.NoteWhereInput> => {
  return {
    home: !currentUserId
      ? { isPrivate: false, isDeleted: false }
      : {
          OR: [
            { isPrivate: false, isDeleted: false },
            {
              isPrivate: true,
              userId: currentUserId,
              isDeleted: false,
            },
            {
              userId: { not: currentUserId },
              notePermission: { some: { userId: currentUserId } },
              isDeleted: false,
            },
            {
              userId: currentUserId,
              notePermission: { some: { userId: { not: currentUserId } } },
              isDeleted: false,
            },
          ],
        },
    private: currentUserId
      ? { isPrivate: true, userId: currentUserId, isDeleted: false }
      : { id: "unreachable" },
    deleted: currentUserId
      ? { isDeleted: true, userId: currentUserId }
      : { id: "unreachable" },
    archived: currentUserId
      ? { isArchived: true, userId: currentUserId, isDeleted: false }
      : { id: "unreachable" },
    shared: currentUserId
      ? {
          OR: [
            {
              userId: { not: currentUserId },
              notePermission: { some: { userId: currentUserId } },
              isDeleted: false,
            },
            {
              userId: currentUserId,
              notePermission: { some: { userId: { not: currentUserId } } },
              isDeleted: false,
            },
          ],
        }
      : { id: "unreachable" },
    self: currentUserId
      ? { userId: currentUserId, isDeleted: false }
      : { id: "unreachable" },
  };
};

export const orderCondition = (
  currentUserId?: string
): Record<NoteOrders, Prisma.NoteOrderByWithRelationInput> => {
  return {
    new: { createdAt: "desc" },
    old: { createdAt: "asc" },
    best: { upvotedCount: "desc" },
    worst: { downvotedCount: "desc" },
  };
};
