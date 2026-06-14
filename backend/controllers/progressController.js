const StudySession = require('../models/StudySession');


exports.seedDummyData = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID required' });
  }

  const dummyData = [
    { date: '2025-12-18', minutesStudied: 30, sessionType: 'timer' },
    { date: '2025-12-19', minutesStudied: 45, sessionType: 'timer' },
    { date: '2025-12-20', minutesStudied: 60, sessionType: 'timer' },
    { date: '2025-12-21', minutesStudied: 90, sessionType: 'timer' },
    { date: '2025-12-22', minutesStudied: 80, sessionType: 'timer' },
    { date: '2025-12-23', minutesStudied: 120, sessionType: 'timer' },
    { date: '2025-12-24', minutesStudied: 100, sessionType: 'timer' }
  ];

  try {
    const ops = dummyData.map(item => ({
      updateOne: {
        filter: {
          user: userId,
          date: item.date,
          sessionType: item.sessionType
        },
        update: { $set: { minutesStudied: item.minutesStudied } },
        upsert: true
      }
    }));

    await StudySession.bulkWrite(ops);
    res.json({ message: 'Dummy data seeded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Seed failed' });
  }
};


exports.getDailyProgress = async (req, res) => {
  const { userId, days = 7 } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID required' });
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  const startDateStr = startDate.toISOString().split('T')[0];

  try {
    const result = await StudySession.aggregate([
      { $match: { user: userId, date: { $gte: startDateStr } } },
      { $group: { _id: '$date', minutesStudied: { $sum: '$minutesStudied' } } },
      { $sort: { _id: 1 } }
    ]);

    const dailyData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      const found = result.find(r => r._id === dateStr);
      dailyData.push({
        date: dateStr,
        minutesStudied: found?.minutesStudied || 0
      });
    }

    res.json(dailyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fetch failed' });
  }
};


exports.updateProgress = async (req, res) => {
  const { userId, seconds, sessionType = 'timer' } = req.body;

  if (!userId || !seconds || seconds <= 0) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  const minutes = Math.floor(seconds / 60);
  const today = new Date().toISOString().split('T')[0];

  console.log(`[PROGRESS] user=${userId} minutes=${minutes} date=${today} type=${sessionType}`);

  try {
    
    let session = await StudySession.findOne({
      user: userId,
      date: today,
      sessionType: sessionType
    });

    if (session) {
      session.minutesStudied += minutes;
      await session.save();
    } else {
      session = await StudySession.create({
        user: userId,
        date: today,
        sessionType: sessionType,
        minutesStudied: minutes
      });
    }

    
    const totalToday = await StudySession.aggregate([
      { $match: { user: userId, date: today } },
      { $group: { _id: null, total: { $sum: '$minutesStudied' } } }
    ]);

    res.json({ 
      minutesStudied: totalToday[0]?.total || minutes,
      sessionType 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
};