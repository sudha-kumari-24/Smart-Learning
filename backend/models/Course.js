const { Schema, model } = require('mongoose');

const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All'],
    default: 'Beginner', 
    unique: true
  },
  durationHours: {
    type: Number,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  thumbnailUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  enrolled: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: String,
    default: '0%'
  },
  certificate: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    default: 0
  },
  instructor: {
    type: String,
    default: 'Industry Expert'
  },
  language: {
    type: String,
    default: 'English'
  },
  prerequisites: [{
    type: String
  }],
  learningOutcomes: [{
    type: String
  }],
  totalLessons: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  videos: [
    {
      title: String,
      embedUrl: String,
      durationSec: Number
    }
  ],

  previewVideo: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});



module.exports = model('Course', courseSchema);