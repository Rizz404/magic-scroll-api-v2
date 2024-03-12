import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

// ! sebernya konsep pool sama adapter experimental tapi pake aja gpp
const connectionString = process.env.DATABASE_URL;
const poll = new Pool({ connectionString });
const adapter = new PrismaPg(poll);
const prisma = new PrismaClient({ adapter });

export default prisma;
