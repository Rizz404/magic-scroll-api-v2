import express from "express";
import { auth, optionalAuth } from "../middleware/auth";
import {
  addAttachmentsToNote,
  createNote,
  deleteMultipleAttachmentsInNote,
  downvoteNote,
  getNoteById,
  getNotes,
  getNotesByStudyName,
  getNotesByTagName,
  getNotesByUserId,
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
import { getNoteInteractionCounter } from "../controllers/noteInteractionCounter";

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
router.get("/note-interaction/counter/:noteId", getNoteInteractionCounter);
router.get("/note-interaction/:noteId", auth, getUserNoteInteractionByNoteId);

router.get("/user/:userId", optionalAuth, getNotesByUserId);
router.get("/study/:studyName", optionalAuth, getNotesByStudyName);
router.get("/tag/:tagName", optionalAuth, getNotesByTagName);

router
  .route("/attachments/:noteId")
  .post(
    auth,
    uploadArrayToFirebase({ fieldname: "attachments", maxFileCount: 10, uploadToFolder: "note" }),
    addAttachmentsToNote
  )
  .patch(auth, deleteMultipleAttachmentsInNote);

router
  .route("/:noteId")
  .get(optionalAuth, getNoteById)
  .patch(
    auth,
    uploadSingleToFirebase({ fieldname: "thumbnailImage", uploadToFolder: "note" }),
    updateNote
  );

export default router;
