import { RequestHandler } from "express";
import { getErrorMessage } from "../utils/express";

const allowedRoles: (allowedRoles: "ADMIN" | "USER") => RequestHandler =
  (allowedRoles) => async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Need authentication" });

      const { role } = req.user;

      if (!allowedRoles) return res.status(400).json({ message: "Must fill at least one role" });

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: `Only ${allowedRoles} allowed` });
      }
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  };

export default allowedRoles;
