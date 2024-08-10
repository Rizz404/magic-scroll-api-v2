import express from "express";
import { auth, optionalAuth } from "../middleware/auth";
import {
  createNote,
  downvoteNote,
  getNoteById,
  getNotes,
  getNotesByTagName,
  getNotesByUserId,
  saveNote,
  updateNote,
  upvoteNote,
} from "../controllers/note-controller";
import { uploadArrayToFirebase } from "../middleware/uploadFile";

const router = express.Router();

router
  .route("/")
  .post(
    auth,
    uploadArrayToFirebase({
      fieldname: "attachments",
      maxFileCount: 10,
      uploadToFolder: "note",
    }),
    createNote
  )
  .get(optionalAuth, getNotes);
router.patch("/upvote/:noteId", auth, upvoteNote);
router.patch("/downvote/:noteId", auth, downvoteNote);
router.patch("/save/:noteId", auth, saveNote);
router.get("/user/:userId", optionalAuth, getNotesByUserId);
router.get("/tag/:tagName", optionalAuth, getNotesByTagName);
router
  .route("/:noteId")
  .get(optionalAuth, getNoteById)
  .patch(
    auth,
    uploadArrayToFirebase({
      fieldname: "attachments",
      maxFileCount: 10,
      uploadToFolder: "note",
    }),
    updateNote
  );

export default router;
