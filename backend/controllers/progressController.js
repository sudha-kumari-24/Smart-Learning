const DailyProgress = require('../models/DailyProgress');

// ---------- SEED DUMMY DATA ----------
exports.seedDummyData = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID required' });
  }

  const dummyData = [
    { date: '2025-12-18', minutesStudied: 30 },
    { date: '2025-12-19', minutesStudied: 45 },
    { date: '2025-12-20', minutesStudied: 60 },
    { date: '2025-12-21', minutesStudied: 90 },
    { date: '2025-12-22', minutesStudied: 80 },
    { date: '2025-12-23', minutesStudied: 120 },
    { date: '2025-12-24', minutesStudied: 100 }
  ];

  try {
    const ops = dummyData.map(item => ({
      updateOne: {
        filter: {
          user: userId,
          date: new Date(item.date),
          course: null
        },
        update: { $set: { minutesStudied: item.minutesStudied } },
        upsert: true
      }
    }));

    await DailyProgress.bulkWrite(ops);
    res.json({ message: 'Dummy data seeded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Seed failed' });
  }
};

// ---------- GET DAILY PROGRESS ----------
exports.getDailyProgress = async (req, res) => {
  const { userId, days = 7 } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID required' });
  }

  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  try {
    const data = await DailyProgress.find({
      user: userId,
      date: { $gte: start }
    }).sort('date');

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fetch failed' });
  }
};

// ---------- UPDATE PROGRESS ----------
exports.updateProgress = async (req, res) => {
  const { userId, seconds, courseId = null } = req.body;

  if (!userId || !seconds || seconds <= 0) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  const minutes = Math.floor(seconds / 60);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(
    `[PROGRESS] user=${userId} minutes=${minutes} date=${today.toDateString()}`
  );

  try {
    const progress = await DailyProgress.findOneAndUpdate(
      { user: userId, date: today, course: courseId },
      { $inc: { minutesStudied: minutes } },
      { upsert: true, new: true }
    );

    console.log('[DB UPDATED FOR USER]', userId);


    console.log('[DB UPDATED]', progress);
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
};
