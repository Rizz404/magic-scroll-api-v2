import { RequestHandler } from "express";
import { getErrorMessage } from "../utils/express";
import { User } from "@prisma/client";
import prisma from "../config/dbConfig";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: User = req.body;

    const user = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });

    if (user) return res.status(409).json({ message: "User already exist" });

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password!!, salt);

    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, isOauth: false },
    });

    res.status(201).json({ message: "Register successful", data: newUser });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: User = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
      include: { profile: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordMatch = await bcrypt.compare(password!!, user.password!!);

    if (!passwordMatch) return res.status(400).json({ message: "Invalid password" });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        profile: {
          create: !user.profile ? {} : undefined,
        },
      },
      include: { profile: true },
    });

    const newAccessToken = jwt.sign(
      {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isOauth: updatedUser.isOauth,
        lastLogin: updatedUser.lastLogin,
        profileId: updatedUser.profile?.id,
      },
      process.env.JWT_ACCESS_TOKEN!!,
      {
        expiresIn: "30m",
      }
    );
    const newRefreshToken = jwt.sign(updatedUser.id, process.env.JWT_REFRESH_TOKEN!!);

    res.cookie("jwt", newRefreshToken, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // * 30 hari
    });

    res.json({
      message: "Login successful",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isOauth: updatedUser.isOauth,
        lastLogin: updatedUser.lastLogin,
        profileId: updatedUser.profile?.id,
      },
      token: newAccessToken,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const refresh: RequestHandler = async (req, res) => {
  try {
    const { jwt: refreshToken } = req.cookies;

    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    const decodedUserId = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN!!);

    if (!decodedUserId) return res.status(401).json({ message: "Invalid token" });

    const user = await prisma.user.findUnique({
      where: { id: decodedUserId as string },
      include: { profile: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isOauth: user.isOauth,
        lastLogin: user.lastLogin,
        profileId: user.profile?.id,
      },
      process.env.JWT_ACCESS_TOKEN!!,
      { expiresIn: "30m" }
    );

    res.json({ message: "Refresh token successful", token: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const { jwt: refreshToken } = req.cookies;

    if (!refreshToken) return res.status(204).json({ message: "No content" });

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.json({ message: "Logout Successfully" });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
