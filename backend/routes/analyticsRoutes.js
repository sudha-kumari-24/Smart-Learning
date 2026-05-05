const express = require('express');
const router = express.Router();

const {
  getDailyProgress,
  updateProgress,
  seedDummyData
} = require('../controllers/progressController');

// GET analytics
router.get('/daily', getDailyProgress);

// POST update progress
router.post('/update', updateProgress);

// POST seed dummy
router.post('/seed', seedDummyData);

module.exports = router;
