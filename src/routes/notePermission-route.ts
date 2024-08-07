import express from "express";
import { auth } from "../middleware/auth";
import {
  addNotePermission,
  changeNotePermission,
  deleteNotePermission,
  getNotePermissionsFromNote,
} from "../controllers/notePermission-controller";

const router = express.Router();

router
  .route("/note/:noteId")
  .get(auth, getNotePermissionsFromNote)
  .post(auth, addNotePermission)
  .patch(auth, changeNotePermission)
  .delete(auth, deleteNotePermission);

export default router;
