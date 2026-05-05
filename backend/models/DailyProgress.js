const { Schema, model, Types } = require('mongoose');

const dailyProgressSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Types.ObjectId,
    ref: 'Course',
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  minutesStudied: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

// prevent duplicate per day
dailyProgressSchema.index(
  { user: 1, course: 1, date: 1 },
  { unique: true }
);

module.exports = model('DailyProgress', dailyProgressSchema);