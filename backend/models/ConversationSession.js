const mongoose = require('mongoose');

const conversationSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scenario: {
    type: String,
    required: true,
    enum: ['restaurant', 'ambulance', 'friend', 'police']
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  responses: [{
    step: Number,
    userSpoken: String,
    expected: String,
    keywords: [String],
    matchedKeywords: [String],
    matchPercentage: Number,
    timestamp: Date
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    pronunciation: Number,
    confidence: Number,
    keywordUsage: Number,
    suggestions: [String]
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ConversationSession', conversationSessionSchema);