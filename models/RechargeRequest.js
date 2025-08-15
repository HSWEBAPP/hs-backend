import mongoose from "mongoose";

const RechargeRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String },               // optional snapshot of user name
  qrCodeId: { type: mongoose.Schema.Types.ObjectId, ref: "QRCode", default: null },
  amount: { type: Number, required: true }, // base amount (without gst) or amount used
  totalAmount: { type: Number, required: true }, // final total (with gst if applied)
  paymentApp: { type: String, required: true }, // GPay, PhonePe, Paytm...
  transactionId: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  adminNote: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

RechargeRequestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("RechargeRequest", RechargeRequestSchema);
