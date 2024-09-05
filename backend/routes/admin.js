const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability'); // Import the Availability model
const User = require('../models/User'); // Import the User model
const Session = require('../models/Session'); // Session model (create this for scheduling sessions)
const adminMiddleware = require('../middleware/adminMiddleware'); // Middleware to check if user is admin
const authMiddleware = require('../middleware/authMiddleware');

// Fetch availability of all users (Admin only)
router.get('/availability', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Fetch only unscheduled availabilities
    const availabilities = await Availability.find({ status: 'unscheduled' })
      .populate('userId', 'name email') // Populate user details (name, email) from the users collection
      .exec();

    res.json(availabilities); // Return availabilities with user info
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error });
  }
});

// Fetch all users (Admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, 'name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users.' });
  }
});

// Schedule a session
router.post('/schedule', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { day, availabilities, sessionType } = req.body;

    // Fetch user ids from availabilities and ensure they are unscheduled
    const availabilityRecords = await Availability.find({
      _id: { $in: availabilities },
      status: 'unscheduled',
    }).populate('userId'); // Populates user details

    if (availabilityRecords.length === 0) {
      return res.status(400).json({ message: 'No unscheduled availabilities found.' });
    }

    // Extract user IDs from availability records
    const userIds = availabilityRecords.map((availability) => availability.userId._id);

    if (sessionType === 'one-on-one' && userIds.length > 1) {
      return res.status(400).json({ message: 'Only one user can be selected for a one-on-one session.' });
    }

    // Create new session
    const newSession = new Session({
      day,
      users: userIds,
      sessionType,
    });

    // Save the session to the database
    await newSession.save();

    // Mark the selected availabilities as scheduled
    await Availability.updateMany(
      { _id: { $in: availabilities } },
      { $set: { status: 'scheduled' } }
    );

    res.status(201).json({ message: 'Session scheduled successfully!', session: newSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error scheduling session' });
  }
});

// Fetch scheduled sessions (Admin only)
router.get('/scheduled-sessions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Find all scheduled sessions and populate the user data
    const sessions = await Session.find({})
      .populate('users', 'name email')
      .exec();

    res.json(sessions); // Return scheduled sessions with user info
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scheduled sessions', error });
  }
});

// Unschedule (Delete) a session by ID
router.delete('/scheduled-sessions/:sessionId', authMiddleware, adminMiddleware, async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const session = await Session.findById(sessionId);

    if (!session) { 
      return res.status(404).json({ message: 'Session not found' });
    }

    // Mark availabilities associated with this session as unscheduled
    await Availability.updateMany(
      { _id: { $in: session.availabilities } },
      { $set: { status: 'unscheduled' } }
    );

    // Delete the session
    await Session.findByIdAndDelete(sessionId);
    
    res.status(200).json({ message: 'Session unscheduled successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unscheduling session' });
  }
});

module.exports = router;
