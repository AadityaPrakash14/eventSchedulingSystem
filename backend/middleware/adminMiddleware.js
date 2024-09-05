
const User = require('../models/User'); // Import the User model

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); // req.user should be populated by authMiddleware
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error: Admin check failed.' });
  }
};

module.exports = adminMiddleware;
