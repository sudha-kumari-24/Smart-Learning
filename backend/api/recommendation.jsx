const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation');

router.get('/', recommendationController.getRecommendations);

module.exports = router;
