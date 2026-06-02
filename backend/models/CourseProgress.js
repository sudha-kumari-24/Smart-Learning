const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  progressPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastVideoIndex: {
    type: Number,
    default: 0
  },
  watchedVideos: {
    type: [Number],
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate enrollments
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);