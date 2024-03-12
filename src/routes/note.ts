import express from "express";
import { auth } from "../middleware/auth";
import { createNote } from "../controllers/note";

const router = express.Router();

router.route("/").post(auth, createNote);

export default router;
