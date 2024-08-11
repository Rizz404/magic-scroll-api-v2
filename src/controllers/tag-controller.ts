import { Tag } from "@prisma/client";
import { RequestHandler } from "express";
import { getErrorMessage, getPaginatedResponse } from "../utils/express";
import prisma from "../config/dbConfig";
import { TagOrders, orderCondition } from "../constants/tag-constant";

interface TagReqQuery {
  page: string;
  limit: string;
  name: string;
  order: TagOrders;
}

export const createTag: RequestHandler = async (req, res) => {
  try {
    const { name, description }: Tag = req.body;

    const newTag = await prisma.tag.create({
      data: { name, description },
    });

    res.status(201).json({ message: "Create tag successful", data: newTag });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getTags: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, order } = req.query as unknown as TagReqQuery;

    const orderAvailable = ["new", "old", "most-notes", "least-notes"];

    // * Konversi string ke number langsung dengan +
    const skip = (+page - 1) * +limit;
    const totalData = await prisma.tag.count();

    const sortByOrder = orderCondition[order] || orderCondition.new;

    const tags = await prisma.tag.findMany({
      take: +limit,
      skip,
      orderBy: sortByOrder,
    });
    const response = getPaginatedResponse(tags, +page, +limit, totalData, {
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
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) return res.status(404).json({ message: "Tag not found" });

    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const searchTagByName: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, name } = req.query as unknown as TagReqQuery;

    const skip = (+page - 1) * +limit;
    const totalData = await prisma.tag.count({
      where: { name: { contains: name } },
    });

    const tags = await prisma.tag.findMany({
      take: +limit,
      skip,
      where: { name: { contains: name, mode: "insensitive" } },
    });

    const response = getPaginatedResponse(tags, +page, +limit, totalData);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateTagById: RequestHandler = async (req, res) => {
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

export const deleteTagById: RequestHandler = async (req, res) => {
  try {
    const { tagId } = req.params;

    const deletedTag = await prisma.tag.delete({ where: { id: tagId } });

    res.json({ message: "Delete tag successful", data: deletedTag });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
