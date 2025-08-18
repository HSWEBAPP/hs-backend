import express from "express";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  getAllWallets,
  toggleUserStatus,
  updateUser 
} from "../controllers/admin.controller.js";
import { authMiddleware, adminAuth } from "../middleware/authMiddleware.js";


const router = express.Router();

// ✅ All admin routes require authentication & admin role
router.get("/users", authMiddleware, adminAuth, getAllUsers);
router.get("/users/:id", authMiddleware, adminAuth, getUserById);
router.delete("/users/:id", authMiddleware, adminAuth, deleteUser);
router.get("/wallets", authMiddleware, adminAuth, getAllWallets);
// Toggle user active/deactive
router.patch("/users/:id/toggle", authMiddleware, adminAuth, toggleUserStatus);
router.put("/users/:id", updateUser);
export default router;
