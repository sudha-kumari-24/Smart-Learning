const express = require('express');
const router = express.Router();
const {
  listCourses,
  getCourseDetail,
  enrollCourse,
  updateVideoProgress,
  checkEnrollment
} = require('../controllers/courseController');

router.get('/', listCourses);
router.get('/:id', getCourseDetail);
router.post('/enroll', enrollCourse);
router.post('/progress', updateVideoProgress);
router.post('/check-enrollment', checkEnrollment);

module.exports = router;