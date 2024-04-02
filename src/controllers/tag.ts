import { Tag } from "@prisma/client";
import { RequestHandler } from "express";
import { getErrorMessage, getPaginatedResponse } from "../utils/express";
import prisma from "../config/dbConfig";
import { TagOrders, orderCondition } from "../constants/tag";

export const createTag: RequestHandler = async (req, res) => {
  try {
    const { name, description }: Tag = req.body;

    const newTag = await prisma.tag.create({ data: { name, description } });

    res.status(201).json({ message: "Create tag successful", data: newTag });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getTags: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const order = req.query.order as TagOrders;

    const orderAvailable = ["new", "old", "most-notes", "least-notes"];

    const skip = (page - 1) * limit;
    const totalData = await prisma.tag.count();

    const sortByOrder = orderCondition[order] || orderCondition.new;

    const tags = await prisma.tag.findMany({ take: limit, skip, orderBy: sortByOrder });
    const response = getPaginatedResponse(tags, page, limit, totalData, {
      order: order || "new",
      orderAvailable,
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getTagById: RequestHandler = async (req, res) => {
  try {
    const { tagId } = req.params;
    const tag = await prisma.tag.findUnique({ where: { id: tagId } });

    if (!tag) return res.status(404).json({ message: "Tag not found" });

    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const searchTagByName: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const name = req.query.name as string;

    const skip = (page - 1) * limit;
    const totalData = await prisma.tag.count({ where: { name: { contains: name } } });

    const tags = await prisma.tag.findMany({
      take: limit,
      skip,
      where: { name: { contains: name, mode: "insensitive" } },
    });

    const response = getPaginatedResponse(tags, page, limit, totalData);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateTag: RequestHandler = async (req, res) => {
  try {
    const { tagId } = req.params;
    const { name, description }: Tag = req.body;

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: { name, description },
    });

    res.json({ message: "Update tag successful", data: updatedTag });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
