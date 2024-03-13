import express from "express";
import { auth } from "../middleware/auth";
import { createNote, getNoteById, getNotes } from "../controllers/note";

const router = express.Router();

router.route("/").post(auth, createNote).get(getNotes);
router.route("/:noteId").get(getNoteById);

export default router;
