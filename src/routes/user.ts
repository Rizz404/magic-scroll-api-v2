import express from "express";
import {
  changeUserRole,
  checkUserAvailability,
  followOrUnfollowUser,
  getUserById,
  getUserProfile,
  getUsers,
  searchUserByName,
  updateUser,
  updateUserProfile,
} from "../controllers/user";
import { auth } from "../middleware/auth";
import { uploadSingleToFirebase } from "../middleware/uploadFile";
import allowedRoles from "../middleware/allowedRoles";

const router = express.Router();

router.route("/").get(getUsers).patch(auth, updateUser);
router
  .route("/profile")
  .get(auth, getUserProfile)
  .patch(
    auth,
    uploadSingleToFirebase({ fieldname: "profileImage", uploadToFolder: "user" }),
    updateUserProfile
  );
router.post("/check-user-availability", checkUserAvailability);
router.patch("/follow/:userId", auth, followOrUnfollowUser);
router.get("/search", searchUserByName);
router.patch("/change-role", auth, allowedRoles("ADMIN"), changeUserRole);
router.route("/:userId").get(getUserById);

export default router;
