import { Tag } from "@prisma/client";
import { RequestHandler } from "express";
import { getErrorMessage } from "../utils/express";
import prisma from "../config/dbConfig";

export const createTag: RequestHandler = async (req, res) => {
  try {
    const { name, description }: Tag = req.body;

    const newTag = await prisma.tag.create({ data: { name, description } });

    res.status(201).json({ message: "Create tag successful", data: newTag });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
