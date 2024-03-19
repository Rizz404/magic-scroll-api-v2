import express from "express";
import { auth, optionalAuth } from "../middleware/auth";
import {
  addNotePermission,
  changeNotePermission,
  createNote,
  downvoteNote,
  getNoteById,
  getNotePermissionsFromNote,
  getNotes,
  makeNoteFavorite,
  saveNote,
  updateNote,
  upvoteNote,
} from "../controllers/note";

const router = express.Router();

router.route("/").post(auth, createNote).get(optionalAuth, getNotes).patch(auth, updateNote);
router.patch("/upvote/:noteId", auth, upvoteNote);
router.patch("/downvote/:noteId", auth, downvoteNote);
router.patch("/favorite/:noteId", auth, makeNoteFavorite);
router.patch("/save/:noteId", auth, saveNote);
router.route("/note-permissions").post(auth, addNotePermission).patch(auth, changeNotePermission);
router.get("/note-permissions/:noteId", getNotePermissionsFromNote);
router.route("/:noteId").get(optionalAuth, getNoteById);

export default router;
