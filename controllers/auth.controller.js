import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import nodemailer from 'nodemailer';
import { sendOtpMail } from '../utils/mail.js';
import WalletTransaction from '../models/walletTransaction.model.js';
import Wallet from '../models/Wallet.js';
dotenv.config()
// REGISTER
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      taluka,
      district,
      state,
      shopName,
      aadhaar,
    } = req.body;

    // Check if user already exists by email or mobile
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      let message = "User already exists";

      if (existingUser.email === email) {
        message = "Email already registered";
      } else if (existingUser.mobile === mobile) {
        message = "Mobile number already registered";
      }

      return res.status(400).json({ message });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      taluka,
      district,
      state,
      shopName,
      aadhaar,
      otp,
      otpExpires,
      isOtpVerified: false,
      wallet: 0, // give ₹0 initial balance
    });

    await newUser.save();

    // Send OTP email
    await sendOtpMail(email, otp);

    res.status(201).json({
      message: "User registered successfully. OTP sent to email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ADMIN LOGIN
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, message: 'Admin login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};




// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // ✅ Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      message: 'Login successful',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const otpStore = {}; // In-memory storage for demo/testing purpose. Use DB or Redis for production.
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // ✅ Check if user exists with the provided email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // ✅ Send OTP Email
    await sendOtpMail(email, otp);

    // ✅ Store OTP temporarily with expiry (10 min)
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};



// Nodemailer transporter (Brevo)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// ✅ Send Forgot Password OTP
export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP in forgotPassword field
    user.forgotPassword = { otp, expiresAt };
    await user.save();

    // Send OTP email
    await transporter.sendMail({
      from: `"HubStar Support" <support@hubstar.in>`,
      to: email,
      subject: 'Your Forgot Password OTP',
      html: `
        <div style="font-family:sans-serif">
          <h2>Forgot Password</h2>
          <p>Your OTP code is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// ✅ Verify Forgot Password OTP
export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.forgotPassword || user.forgotPassword.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (new Date() > user.forgotPassword.expiresAt)
      return res.status(400).json({ message: 'OTP expired' });

    // OTP valid, allow reset
    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ message: 'Email and new password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);

    // Clear forgotPassword field after successful reset
    user.forgotPassword = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, context } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Registration OTP verification
    if (context === "register") {
      if (user.isOtpVerified)
        return res.status(400).json({ message: 'OTP already verified' });

      if (user.otp !== otp || Date.now() > user.otpExpires)
        return res.status(400).json({ message: 'Invalid or expired OTP' });

      // ✅ Mark verified and add ₹50 bonus
      user.isOtpVerified = true;
      user.wallet += 50;

      user.otp = null;
      user.otpExpires = null;
      await user.save();

      // Generate JWT
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        message: 'OTP verified successfully. ₹50 bonus added!',
        walletBalance: user.wallet,
        token,
      });
    }

    // Other OTP contexts (like forgot password) can be added here
    res.status(400).json({ message: 'Invalid context' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};





// RESET PASSWORD
