import { Study } from "@prisma/client";
import { RequestHandler } from "express";
import { FileWithFirebase, getErrorMessage, getPaginatedResponse } from "../utils/express";
import prisma from "../config/dbConfig";

export const createStudy: RequestHandler = async (req, res) => {
  try {
    const { name, description }: Study = req.body;
    const image = req.file as FileWithFirebase;

    const newStudy = await prisma.study.create({
      data: { name, description, ...(image && { image: image.firebaseUrl }) },
    });

    res.status(201).json({ message: "Create study successful", data: newStudy });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getStudies: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;
    const totalData = await prisma.study.count();

    const studies = await prisma.study.findMany({ take: limit, skip });
    const response = getPaginatedResponse(studies, page, limit, totalData);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getStudyById: RequestHandler = async (req, res) => {
  try {
    const { studyId } = req.params;
    const study = await prisma.study.findUnique({ where: { id: studyId } });

    if (!study) return res.status(404).json({ message: "Study not found" });

    res.json(study);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateStudy: RequestHandler = async (req, res) => {
  try {
    const { studyId } = req.params;
    const { name, description }: Study = req.body;
    const image = req.file as FileWithFirebase;

    const updatedStudy = await prisma.study.update({
      where: { id: studyId },
      data: { name, description, ...(image && { image: image.firebaseUrl }) },
    });

    res.json({ message: "Update study successful", data: updatedStudy });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
