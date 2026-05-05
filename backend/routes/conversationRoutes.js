const express = require('express');
const router = express.Router();
const ConversationSession = require('../models/ConversationSession');
const { protect } = require('../middleware/authMiddleware');

// Save conversation session
router.post('/save', protect, async (req, res) => {
  try {
    const { scenario, duration, responses } = req.body;
    
    // Calculate overall score
    const calculateScore = (responsesData) => {
      if (!responsesData || responsesData.length === 0) return 50;
      
      const totalMatch = responsesData.reduce((sum, r) => sum + (r.matchPercentage || 0), 0);
      return Math.round(totalMatch / responsesData.length);
    };
    
    const overallScore = calculateScore(responses);
    
    const session = new ConversationSession({
      userId: req.user.id,
      scenario,
      duration,
      responses,
      overallScore,
      feedback: {
        pronunciation: Math.floor(Math.random() * 30) + 70,
        confidence: Math.floor(Math.random() * 30) + 70,
        keywordUsage: overallScore,
        suggestions: [
          "Speak a bit more confidently",
          "Try to pause less between words",
          "Good use of vocabulary"
        ]
      }
    });
    
    await session.save();
    
    res.status(201).json({ 
      message: 'Conversation session saved successfully',
      sessionId: session._id,
      score: overallScore
    });
  } catch (error) {
    console.error('Error saving conversation session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's conversation history
router.get('/history', protect, async (req, res) => {
  try {
    const sessions = await ConversationSession.find({ userId: req.user.id })
      .sort({ completedAt: -1 })
      .select('scenario duration overallScore completedAt')
      .limit(10);
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific session
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await ConversationSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Conversation session not found' });
    }
    
    if (session.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching conversation session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;