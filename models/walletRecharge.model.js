import mongoose from "mongoose";

const walletRechargeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ ref is important
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true }, // QR, etc
    transactionId: { type: String, required: true },
    appUsed: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("WalletRecharge", walletRechargeSchema);
