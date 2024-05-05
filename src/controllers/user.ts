import { RequestHandler } from "express";
import { FileWithFirebase, getErrorMessage, getPaginatedResponse } from "../utils/express";
import prisma from "../config/dbConfig";
import { Profile, User } from "@prisma/client";
import { excludeFields } from "../utils/prisma";
import { UserOrders, orderCondition } from "../constants/user";

interface GetUsersQuery {
  page: string;
  limit: string;
  order: UserOrders;
  isVerified: boolean;
  role: "ADMIN" | "USER";
  auth: "Auth" | "Oauth";
}

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page, limit, order, isVerified, role, auth } = req.query as unknown as GetUsersQuery;

    const pageConstant = parseInt(page) || 1;
    const limitConstant = parseInt(limit) || 10;
    const isVerifiedConstant = typeof isVerified === "boolean" ? isVerified : isVerified === "true";
    const orderAvailable = ["new", "old"];

    const orderBy = orderCondition(userId)[order] || orderCondition(userId).new;

    const skip = (pageConstant - 1) * limitConstant;
    const totalData = await prisma.user.count({
      where: { isVerified: isVerifiedConstant, role, isOauth: auth === "Oauth" },
    });

    const users = await prisma.user.findMany({
      where: { isVerified: isVerifiedConstant, role, isOauth: auth === "Oauth" },
      orderBy,
      take: limitConstant,
      skip,
    });
    const usersWithoutPassword = users.map((user) => excludeFields(user, ["password"]));

    const response = getPaginatedResponse(
      usersWithoutPassword,
      pageConstant,
      limitConstant,
      totalData,
      {
        order: order || "new",
        orderAvailable,
      }
    );

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const searchUserByName: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const username = req.query.username as string;

    const skip = (page - 1) * limit;
    const totalData = await prisma.user.count({
      where: { username: { contains: username, mode: "insensitive" } },
    });

    const users = await prisma.user.findMany({
      take: limit,
      skip,
      where: { username: { contains: username, mode: "insensitive" } },
    });

    const response = getPaginatedResponse(users, page, limit, totalData);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const checkUserAvailability: RequestHandler = async (req, res) => {
  try {
    const { username, email } = req.body;

    // * Cek apakah username dan email tidak kosong
    if (!username && !email) {
      return res.status(400).json({ message: "Username must be filled" });
    }

    const message = [];

    // Jika username diisi, cek ketersediaan username
    if (username) {
      const existingUserWithUsername = await prisma.user.findFirst({ where: { username } });
      if (existingUserWithUsername) {
        message.push("Username already in use");
      }
    }

    // Jika email diisi, cek ketersediaan email
    if (email) {
      const existingUserWithEmail = await prisma.user.findFirst({ where: { email } });
      if (existingUserWithEmail) {
        message.push("Email already in use");
      }
    }

    // Jika ada error, kembalikan response error
    if (message.length > 0) {
      return res.status(400).json({ message });
    }

    // * Jika tidak ada user yang ditemukan, berarti username dan email tersedia
    res.json({ message: "Username dan email tersedia" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id, isOauth } = req.user!;
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
    const { profileId } = req.user!;
    const image = req.file as FileWithFirebase;

    const { firstName, lastName, age, phone } = req.body;

    const updatedUserProfile = await prisma.profile.update({
      where: { id: profileId },
      data: {
        firstName,
        lastName,
        ...(image && { profileImage: image.firebaseUrl }),
        age: typeof age === "string" ? parseInt(age) : age,
        phone,
      },
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
    const { id } = req.user!;
    const { userId } = req.params;

    if (id === userId) return res.status(400).json({ message: "Can't follow yourself" });

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

export const changeUserRole: RequestHandler = async (req, res) => {
  try {
    const { id: userId, role }: User = req.body;

    const updatedRole = await prisma.user.update({ where: { id: userId }, data: { role } });

    res.json({ message: "Successful change role", data: updatedRole });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
