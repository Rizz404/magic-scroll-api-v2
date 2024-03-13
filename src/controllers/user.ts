import { RequestHandler } from "express";
import { getErrorMessage, getPaginatedResponse } from "../utils/express";
import prisma from "../config/dbConfig";
import { Profile, User } from "@prisma/client";
import { excludeFields } from "../utils/prisma";

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;
    const totalData = await prisma.user.count();

    const users = await prisma.user.findMany({ take: limit, skip });
    const usersWithoutPassword = users.map((user) => excludeFields(user, ["password"]));
    const response = getPaginatedResponse(usersWithoutPassword, page, limit, totalData);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const response = excludeFields(user, ["password"]);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id, isOauth } = req.user;
    const { username, email }: User = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { username, ...(isOauth === false && { email }) },
    });

    if (!updatedUser) {
      return res.status(400).json({ message: "Something wrong when updating user" });
    }

    res.json({ message: "Update user successful", data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateUserProfile: RequestHandler = async (req, res) => {
  try {
    const { profileId } = req.user;
    const {
      firstName,
      lastName,
      profileImage: profileImageString,
      age,
      phone,
      socialMedias,
    }: Profile = req.body;

    const updatedUserProfile = await prisma.profile.update({
      where: { id: profileId },
      data: { firstName, lastName, profileImage: profileImageString, age, phone, socialMedias },
    });

    if (!updatedUserProfile) {
      return res.status(400).json({ message: "Something wrong when updating user" });
    }

    res.json({ message: "Update profile successful", data: updatedUserProfile });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const followOrUnfollowUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user;
    const { userId } = req.params;

    const isFollowing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: id, followingId: userId } },
    });

    let response;

    if (!isFollowing) {
      response = await prisma.follow.create({ data: { followerId: id, followingId: userId } });
    } else {
      response = await prisma.follow.deleteMany({ where: { followerId: id, followingId: userId } });
    }

    res.json({
      message: !isFollowing ? "User followed successfully" : "User unfollowed successfully",
      ...(!isFollowing && { data: response }),
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
