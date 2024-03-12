import express from "express";
import {
  followOrUnfollowUser,
  getUserById,
  getUserProfile,
  getUsers,
  updateUser,
  updateUserProfile,
} from "../controllers/user";
import { auth } from "../middleware/auth";

const router = express.Router();

router.route("/").get(getUsers).patch(auth, updateUser);
router.route("/profile").get(auth, getUserProfile).patch(auth, updateUserProfile);
router.patch("/follow:userId", auth, followOrUnfollowUser);
router.route("/:userId").get(getUserById);

export default router;
