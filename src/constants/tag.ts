import { Prisma } from "@prisma/client";

export type TagOrders = "new" | "old" | "most-notes" | "least-notes";

export const orderCondition: Record<TagOrders, Prisma.TagOrderByWithRelationInput> = {
  new: { createdAt: "desc" },
  old: { createdAt: "asc" },
  "most-notes": { notes: { _count: "desc" } },
  "least-notes": { notes: { _count: "asc" } },
};
