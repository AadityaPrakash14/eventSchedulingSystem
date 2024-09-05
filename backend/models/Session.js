const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  sessionType: {
    type: String,
    enum: ['one-on-one', 'multi-participant'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
