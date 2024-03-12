import { Study } from "@prisma/client";
import { RequestHandler } from "express";
import { getErrorMessage } from "../utils/express";
import prisma from "../config/dbConfig";

export const createStudy: RequestHandler = async (req, res) => {
  try {
    const { name, description }: Study = req.body;

    const newStudy = await prisma.study.create({ data: { name, description } });

    res.status(201).json({ message: "Create study successful", data: newStudy });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
