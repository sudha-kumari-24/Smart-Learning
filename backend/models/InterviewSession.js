const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  interviewType: {
    type: String,
    required: true,
    enum: ['software', 'data-science', 'product', 'business', 'hr', 'general']
  },
  duration: {
    type: Number,
    required: true
  },
  videoFilename: {
    type: String,
    required: true
  },
  videoPath: {
    type: String,
    required: true
  },
  keywordsMatched: [{
    questionId: Number,
    keywords: [String],
    matchedCount: Number,
    totalKeywords: Number
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    clarity: Number,
    confidence: Number,
    keywordCoverage: Number,
    suggestions: [String]
  },
  status: {
    type: String,
    enum: ['recorded', 'reviewed', 'archived'],
    default: 'recorded'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);