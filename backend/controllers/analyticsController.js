const mongoose = require('mongoose');
const StudySession = require('../models/StudySession');
const CourseProgress = require('../models/CourseProgress');

// Get all dashboard data in one API call
exports.getDashboardData = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // 1. Today's total minutes
    const todayResult = await StudySession.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), date: today } },
      { $group: { _id: null, total: { $sum: '$minutesStudied' } } }
    ]);
    const todayMinutes = todayResult[0]?.total || 0;

    // 2. Total study hours (all time)
    const totalResult = await StudySession.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$minutesStudied' } } }
    ]);
    const totalMinutes = totalResult[0]?.total || 0;
    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemainingMinutes = totalMinutes % 60;

    // 3. Study streak (consecutive days with study)
    const allSessions = await StudySession.find({ user: userId })
      .sort({ date: -1 })
      .select('date');
    
    let streak = 0;
    const uniqueDates = [...new Set(allSessions.map(s => s.date))];
    const checkDate = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // 4. Weekly study trend (last 7 days)
    const weeklyResult = await StudySession.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: sevenDaysAgoStr }
        } 
      },
      { 
        $group: { 
          _id: '$date', 
          minutes: { $sum: '$minutesStudied' } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Fill missing dates with 0
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const found = weeklyResult.find(w => w._id === dateStr);
      weeklyData.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: found?.minutes || 0
      });
    }

    // 5. Study by session type (for pie chart)
    const typeResult = await StudySession.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$sessionType', total: { $sum: '$minutesStudied' } } }
    ]);
    
    const studyByType = {
      timer: 0,
      posture: 0,
      stress_relief: 0
    };
    typeResult.forEach(t => {
      if (studyByType.hasOwnProperty(t._id)) {
        studyByType[t._id] = t.total;
      }
    });

    // 6. Courses completed
    const completedCourses = await CourseProgress.countDocuments({
      user: userId,
      completed: true
    });

    // 7. Daily goal (default 120 minutes)
    const dailyGoal = 120;
    const percentComplete = Math.min((todayMinutes / dailyGoal) * 100, 100);

    res.json({
      success: true,
      todayMinutes,
      totalHours,
      totalRemainingMinutes,
      streak,
      weeklyData,
      studyByType,
      completedCourses,
      dailyGoal,
      percentComplete
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get daily progress for chart (kept for compatibility)
exports.getDailyProgress = async (req, res) => {
  try {
    const { userId, days = 7 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    const startDateStr = startDate.toISOString().split('T')[0];

    const result = await StudySession.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDateStr }
        } 
      },
      { 
        $group: { 
          _id: '$date', 
          minutesStudied: { $sum: '$minutesStudied' } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing dates
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
  } catch (error) {
    console.error('Daily progress error:', error);
    res.status(500).json({ error: error.message });
  }
};