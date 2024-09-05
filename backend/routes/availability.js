const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability'); // Your Availability model
const authMiddleware = require('../middleware/authMiddleware'); // Your auth middleware

// Get availability for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const availability = await Availability.find({ userId: req.user.id });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability' });
  }
});

// Add new availability for the logged-in user
router.post('/', authMiddleware, async (req, res) => {
  const { day, startTime, endTime } = req.body;

  if (!day || !startTime || !endTime) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newAvailability = new Availability({
      userId: req.user.id,
      day,
      startTime,
      endTime,
    });
    const savedAvailability = await newAvailability.save();
    res.json(savedAvailability);
  } catch (error) {
    res.status(500).json({ message: 'Error saving availability' });
  }
});

// Delete availability by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);
    console.log(availability);    
    if (!availability || availability.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Availability not found or unauthorized' });
    }
    await Availability.deleteOne({ _id: req.params.id });
    res.json({ message: 'Availability removed' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error deleting availability' });
  }
});

module.exports = router;
