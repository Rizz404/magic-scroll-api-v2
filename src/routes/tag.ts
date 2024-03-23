import express from "express";
import { auth } from "../middleware/auth";
import { createTag, getTagById, getTags } from "../controllers/tag";

const router = express.Router();

router.route("/").post(auth, createTag).get(getTags);
router.route("/:tagId").get(getTagById);

export default router;
