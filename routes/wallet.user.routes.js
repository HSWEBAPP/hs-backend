import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { submitQRRecharge,getQRRechargeHistory ,getUserTransactions } from "../controllers/wallet.user.controller.js";
import { deductToolUsage } from "../controllers/wallet.user.controller.js";

const router = express.Router();

router.post("/user/recharge/qr", authMiddleware, submitQRRecharge);
router.get("/recharge/history", authMiddleware, getQRRechargeHistory);
router.post("/deduct-tool-usage", authMiddleware, deductToolUsage);
router.get("/transactions", authMiddleware, getUserTransactions);


export default router;
