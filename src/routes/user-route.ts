import express from "express";
import {
  changeUserRole,
  // checkUserAvailability,
  followOrUnfollowUser,
  getUserById,
  getUserProfile,
  getUsers,
  searchUserByName,
  updateUserById,
  updateUserProfile,
  changePassword,
  deleteUser,
  getFollowings,
  getFollowers,
} from "../controllers/user-controller";
import { auth } from "../middleware/auth";
import { uploadSingleToFirebase } from "../middleware/uploadFile";
import allowedRoles from "../middleware/allowedRoles";

const router = express.Router();

router.route("/").get(getUsers).patch(auth, updateUserById);
router
  .route("/profile")
  .get(auth, getUserProfile)
  .patch(
    auth,
    uploadSingleToFirebase({
      fieldname: "profileImage",
      uploadToFolder: "user",
    }),
    updateUserProfile
  );
// router.post("/check-user-availability", checkUserAvailability);
router.patch("/follow/:userId", auth, followOrUnfollowUser);
router.get("/search", searchUserByName);
router.get("/followings", auth, getFollowings);
router.get("/followers", auth, getFollowers);
router.patch(
  "/change-role/:userId",
  auth,
  allowedRoles("ADMIN"),
  changeUserRole
);
router.patch("/change-password", auth, changePassword);
router.route("/:userId").get(getUserById).delete(auth, deleteUser);

export default router;
