const express = require('express');
const router = express.Router();

const {
  listCourses,
  getCourseDetail,
  enrollCourse,
  updateVideoProgress,
  checkEnrollment
} = require('../controllers/courseController');

// GET all courses
router.get('/', listCourses);

// GET course detail
router.get('/:id', getCourseDetail);

// ENROLL
router.post('/enroll', enrollCourse);

// UPDATE PROGRESS
router.post('/progress', updateVideoProgress);

// CHECK ENROLLMENT
router.post('/check-enrollment', checkEnrollment);

module.exports = router;