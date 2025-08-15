import express from "express";
import userRoutes from "./wallet.user.routes.js";
import { authMiddleware } from '../middleware/authMiddleware.js';
import adminRoutes from "./wallet.admin.routes.js";
import User from '../models/User.js';
const router = express.Router();

router.use("/wallet/user", userRoutes);
router.use("/wallet/admin", adminRoutes);
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    // Use correct field name 'wallet'
    const user = await User.findById(req.user.id).select('wallet');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ walletBalance: user.wallet || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
