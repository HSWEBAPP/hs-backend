import WalletRecharge from "../models/walletRecharge.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js"

// ------------------- RECHARGE HISTORY -------------------
export const getRechargeHistory = async (req, res) => {
  try {
    const recharges = await RechargeRequest.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.json({ history: recharges });
  } catch (error) {
    console.error("Admin recharge history error:", error); // log full error
    res.status(500).json({ message: error.message });
  }
};




// Approve recharge
export const approveRecharge = async (req, res) => {
  try {
    const { id } = req.params;

    const recharge = await WalletRecharge.findById(id);
    if (!recharge) return res.status(404).json({ message: "Recharge not found" });
    if (recharge.status !== "pending")
      return res.status(400).json({ message: "Request already processed" });

    // Update user wallet in users collection
    const user = await User.findById(recharge.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wallet += recharge.amount; // ✅ add recharge amount
    await user.save();

    recharge.status = "approved";
    await recharge.save();

    res.json({ 
      message: "Recharge approved successfully", 
      walletBalance: user.wallet // ✅ send updated balance
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Reject recharge
export const rejectRechargeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const recharge = await WalletRecharge.findById(id);
    if (!recharge) return res.status(404).json({ message: "Recharge not found" });

    recharge.status = "rejected";
    await recharge.save();

    res.json({ message: "Recharge rejected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------- TRANSACTION HISTORY -------------------
export const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find()
      .populate("user", "name email") // match your schema field
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------- TOOL USAGE (DEBIT) -------------------
export const listToolUsageTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ type: "debit" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching tool usage transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- MANUAL RECHARGE (OPTIONAL) -------------------
export const manualRecharge = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.walletBalance += amount;
    await user.save();

    const transaction = new WalletTransaction({
      user,
      type: "credit",
      amount,
      description: "Manual Credit by Admin"
    });
    await transaction.save();

    res.json({ success: true, message: "Manual recharge successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
