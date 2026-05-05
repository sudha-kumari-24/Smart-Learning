const DailyProgress = require('../models/DailyProgress');
const Progress = require('../models/Progress');

/**
 * POST /api/analytics/daily
 * Log or update today's study minutes
 */
exports.logDailyProgress = async (req, res, next) => {
  try {
    const { userId, minutesStudied, courseId } = req.body;

    if (!userId || minutesStudied == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await DailyProgress.findOneAndUpdate(
      { user: userId, date: today, course: courseId || null },
      { $inc: { minutesStudied } },
      { upsert: true, new: true }
    );

    res.json(entry);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/daily?userId=...&days=7
 */
exports.getDailyProgress = async (req, res, next) => {
  try {
    const { userId, days = 7 } = req.query;

    const from = new Date();
    from.setDate(from.getDate() - Number(days));

    const data = await DailyProgress.find({
      user: userId,
      date: { $gte: from },
    }).sort({ date: 1 });

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/pie/course-time?userId=...
 */
exports.getCourseTimePie = async (req, res, next) => {
  try {
    const { userId } = req.query;

    const data = await DailyProgress.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$course',
          totalMinutes: { $sum: '$minutesStudied' },
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    next(err);
  }
};
