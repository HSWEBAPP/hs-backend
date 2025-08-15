import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // extract Bearer token
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify JWT
    const user = await User.findById(decoded.id); // get user from DB

    if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });

    // ✅ Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Contact admin." });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

//  Admin Only Middleware
export const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
