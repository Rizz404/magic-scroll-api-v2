import express from "express";
import { auth } from "../middleware/auth";
import {
  addAttachments,
  deleteAttachments,
} from "../controllers/noteAttachment-controller";

const router = express.Router();

router.post("/note/:noteId", auth, addAttachments);
router.delete("/:noteAttachmentId", auth, deleteAttachments);

export default router;
