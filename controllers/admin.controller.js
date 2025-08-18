import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

// 📌 Get all users
export const getAllUsers = async (req, res) => {
  try {
    // fetch all fields, exclude only password & otp
    const users = await User.find({}, { password: 0, otp: 0, "forgotPassword.otp": 0 });

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// 📌 Get single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// 📌 Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Also delete wallet
    await Wallet.findOneAndDelete({ userId: user._id });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// 📌 Get all wallets
export const getAllWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find().populate('userId', 'name email mobile');
    res.json(wallets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch wallets' });
  }
};

// 📌 Toggle user active/deactive
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive; // Toggle
    await user.save();

    res.json({
      message: `User has been ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};


// 📌 Update user (Admin Side)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Allowed fields for update (to prevent accidental overwrite of sensitive data)
    const allowedUpdates = [
      "name",
      "email",
      "mobile",
      "taluka",
      "district",
      "state",
      "shopName",
      "aadhaar",
      "role",
      "isActive"
    ];

    const updates = {};
    for (let key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true, // return updated doc
      runValidators: true, // validate before saving
      select: "-password -otp -otpExpires"
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
};
