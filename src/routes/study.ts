import express from "express";
import { auth } from "../middleware/auth";
import { createStudy } from "../controllers/study";

const router = express.Router();

router.route("/").post(auth, createStudy);

export default router;
