import RechargeRequest from "../models/RechargeRequest.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import WalletRecharge from "../models/walletRecharge.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
// Create recharge request (when user uploads QR payment proof)
export const createRechargeRequest = async (req, res) => {
  try {
    const { qrId, transactionId, appUsed } = req.body;

    if (!qrId || !transactionId || !appUsed) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const recharge = new RechargeRequest({
      user: req.user.id,
      qrId,
      transactionId,
      appUsed,
      status: "pending",
    });

    await recharge.save();

    res.status(201).json({ message: "Recharge request submitted", recharge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List my recharge requests
export const getMyRechargeRequests = async (req, res) => {
  try {
    const recharges = await RechargeRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(recharges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List my wallet transactions
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const submitQRRecharge = async (req, res) => {
  try {
    const { amount, transactionId, appUsed } = req.body;

    const recharge = await WalletRecharge.create({
      user: req.user._id,
      amount,
      transactionId,
      appUsed,
       paymentMethod: "QR"
    });

    res.json({ message: "Recharge request submitted", recharge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch logged-in user recharge history
export const getQRRechargeHistory = async (req, res) => {
  try {
    const history = await WalletRecharge.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deduct amount when user uses a tool
export const deductToolUsage = async (req, res) => {
  try {
    const deductionAmount = 10; // You can make this dynamic later
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.walletBalance < deductionAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct from wallet
    user.walletBalance -= deductionAmount;
    await user.save();

    // Log transaction
    await WalletTransaction.create({
      user: req.user._id,
      type: "debit",
      amount: deductionAmount,
      description: "Used tool: ID Card Printing",
    });

    res.json({
      message: "Amount deducted successfully",
      balance: user.walletBalance,
    });
  } catch (error) {
    console.error("Error deducting tool usage:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get transaction history for logged-in user
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
