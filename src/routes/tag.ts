import express from "express";
import { auth } from "../middleware/auth";
import { createTag } from "../controllers/tag";

const router = express.Router();

router.route("/").post(auth, createTag);

export default router;
