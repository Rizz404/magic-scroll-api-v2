import express from "express";
import { auth } from "../middleware/auth";
import { createTag, getTagById, getTags, updateTag } from "../controllers/tag";
import allowedRoles from "../middleware/allowedRoles";

const router = express.Router();

router.route("/").post(auth, createTag).get(getTags);
router.route("/:tagId").get(getTagById).patch(auth, allowedRoles("ADMIN"), updateTag);

export default router;
