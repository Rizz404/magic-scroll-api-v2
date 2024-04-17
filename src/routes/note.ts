import express from "express";
import { auth, optionalAuth } from "../middleware/auth";
import {
  addAttachmentsToNote,
  createNote,
  downvoteNote,
  getNoteById,
  getNotes,
  makeNoteFavorite,
  saveNote,
  updateNote,
  upvoteNote,
} from "../controllers/note";
import { uploadArrayToFirebase, uploadSingleToFirebase } from "../middleware/uploadFile";
import {
  addNotePermission,
  changeNotePermission,
  getNotePermissionsFromNote,
} from "../controllers/notePermission";
import { getUserNoteInteractionByNoteId } from "../controllers/noteInteraction";

const router = express.Router();

router
  .route("/")
  .post(
    auth,
    uploadSingleToFirebase({ fieldname: "thumbnailImage", uploadToFolder: "note" }),
    createNote
  )
  .get(optionalAuth, getNotes);

router.patch("/upvote/:noteId", auth, upvoteNote);
router.patch("/downvote/:noteId", auth, downvoteNote);
router.patch("/favorite/:noteId", auth, makeNoteFavorite);
router.patch("/save/:noteId", auth, saveNote);
router
  .route("/note-permissions/:noteId")
  .post(auth, addNotePermission)
  .get(getNotePermissionsFromNote)
  .patch(auth, changeNotePermission);

router.get("/note-interactions/:noteId", auth, getUserNoteInteractionByNoteId);

router.patch(
  "/attachments/:noteId",
  auth,
  uploadArrayToFirebase({ fieldname: "attachments", maxFileCount: 10, uploadToFolder: "note" }),
  addAttachmentsToNote
);

router
  .route("/:noteId")
  .get(optionalAuth, getNoteById)
  .patch(
    auth,
    uploadSingleToFirebase({ fieldname: "thumbnailImage", uploadToFolder: "note" }),
    updateNote
  );

export default router;
