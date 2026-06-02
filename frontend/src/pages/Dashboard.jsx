import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
} from 'recharts';

function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colors for pie charts
  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];

  useEffect(() => {
    if (!user?.id) return;

    // Fetch all dashboard data in one API call
    fetch(`http://localhost:5000/api/analytics/dashboard?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDashboardData(data);
        }
      })
      .catch(err => console.error('Dashboard fetch error:', err));

    // Fetch daily data for charts
    fetch(`http://localhost:5000/api/analytics/daily?userId=${user.id}&days=7`)
      .then(res => res.json())
      .then(data => {
        setDailyData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Daily data fetch error:', err);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <p>Please login</p>;
  if (loading) return <p>Loading dashboard...</p>;

  const chartData = dailyData.map((item, index) => ({
    day: item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) : `Day ${index + 1}`,
    minutes: item.minutesStudied || 0,
  }));

  // Prepare data for study by type pie chart
  const studyByTypeData = dashboardData?.studyByType ? [
    { name: 'Timer', value: dashboardData.studyByType.timer || 0 },
    { name: 'Posture', value: dashboardData.studyByType.posture || 0 },
    { name: 'Stress Relief', value: dashboardData.studyByType.stress_relief || 0 }
  ] : [];

  // Daily goal from dashboard data or default
  const dailyGoal = dashboardData?.dailyGoal || 120;
  const todayMinutes = dashboardData?.todayMinutes || 0;
  const percentComplete = dashboardData?.percentComplete || 0;

  return (
    <div style={{ padding: '20px' }}>
      {/* Today's Progress Bar */}
      <h3>Today's Progress</h3>
      <div style={{ background: '#eee', height: 12, borderRadius: 6 }}>
        <div
          style={{
            width: `${percentComplete}%`,
            height: '100%',
            background: '#4CAF50',
            borderRadius: 6,
            transition: 'width 0.5s ease'
          }}
        />
      </div>
      <p>{todayMinutes} / {dailyGoal} minutes</p>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '30px 0' }}>
        {/* Streak Card */}
        <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '20px', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '36px' }}>🔥</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{dashboardData?.streak || 0}</div>
          <div>Day Streak</div>
        </div>

        {/* Total Hours Card */}
        <div style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', padding: '20px', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '36px' }}>⭐</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {dashboardData?.totalHours || 0}h {dashboardData?.totalRemainingMinutes || 0}m
          </div>
          <div>Total Study Time</div>
        </div>

        {/* Courses Completed Card */}
        <div style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)', padding: '20px', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '36px' }}>🎓</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{dashboardData?.completedCourses || 0}</div>
          <div>Courses Completed</div>
        </div>
      </div>

      {/* Study by Activity Type - Pie Chart */}
      {studyByTypeData.length > 0 && studyByTypeData.some(d => d.value > 0) && (
        <>
          <hr style={{ margin: '30px 0' }} />
          <h3>Study by Activity Type</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={studyByTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {studyByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Daily Study Trend - Line Chart */}
      {chartData.length > 0 && (
        <>
          <hr style={{ margin: '30px 0' }} />
          <h3>Daily Study Trend</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Weekly Study Distribution - Bar Chart */}
      {chartData.length > 0 && (
        <>
          <hr style={{ margin: '30px 0' }} />
          <h3>Weekly Study Distribution</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutes" fill="#2196F3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Goal Completion - Pie Chart */}
      <hr style={{ margin: '30px 0' }} />
      <h3>Goal Completion</h3>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={[
                { name: 'Completed', value: todayMinutes },
                { name: 'Remaining', value: Math.max(dailyGoal - todayMinutes, 0) },
              ]}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              <Cell fill="#4CAF50" />
              <Cell fill="#E0E0E0" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;