import { Prisma } from "@prisma/client";

export type StudyOrders = "new" | "old" | "most-notes" | "least-notes";

export const orderCondition: Record<
  StudyOrders,
  Prisma.StudyOrderByWithRelationAndSearchRelevanceInput
> = {
  new: { createdAt: "desc" },
  old: { createdAt: "asc" },
  "most-notes": { notes: { _count: "desc" } },
  "least-notes": { notes: { _count: "asc" } },
};
