import { RequestHandler } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { getErrorMessage } from "../utils/express";

interface ReqUser {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  isOauth: boolean;
  lastLogin: Date;
  profileId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: ReqUser;
    }
  }
}

export const auth: RequestHandler = async (req, res, next) => {
  try {
    const { authorization: authHeader } = req.headers;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = authHeader.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN!!) as ReqUser;

    if (!decoded.id) return res.status(401).json({ message: "Invalid token" });

    req.user = decoded;

    if (!req.user) {
      return res.status(401).json({ message: "Something wrong cause req.user undefined" });
    }

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const optionalAuth: RequestHandler = async (req, res, next) => {
  try {
    const { authorization: authHeader } = req.headers;

    if (!authHeader) return next();
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = authHeader.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN!!) as ReqUser;

    if (!decoded.id) return res.status(401).json({ message: "Invalid token" });

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
