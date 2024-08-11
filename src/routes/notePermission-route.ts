import express from "express";
import { auth } from "../middleware/auth";
import {
  upsertNotePermission,
  deleteNotePermission,
  getNotePermissionsFromNote,
} from "../controllers/notePermission-controller";

const router = express.Router();

router
  .route("/note/:noteId")
  .get(auth, getNotePermissionsFromNote)
  .patch(auth, upsertNotePermission)
  .delete(auth, deleteNotePermission);

export default router;
