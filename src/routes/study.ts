import express from "express";
import { auth } from "../middleware/auth";
import {
  createStudy,
  getStudies,
  getStudyById,
  searchStudyByName,
  updateStudy,
} from "../controllers/study";
import allowedRoles from "../middleware/allowedRoles";
import { uploadSingleToFirebase } from "../middleware/uploadFile";

const router = express.Router();

router
  .route("/")
  .post(
    auth,
    allowedRoles("ADMIN"),
    uploadSingleToFirebase({ fieldname: "image", uploadToFolder: "study" }),
    createStudy
  )
  .get(getStudies);
router.get("/search", searchStudyByName);
router.route("/:studyId").get(getStudyById).patch(auth, allowedRoles("ADMIN"), updateStudy);

export default router;
