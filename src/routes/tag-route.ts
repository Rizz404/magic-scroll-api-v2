import express from "express";
import { auth } from "../middleware/auth";
import {
  createTag,
  getTagById,
  getTags,
  searchTagByName,
  updateTagById,
  deleteTagById,
} from "../controllers/tag-controller";
import allowedRoles from "../middleware/allowedRoles";

const router = express.Router();

router.route("/").post(auth, createTag).get(getTags);
router.get("/search", searchTagByName);
router
  .route("/:tagId")
  .get(getTagById)
  .patch(auth, allowedRoles("ADMIN"), updateTagById)
  .delete(auth, allowedRoles("ADMIN"), deleteTagById);

export default router;
