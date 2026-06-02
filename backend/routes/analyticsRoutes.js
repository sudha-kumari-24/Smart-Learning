const express = require('express');
const router = express.Router();

const {
  getDashboardData,
  getDailyProgress
} = require('../controllers/analyticsController');

const {
  getDailyProgress: getProgressDaily,
  updateProgress,
  seedDummyData
} = require('../controllers/progressController');

// NEW: One API call for all dashboard data
router.get('/dashboard', getDashboardData);

// Existing endpoints (kept for compatibility)
router.get('/daily', getDailyProgress);
router.post('/update', updateProgress);
router.post('/seed', seedDummyData);

module.exports = router;