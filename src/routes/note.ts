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
import uploadTofirebase from "../middleware/uploadFile";

const router = express.Router();

const uploadImage = uploadTofirebase({ fieldname: "thumbnailImage", type: "single" });
const uploadImages = uploadTofirebase({
  fieldname: "attachments",
  type: "array",
  maxFileCount: 10,
});

router.route("/").post(auth, uploadImage, uploadImages, createNote).get(optionalAuth, getNotes);

router.patch("/upvote/:noteId", auth, upvoteNote);
router.patch("/downvote/:noteId", auth, downvoteNote);
router.patch("/favorite/:noteId", auth, makeNoteFavorite);
router.patch("/save/:noteId", auth, saveNote);
router
  .route("/note-permissions/:noteId")
  .post(auth, addNotePermission)
  .get(getNotePermissionsFromNote)
  .patch(auth, changeNotePermission);
router
  .route("/:noteId")
  .get(optionalAuth, getNoteById)
  .patch(auth, uploadImage, uploadImages, updateNote);

export default router;
