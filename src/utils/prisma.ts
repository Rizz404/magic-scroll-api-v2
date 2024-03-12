import prisma from "../config/dbConfig";

export const excludeFields = <T extends object, Keys extends keyof T>(
  obj: T,
  keys: Keys[]
): Omit<T, Keys> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as Keys))
  ) as Omit<T, Keys>;
};
