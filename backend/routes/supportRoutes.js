const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  createCallRequest,
  getAllCallRequests,
  updateCallRequestStatus,
} = require('../controllers/supportController');

router.post('/call-request', protect, createCallRequest);
router.get('/call-requests', protect, getAllCallRequests);
router.patch('/call-request/:userId', protect, updateCallRequestStatus);

module.exports = router;
