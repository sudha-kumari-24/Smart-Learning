const { Schema, model, Types } = require('mongoose');

const studySessionSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionType: {
    type: String,
    enum: ['timer', 'posture', 'stress_relief'],
    default: 'timer'
  },
  minutesStudied: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Indexes for faster queries

studySessionSchema.index({ user: 1, date: -1 });
studySessionSchema.index({ user: 1, sessionType: 1 });

module.exports = model('StudySession', studySessionSchema);