import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { submitQRRecharge ,getUserTransactions, getMyRechargeRequests } from "../controllers/wallet.user.controller.js";
import { deductToolUsage } from "../controllers/wallet.user.controller.js";

const router = express.Router();

router.post("/user/recharge/qr", authMiddleware, submitQRRecharge);
router.get("/recharge/history", authMiddleware, getMyRechargeRequests);
router.post("/deduct-tool-usage", authMiddleware, deductToolUsage);
router.get("/transactions", authMiddleware, getUserTransactions);


export default router;
