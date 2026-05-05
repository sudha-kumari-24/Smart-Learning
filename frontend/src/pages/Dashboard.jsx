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
  const auth = useAuth();              // SAFE access
  const user = auth?.user || null;     // prevent null crash

  const [dailyData, setDailyData] = useState([]);


  const dummyData = [
    { date: "2025-12-18", minutesStudied: 30 },
    { date: "2025-12-19", minutesStudied: 45 },
    { date: "2025-12-20", minutesStudied: 60 },
    { date: "2025-12-21", minutesStudied: 90 },
    { date: "2025-12-22", minutesStudied: 80 },
    { date: "2025-12-23", minutesStudied: 120 },
    { date: "2025-12-24", minutesStudied: 100 }
  ];



  // const hasRealData = dailyData.some(d => d.minutesStudied > 0);
  const hasRealData = dailyData.length > 0;

  const dataToShow = hasRealData ? dailyData : dummyData;




  const [loading, setLoading] = useState(true);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:5000/api/analytics/daily?userId=${user.id}&days=7`)
      .then(res => res.json())
      .then(data => {
        setDailyData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setLoading(false);
      });


  }, [user]);


  // ---------------- GUARDS ----------------
  if (!user) return <p>Please login</p>;
  if (loading) return <p>Loading dashboard...</p>;





  // ---------------- CALCULATIONS ----------------
  const today = new Date().toISOString().split("T")[0];

  const todayEntry = dailyData.find(d =>
    d.date?.startsWith(today)
  );

  const todayMinutes = todayEntry?.minutesStudied || 0;


  const dailyGoal = 120;
  const percent = Math.min((todayMinutes / dailyGoal) * 100, 100);

  const chartData = dataToShow.map((item, index) => ({
    day: item.date || `Day ${index + 1}`,
    minutes: item.minutesStudied || 0,
  }));


  // ---------------- RENDER ----------------
  return (
    <div style={{ padding: '20px' }}>

      {!hasRealData && (
        <div style={{
          background: '#FFF3CD',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '6px',
          color:'black'
        }}>
          ⚠ This is a demo dashboard. Start studying to see your real progress.
        </div>
      )}


      {/* ---------------- PROGRESS BAR ---------------- */}
      <h3>Today's Progress</h3>
      <div style={{ background: '#eee', height: 12, borderRadius: 6 }}>
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: '#4CAF50',
            borderRadius: 6,
          }}
        />
      </div>
      <p>{todayMinutes} / {dailyGoal} minutes</p>

      {chartData.length === 0 && (
        <p>No study data available yet.</p>
      )}

      {/* ---------------- LINE CHART ---------------- */}
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
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ---------------- BAR CHART ---------------- */}
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
                <Bar dataKey="minutes" fill="#2196F3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ---------------- PIE CHART ---------------- */}
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
