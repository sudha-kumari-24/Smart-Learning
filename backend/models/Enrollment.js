const { Schema, model, Types } = require('mongoose');

const enrollmentSchema = new Schema({
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

  progressPercent: {
    type: Number,
    default: 0
  },

  completed: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

// Prevent duplicate enrollment
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = model('Enrollment', enrollmentSchema);