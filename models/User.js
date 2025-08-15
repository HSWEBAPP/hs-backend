import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  mobile: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  taluka: String,
  district: String,
  state: String,
  shopName: String,
  aadhaar: String,
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  wallet: { type: Number, default: 0 },
  isOtpVerified: { type: Boolean, default: false }, // for registration
  otp: String, // registration OTP
  otpExpires: Date,
  forgotPassword: {
    otp: String,
    expiresAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
