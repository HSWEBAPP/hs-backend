// controllers/qrCode.controller.js
import QRCode from "../models/QRCode.js";

export const uploadQRCode = async (req, res) => {
  try {
    const { amount, gst } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!amount || !imageUrl) {
      return res.status(400).json({ message: "Amount and QR image are required" });
    }

    const gstValue = gst || 18;
    const totalAmount = parseFloat(amount) + (amount * gstValue / 100);

    const newQR = new QRCode({ amount, gst: gstValue, totalAmount, imageUrl });
    await newQR.save();

    res.status(201).json({ message: "QR Code uploaded successfully", qrCode: newQR });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading QR Code" });
  }
};


export const getQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find();
    res.json(qrCodes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching QR Codes" });
  }
};


// Get the latest QR code
export const getLatestQRCode = async (req, res) => {
  try {
    const latestQR = await QRCode.findOne().sort({ createdAt: -1 });
    if (!latestQR) {
      return res.status(404).json({ message: "No QR codes found" });
    }
    res.json(latestQR);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching latest QR code" });
  }
};

// Delete a QR code by ID
export const deleteQRCode = async (req, res) => {
  const { id } = req.params;
  try {
    const qr = await QRCode.findById(id);
    if (!qr) return res.status(404).json({ message: "QR code not found" });

    await qr.remove();
    res.json({ message: "QR code deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting QR code" });
  }
};