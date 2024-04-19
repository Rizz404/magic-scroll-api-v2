import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Pool } from "pg";

// ! sebernya konsep pool sama adapter experimental tapi pake aja gpp
// ! semakin ribet dan tidak tersedia secara global makanya dihapus
// const connectionString = process.env.DATABASE_URL;
// const poll = new Pool({ connectionString });
// const adapter = new PrismaPg(poll);
const prisma = new PrismaClient().$extends(withAccelerate());

export default prisma;
