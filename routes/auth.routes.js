import express from 'express';
import { registerUser, loginUser, resetPassword, sendOtp, verifyOtp, adminLogin, sendForgotPasswordOtp, verifyForgotPasswordOtp } from '../controllers/auth.controller.js';
import { authMiddleware, adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/admin/login', adminLogin);
router.get('/admin/dashboard', authMiddleware, adminAuth, (req, res) => {
  res.json({ message: 'Welcome to Admin Dashboard' });
});

router.post('/send-otp', sendOtp);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password/send-otp', sendForgotPasswordOtp);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOtp);

export default router;
