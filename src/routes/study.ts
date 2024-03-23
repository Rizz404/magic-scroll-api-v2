import express from "express";
import { auth } from "../middleware/auth";
import { createStudy, getStudies, getStudyById, updateStudy } from "../controllers/study";
import allowedRoles from "../middleware/allowedRoles";
import uploadTofirebase from "../middleware/uploadFile";

const router = express.Router();

router
  .route("/")
  .post(auth, allowedRoles("ADMIN"), uploadTofirebase({ fieldname: "image" }), createStudy)
  .get(getStudies);
router.route("/:studyId").get(getStudyById).patch(auth, allowedRoles("ADMIN"), updateStudy);

export default router;
