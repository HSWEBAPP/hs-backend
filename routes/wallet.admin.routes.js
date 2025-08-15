import express from "express";
import {
  getRechargeHistory,
  approveRecharge,
  rejectRechargeRequest,
  getTransactionHistory,
  listToolUsageTransactions,
  manualRecharge
} from "../controllers/wallet.admin.controller.js";

import { authMiddleware, adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------- RECHARGE HISTORY -------------------
// Get all QR recharge requests
router.get("/recharges", authMiddleware, adminAuth, getRechargeHistory);

// Approve a recharge request
router.put("/recharges/:id/approve", authMiddleware, adminAuth, approveRecharge);

// Reject a recharge request
router.put("/recharges/:id/reject", authMiddleware, adminAuth, rejectRechargeRequest);

// ------------------- TRANSACTION HISTORY -------------------
// Get all transactions (credits + debits)
router.get("/transactions", authMiddleware, adminAuth, getTransactionHistory);

// ------------------- TOOL USAGE -------------------
// Get only debit transactions (tool usage)
router.get("/tool-usage", authMiddleware, adminAuth, listToolUsageTransactions);

// ------------------- MANUAL CREDIT (Optional) -------------------
router.post("/manual-credit", authMiddleware, adminAuth, manualRecharge);

export default router;
