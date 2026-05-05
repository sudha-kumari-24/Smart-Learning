const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const InterviewSession = require('../models/InterviewSession');
const { protect } = require('../middleware/authMiddleware');

console.log('protect middleware type:', typeof protect);

// ========== MULTER CONFIGURATION ==========
// Configure storage for interview videos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to backend/uploads/interviews
    const uploadDir = path.join(__dirname, '../uploads/interviews');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created directory:', uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${req.body.interviewType}_${req.body.userId}_${req.body.duration}min_${timestamp}.webm`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// ========== ROUTES ==========

// Test route
router.get('/test', protect, (req, res) => {
  res.json({
    message: 'Interview routes working!',
    user: req.user
  });
});

// Get all interview sessions for a user
router.get('/my-sessions', protect, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-videoPath');

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching interview sessions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get interview session by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    if (session.userId.toString() !== req.user.id &&
      session.recruiterId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching interview session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== VIDEO UPLOAD ENDPOINT ==========
router.post('/upload-video', protect, upload.single('video'), async (req, res) => {
  try {
    console.log('📹 Uploading video...');
    console.log('Request body:', req.body);
    console.log('File received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    // Save to database
    const session = new InterviewSession({
      userId: req.body.userId,
      interviewType: req.body.interviewType,
      duration: parseInt(req.body.duration),
      videoFilename: req.file.filename,
      videoPath: `/uploads/interviews/${req.file.filename}`,
      status: 'recorded'
    });

    await session.save();
    
    console.log('✅ Video saved to database');

    res.json({
      success: true,
      message: 'Video saved successfully',
      filename: req.file.filename,
      filePath: req.file.path,
      sessionId: session._id
    });
    
  } catch (error) {
    console.error('❌ Error uploading video:', error);
    res.status(500).json({ error: 'Server error uploading video' });
  }
});



// Save video metadata (legacy endpoint - for backward compatibility)
router.post('/save-video', protect, async (req, res) => {
  try {
    const { interviewType, duration, userId } = req.body;

    console.log('Saving video metadata:', { interviewType, duration, userId });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${interviewType}_${userId}_${duration}min_${timestamp}.webm`;
    const videoPath = `frontend/src/assets/users_interview/${filename}`;

    const session = new InterviewSession({
      userId: userId,
      interviewType: interviewType,
      duration: parseInt(duration),
      videoFilename: filename,
      videoPath: videoPath,
      status: 'recorded'
    });

    await session.save();

    res.json({
      success: true,
      message: 'Video metadata saved successfully',
      filename: filename,
      sessionId: session._id
    });
  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({ error: 'Server error saving video' });
  }
});

// Save interview session with keywords
router.post('/save', protect, async (req, res) => {
  try {
    const { interviewType, duration, videoFilename, keywordsMatched } = req.body;

    const calculateScore = (keywordsData) => {
      if (!keywordsData || keywordsData.length === 0) return 50;

      const totalMatched = keywordsData.reduce((sum, q) => sum + (q.matchedCount || 0), 0);
      const totalKeywords = keywordsData.reduce((sum, q) => sum + (q.totalKeywords || 1), 0);

      return Math.round((totalMatched / totalKeywords) * 100);
    };

    const overallScore = calculateScore(keywordsMatched);

    const session = new InterviewSession({
      userId: req.user.id,
      interviewType,
      duration,
      videoFilename,
      videoPath: `frontend/src/assets/users_interview/${videoFilename}`,
      keywordsMatched,
      overallScore,
      feedback: {
        clarity: Math.floor(Math.random() * 30) + 70,
        confidence: Math.floor(Math.random() * 30) + 70,
        keywordCoverage: overallScore,
        suggestions: [
          "Speak a bit slower for better clarity",
          "Try to structure your answers more",
          "Good eye contact maintained"
        ]
      }
    });

    await session.save();

    res.status(201).json({
      message: 'Interview session saved successfully',
      sessionId: session._id
    });
  } catch (error) {
    console.error('Error saving interview session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending interviews for recruiter
router.get('/recruiter/pending', protect, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      recruiterId: req.user.id,
      status: 'recorded'
    })
      .populate('userId', 'fullName email classCourse')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching pending interviews:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark interview as reviewed
router.put('/:id/review', protect, async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    if (session.recruiterId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    session.status = 'reviewed';
    session.reviewedBy = req.user.id;
    session.reviewedAt = new Date();

    await session.save();

    res.json({ message: 'Interview marked as reviewed' });
  } catch (error) {
    console.error('Error updating interview status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;