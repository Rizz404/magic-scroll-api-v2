import { Prisma } from "@prisma/client";

export type UserOrders = "new" | "old";

export const orderCondition = (
  currentUserId?: string
): Record<UserOrders, Prisma.UserOrderByWithRelationInput> => {
  return {
    new: { createdAt: "desc" },
    old: { createdAt: "asc" },
  };
};
