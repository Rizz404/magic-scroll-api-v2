import express from "express";
import { auth } from "../middleware/auth";
import {
  addAttachments,
  deleteAttachments,
} from "../controllers/noteAttachment-controller";
import { uploadArrayToFirebase } from "../middleware/uploadFile";

const router = express.Router();

router.post(
  "/note/:noteId",
  auth,
  uploadArrayToFirebase({
    fieldname: "attachments",
    maxFileCount: 10,
    uploadToFolder: "note",
  }),
  addAttachments
);
router.delete("/:noteAttachmentId", auth, deleteAttachments);

export default router;
