import express from "express";
import { auth } from "../middleware/auth";
import { createStudy, getStudies } from "../controllers/study";

const router = express.Router();

router.route("/").post(auth, createStudy).get(getStudies);
router.route("/:studyId");

export default router;
