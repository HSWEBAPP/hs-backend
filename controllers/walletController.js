import User from '../models/User.js';

// 📊 Get wallet balance
export const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ walletBalance: user.wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get wallet balance" });
  }
};

// ⚡ Deduct ₹10 from wallet
export const deductWallet = async (req, res) => {
  try {
    const { feature } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wallet < 10) return res.status(400).json({ message: "Insufficient balance" });

    user.wallet -= 10;
    await user.save();

    res.json({ message: `₹10 deducted for ${feature}`, balance: user.wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to deduct wallet" });
  }
};

// 💰 Recharge wallet
export const rechargeWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wallet += amount;
    await user.save();

    res.json({ message: 'Wallet recharged', balance: user.wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Recharge failed' });
  }
};
