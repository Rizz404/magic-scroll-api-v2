import { RequestHandler } from "express";
import {
  FileWithFirebase,
  getErrorMessage,
  getPaginatedResponse,
} from "../utils/express";
import prisma from "../config/dbConfig";
import { Profile, User } from "@prisma/client";
import { excludeFields } from "../utils/prisma";
import { UserOrders, orderCondition } from "../constants/user-constant";
import bcrypt from "bcrypt";

interface UsersReqQuery {
  page: string;
  limit: string;
  order: UserOrders;
  isVerified: "true" | "false";
  role: "ADMIN" | "USER";
  auth: "Auth" | "Oauth";
  username: string;
}

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      page = 1,
      limit = 10,
      order,
      isVerified,
      role,
      auth,
    } = req.query as unknown as UsersReqQuery;

    const orderAvailable = ["new", "old"];
    const sortByOrder =
      orderCondition(userId)[order] || orderCondition(userId).new;

    const skip = (+page - 1) * +limit;
    const totalData = await prisma.user.count({
      where: {
        isVerified: isVerified === "true" ? true : false,
        role,
        isOauth: auth === "Oauth",
      },
    });

    const users = await prisma.user.findMany({
      where: {
        isVerified: isVerified === "true" ? true : false,
        role,
        isOauth: auth === "Oauth",
      },
      omit: { password: true },
      orderBy: sortByOrder,
      take: +limit,
      skip,
    });

    const response = getPaginatedResponse(users, +page, +limit, totalData, {
      order: order || "new",
      orderAvailable,
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const user = await prisma.user.findUnique({
      where: { id },
      omit: { password: true },
      include: { profile: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      omit: { password: true },
      include: { profile: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getFollowings: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const {
      page = 1,
      limit = 10,
      order,
      isVerified,
    } = req.query as unknown as UsersReqQuery;

    const orderAvailable = ["new", "old"];
    const sortByOrder = orderCondition(id)[order] || orderCondition(id).new;

    const skip = (+page - 1) * +limit;
    const followings = await prisma.follow.findMany({
      where: { followerId: id },
      select: { followingId: true },
    });

    const users = await prisma.user.findMany({
      where: {
        isVerified: isVerified === "true" ? true : false,
        id: { in: followings.map(({ followingId }) => followingId) },
      },
      omit: { password: true },
      orderBy: sortByOrder,
      take: +limit,
      skip,
    });

    const response = getPaginatedResponse(
      users,
      +page,
      +limit,
      followings.length,
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

export const getFollowers: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const {
      page = 1,
      limit = 10,
      order,
      isVerified,
    } = req.query as unknown as UsersReqQuery;

    const orderAvailable = ["new", "old"];
    const sortByOrder = orderCondition(id)[order] || orderCondition(id).new;

    const skip = (+page - 1) * +limit;
    const followers = await prisma.follow.findMany({
      where: { followingId: id },
      select: { followerId: true },
    });

    const users = await prisma.user.findMany({
      where: {
        isVerified: isVerified === "true" ? true : false,
        id: { in: followers.map(({ followerId }) => followerId) },
      },
      omit: { password: true },
      orderBy: sortByOrder,
      take: +limit,
      skip,
    });

    const response = getPaginatedResponse(
      users,
      +page,
      +limit,
      followers.length,
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

export const searchUserByName: RequestHandler = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      username,
    } = req.query as unknown as UsersReqQuery;
    const skip = (+page - 1) * +limit;
    const totalData = await prisma.user.count({
      where: { username: { contains: username, mode: "insensitive" } },
    });

    const users = await prisma.user.findMany({
      where: { username: { contains: username, mode: "insensitive" } },
      omit: { password: true },
      take: +limit,
      skip,
    });

    const response = getPaginatedResponse(users, +page, +limit, totalData);

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
      const existingUserWithUsername = await prisma.user.findFirst({
        where: { username },
      });
      if (existingUserWithUsername) {
        message.push("Username already in use");
      }
    }

    // Jika email diisi, cek ketersediaan email
    if (email) {
      const existingUserWithEmail = await prisma.user.findFirst({
        where: { email },
      });
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

export const updateUserById: RequestHandler = async (req, res) => {
  try {
    const { id, isOauth } = req.user!;
    const { username, email }: User = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      omit: { password: true },
      data: { username, ...(isOauth === false && { email }) },
    });

    if (!updatedUser) {
      return res
        .status(400)
        .json({ message: "Something wrong when updating user" });
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
        age: typeof age === "string" ? +age : age,
        phone,
      },
    });

    if (!updatedUserProfile) {
      return res
        .status(400)
        .json({ message: "Something wrong when updating user" });
    }

    res.json({
      message: "Update profile successful",
      data: updatedUserProfile,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const followOrUnfollowUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { userId } = req.params;

    if (id === userId)
      return res.status(400).json({ message: "Can't follow yourself" });

    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: id, followingId: userId },
      },
    });

    let response;

    if (!isFollowing) {
      response = await prisma.follow.create({
        data: { followerId: id, followingId: userId },
      });
    } else {
      response = await prisma.follow.deleteMany({
        where: { followerId: id, followingId: userId },
      });
    }

    res.json({
      message: !isFollowing
        ? "User followed successfully"
        : "User unfollowed successfully",
      ...(!isFollowing && { data: response }),
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const changePassword: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true, isOauth: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Something went wrong" });
    }

    if (user.isOauth) {
      return res
        .status(400)
        .json({ message: "Oauth doesn't include password" });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user?.password!);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Password doesn't match" });
    }

    const salt = await bcrypt.genSalt();
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedPassword = await prisma.user.update({
      where: { id },
      data: { password: newHashedPassword },
    });

    res.json({ message: "Update password successful", data: updatedPassword });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const changeUserRole: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role }: User = req.body;

    const updatedRole = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    res.json({ message: "Successful change role", data: updatedRole });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { role, id } = req.user!;
    const { userId } = req.params;
    let deletedUser;

    if (role === "ADMIN") {
      deletedUser = await prisma.user.delete({ where: { id: userId } });
    } else {
      deletedUser = await prisma.user.delete({ where: { id } });
    }

    if (role === "USER") {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
    }
    res.json({ message: "Delete user successful", data: deletedUser });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
