const Course = require('../models/Course');
const User = require('../models/User');

exports.getRecommendations = async (req, res) => {
  const { userId } = req.query;

  const user = await User.findById(userId);

  if (!user || user.preferences.focusAreas.length === 0) {
    const trending = await Course.find().sort({ enrolled: -1 }).limit(5);
    return res.json(trending);
  }

  const courses = await Course.find({
    tags: { $in: user.preferences.focusAreas }
  }).limit(5);

  res.json(courses);
};