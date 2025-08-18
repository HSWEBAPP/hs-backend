import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js';
import mongoose from 'mongoose'
import walletRoutes from './routes/wallet.js';
import adminRoutes from './routes/admin.routes.js';
import qrCodeRoutes from "./routes/qr.routes.js";

import walletUserRoutes from "./routes/wallet.user.routes.js";
import walletAdminRoutes from "./routes/wallet.admin.routes.js";

import path from "path";


dotenv.config()

const app = express()

app.use(express.json())

app.use(cors({
  origin: "https://hs-frontend-two.vercel.app/", // or your frontend URL
  credentials: true,
}));
// Test route
app.get('/', (req, res) => {
  res.send('API is running...')
})

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/qrcode", qrCodeRoutes);
app.use("/api/wallet", walletUserRoutes);
app.use("/api/admin/wallet", walletAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
