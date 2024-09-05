const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body; 
  
    try {
      // Check if the user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user with the specified role
      user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'user', // Default to 'user' if no role is provided
      });
  
      await user.save();
  
      // Create and send JWT token
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Return token and role to the client
      res.json({ token, role: user.role });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password validity
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and send JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
