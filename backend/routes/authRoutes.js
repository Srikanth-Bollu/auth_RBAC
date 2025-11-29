// routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  getProfile,
  getAllUsers
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.get("/users", authenticate, authorizeRole("admin"), getAllUsers);

export default router;
