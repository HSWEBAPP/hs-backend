import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from "path"

// Routes
import authRoutes from './routes/auth.routes.js';
import walletRoutes from './routes/wallet.js';          // balance + shared wallet routes
import adminRoutes from './routes/admin.routes.js';
import qrCodeRoutes from "./routes/qr.routes.js";
import walletUserRoutes from "./routes/wallet.user.routes.js";
import walletAdminRoutes from "./routes/wallet.admin.routes.js";

dotenv.config()

const app = express()
app.use(express.json())

// ✅ CORS config

app.use(cors({
  origin: [
    "https://hs-frontend-two.vercel.app", 
    "http://localhost:5173"
  ],
 methods: ["GET", "POST", "PUT", "PATCH", "DELETE",  "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))


// ✅ Test route
app.get('/', (req, res) => {
  res.send('API is running...')
})

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);          // → /api/wallet/balance
app.use('/api/wallet/user', walletUserRoutes); // → /api/wallet/user/recharge/qr
app.use('/api/admin/wallet', walletAdminRoutes); // → /api/admin/wallet/...
app.use('/api/admin', adminRoutes);
app.use('/api/qrcode', qrCodeRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
