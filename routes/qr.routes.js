import express from "express";
import { uploadQRCode, getQRCodes,getLatestQRCode, deleteQRCode } from "../controllers/qr.controller.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/create", upload.single("qrImage"), uploadQRCode);
router.get("/", getQRCodes);
router.get("/latest", getLatestQRCode);          // Latest QR
router.delete("/:id", deleteQRCode);             // Delete QR
export default router;
