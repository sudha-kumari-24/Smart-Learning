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


router.get('/dashboard', getDashboardData);


router.get('/daily', getDailyProgress);
router.post('/update', updateProgress);
router.post('/seed', seedDummyData);

module.exports = router;