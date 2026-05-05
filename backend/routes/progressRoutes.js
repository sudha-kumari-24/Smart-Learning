const express = require('express');
const router = express.Router();
const { seedDummyData, getDailyProgress, updateProgress } = require('../controllers/progressController');

router.post('/seed', seedDummyData);
router.get('/daily', getDailyProgress);
router.post('/update', updateProgress);

module.exports = router;
