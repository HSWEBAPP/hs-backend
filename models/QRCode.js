// models/QRCode.js
import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  gst: { type: Number, default: 18 },
  totalAmount: { type: Number, required: true },
  imageUrl: { type: String, required: true }, // path or S3 URL
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("QRCode", qrCodeSchema);
