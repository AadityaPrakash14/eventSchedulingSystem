const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'unscheduled'],
    default: 'unscheduled', // By default, availability is unscheduled
  }
});

module.exports = mongoose.model('Availability', availabilitySchema);
