const Course = require('../models/Course');

// ✅ GET ALL COURSES
exports.listCourses = async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
};

exports.getCourseDetail = async (req, res) => {
  try {
    console.log("Fetching course:", req.params.id);

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const Progress = require('../models/Progress');

exports.enrollCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const existing = await Progress.findOne({
      user: userId,
      course: courseId
    });

    if (existing) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    const progress = await Progress.create({
      user: userId,
      course: courseId,
      progressPercent: 0,
      watchedVideos: []
    });

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Enroll failed' });
  }
};


exports.updateVideoProgress = async (req, res) => {
  try {
    const { userId, courseId, videoIndex } = req.body;

    let progress = await Progress.findOne({
      user: userId,
      course: courseId
    });

    // ✅ create only if not exists
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        watchedVideos: [],
        progressPercent: 0
      });
    }

    // ✅ avoid duplicate count
    if (!progress.watchedVideos.includes(videoIndex)) {
      progress.watchedVideos.push(videoIndex);
    }

    const course = await Course.findById(courseId);

    const percent =
      (progress.watchedVideos.length / course.videos.length) * 100;

    progress.progressPercent = Math.round(percent);
    progress.completed = percent === 100;

    await progress.save();

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Progress update failed' });
  }
};

exports.checkEnrollment = async (req, res) => {
  const { userId, courseId } = req.body;

  const progress = await Progress.findOne({
    user: userId,
    course: courseId
  });

  if (!progress) {
    return res.json({ enrolled: false });
  }

  res.json({
    enrolled: true,
    progress: progress.progressPercent
  });
};





