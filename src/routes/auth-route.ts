import express from "express";
import {
  login,
  loginWithOauth,
  logout,
  refresh,
  register,
} from "../controllers/auth-controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/oauth", loginWithOauth);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
