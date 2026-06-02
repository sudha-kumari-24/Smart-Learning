import React, { useContext, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import StudyTimer from '../components/StudyTimer';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timerStart, setTimerStart] = useState(null);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  // Fetch today's progress from new dashboard endpoint
  useEffect(() => {
    fetch(`http://localhost:5000/api/analytics/dashboard?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTodayMinutes(data.todayMinutes || 0);
          setStudyStreak(data.streak || 0);
        }
      })
      .catch(err => console.error('Error fetching progress:', err));
  }, [user]);

  function handlePause(seconds) {
    fetch('http://localhost:5000/api/analytics/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        seconds,
        sessionType: 'timer'
      })
    })
      .then(res => res.json())
      .then(updated => {
        setTodayMinutes(updated.minutesStudied);
      })
      .catch(err => console.error('Error updating progress:', err));
  }

  // Calculate study level
  const getStudyLevel = () => {
    if (todayMinutes >= 120) return { level: "🔥 Intense Focus", color: "#f97316", icon: "🔥" };
    if (todayMinutes >= 60) return { level: "⚡ Productive", color: "#4ade80", icon: "⚡" };
    if (todayMinutes >= 30) return { level: "📚 Good Start", color: "#60a5fa", icon: "📚" };
    if (todayMinutes > 0) return { level: "🌱 Getting Started", color: "#a78bfa", icon: "🌱" };
    return { level: "💤 Take First Step", color: "#9ca3af", icon: "💤" };
  };

  const studyStatus = getStudyLevel();

  return (
    <section className="profile-page-enhanced">
      {/* Hero Section */}
      <div className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            <div className="avatar-initials">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="avatar-status online"></div>
          </div>
          <div className="profile-hero-text">
            <h1>{user?.name || 'Student'}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-badges">
              <span className="badge">🎓 {user?.classCourse || 'Student'}</span>
              <span className="badge">🏫 {user?.schoolCollege?.split(' ')[0] || 'College'}</span>
            </div>
          </div>
          <button className="edit-profile-btn" onClick={() => navigate('/profile/edit')}>
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="profile-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <span className="stat-value">{todayMinutes}</span>
            <span className="stat-label">Minutes Today</span>
          </div>
          <div className="stat-progress">
            <div className="progress-bar" style={{ width: `${Math.min((todayMinutes / 120) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <span className="stat-value">{studyStreak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <span className="stat-value">{Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</span>
            <span className="stat-label">Total Study Time</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value" style={{ color: studyStatus.color }}>{studyStatus.level}</span>
            <span className="stat-label">Study Status</span>
          </div>
        </div>
      </div>

      {/* Study Timer Section */}
      <div className="profile-section timer-section">
        <div className="section-header">
          <h3>🎯 Focus Session</h3>
          <p>Start your study timer and track your progress</p>
        </div>
        <div className="timer-wrapper">
          <StudyTimer onPause={handlePause} isMuted={isMuted} />
        </div>
        <div className="mute-control" style={{ textAlign: 'center', marginTop: '10px' }}>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px 10px'
            }}
            title={isMuted ? 'Unmute clock sound' : 'Mute clock sound'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="profile-info-grid">
        {/* Personal Information */}
        <div className="info-card">
          <div className="card-header">
            <span className="card-icon">👤</span>
            <h3>Personal Information</h3>
          </div>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">Full Name</span>
              <span className="info-value">{user?.name || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email Address</span>
              <span className="info-value">{user?.email || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone Number</span>
              <span className="info-value">{user?.phone || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address</span>
              <span className="info-value">{user?.address || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="info-card">
          <div className="card-header">
            <span className="card-icon">🎓</span>
            <h3>Academic Details</h3>
          </div>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">Class/Course</span>
              <span className="info-value">{user?.classCourse || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">School/College</span>
              <span className="info-value">{user?.schoolCollege || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Learning Goal</span>
              <span className="info-value">{user?.goal || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Wellness Preferences */}
        <div className="info-card">
          <div className="card-header">
            <span className="card-icon">🧘</span>
            <h3>Wellness & Breaks</h3>
          </div>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">Preferred Breaks</span>
              <span className="info-value">{user?.preferredBreaks || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Preferred Exercises</span>
              <span className="info-value">{user?.preferredExercises || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Study Time</span>
              <span className="info-value">{user?.preferences?.preferredStudyTime || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Learning Path */}
        <div className="info-card learning-path">
          <div className="card-header">
            <span className="card-icon">🚀</span>
            <h3>AI Learning Path</h3>
          </div>
          <div className="learning-path-content">
            <div className="path-message">
              <span className="path-icon">✨</span>
              <p>Your personalized learning recommendations will appear here based on your study patterns and preferences.</p>
            </div>
            <button className="refresh-path-btn" onClick={() => window.location.href = '/recommendations'}>
              Get Recommendations →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="profile-quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/courses')}>
          <span>📚</span> Browse Courses
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/dashboard')}>
          <span>📊</span> View Dashboard
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/ai-support')}>
          <span>🤖</span> AI Support
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/stress-relief')}>
          <span>🧘</span> Stress Relief
        </button>
      </div>
    </section>
  );
}

export default Profile;