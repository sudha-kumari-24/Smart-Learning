import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Courses.css';

// Import images
import dsaImg from '../assets/courses_img/dsa.jpg';
import datascienceImg from '../assets/courses_img/datascience.jpg';
import communicationImg from '../assets/courses_img/communication.jpg';
import productivityImg from '../assets/courses_img/productivity.jpg';
import webdevImg from '../assets/courses_img/webdev.jpg';
import devopsImg from '../assets/courses_img/devops.jpg';
import mobileImg from '../assets/courses_img/mobile.jpg';
import systemdesignImg from '../assets/courses_img/systemdesign.jpg';
import cybersecurityImg from '../assets/courses_img/cybersecurity.jpg';
import aiImg from '../assets/courses_img/ai.jpg';
import dbms from '../assets/courses_img/dbms.jpg';
import testing from '../assets/courses_img/softwareTestingQA.jpg';
import defaultImg from '../assets/courses_img/default.jpg';


function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedCard, setFlippedCard] = useState(null);
  const navigate = useNavigate();

  // Direct image mapping with imported variables
  const courseImages = {
    // Exact titles from your database
    'Data Structures Essentials': dsaImg,
    'Data Structures Essentials with Python': dsaImg,
    'Data Structures & Algorithms': dsaImg,
    'DSA': dsaImg,

    'Machine Learning for Students': datascienceImg,
    'Machine Learning': datascienceImg,
    'Data Science': datascienceImg,
    'AI & ML': datascienceImg,

    'Communication Skills for Techies': communicationImg,
    'Communication Skills': communicationImg,
    'Soft Skills': communicationImg,

    'Mindful Productivity Basics': productivityImg,
    'Productivity': productivityImg,
    'Mindfulness': productivityImg,

    'Full Stack Web Development': webdevImg,
    'Web Development': webdevImg,
    'React Development': webdevImg,

    'DevOps & Cloud Engineering': devopsImg,
    'DevOps': devopsImg,
    'Cloud Engineering': devopsImg,

    'Mobile App Development': mobileImg,
    'Mobile Development': mobileImg,

    'System Design & Architecture': systemdesignImg,
    'System Design': systemdesignImg,

    'Cybersecurity Fundamentals': cybersecurityImg,
    'Cybersecurity': cybersecurityImg,

    'AI & Prompt Engineering': aiImg,
    'Artificial Intelligence': aiImg,
    'Prompt Engineering': aiImg,


    'Database Management Systems': dbms,


    'Software Testing & QA': testing,
    'Software Testing': testing,
    'QA': testing,


    'default': defaultImg
  };

  // Helper function to get image
  const getCourseImage = (courseTitle) => {
    // Try exact match first
    if (courseImages[courseTitle]) {
      return courseImages[courseTitle];
    }

    // Try partial match
    const titleLower = courseTitle.toLowerCase();
    for (const [key, img] of Object.entries(courseImages)) {
      if (titleLower.includes(key.toLowerCase())) {
        return img;
      }
    }

    // Fallback to default
    return courseImages['default'];
  };

  
 useEffect(() => {
  async function loadCourses() {
    try {
      const res = await fetch('http://localhost:5000/api/courses');

      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await res.json();
      console.log("COURSES FROM DB:", data);

      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  }

  loadCourses();
}, []);

  const handleCardClick = (courseId) => {
    setFlippedCard(flippedCard === courseId ? null : courseId);
  };

  const handleEnroll = (courseId, e) => {
    e.stopPropagation();
    navigate(`/course/${courseId}`);
  };

  const handlePreview = (courseId, e) => {
    e.stopPropagation();
    navigate(`/course/${courseId}`);
  };

  const handleViewDetails = (courseId, e) => {
    e.stopPropagation();
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <section className="page courses-page">
        <header className="page-header">
          <h2>Courses & Recommendations</h2>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </header>
      </section>
    );
  }

  return (
    <section className="page courses-page">
      <header className="page-header">
        <h2>Courses & Recommendations</h2>
        <p>Explore curated content and AI‑powered recommendations for your career growth.</p>
      </header>

      <div className="courses-layout">
        <div className="courses-main">
          <div className="courses-grid">
            {courses.map(course => {
              const courseId = course._id;
              const courseImage = getCourseImage(course.title);

              return (
                <div
                  key={courseId}
                  className={`course-card-container ${flippedCard === courseId ? 'flipped' : ''}`}
                  onClick={() => handleCardClick(courseId)}
                >
                  <div className="course-card">
                    {/* Front of card */}
                    <div className="card-front">
                      <div className="course-image">
                        <img
                          src={courseImage}
                          alt={course.title}
                          onError={(e) => {
                            e.target.src = `https://placehold.co/400x250/1e293b/60a5fa?text=${encodeURIComponent(course.title.substring(0, 30))}`;
                          }}
                        />
                        <div className="course-badge">
                          <span className="level-badge">{course.level}</span>
                          {course.certificate && (
                            <span className="certificate-badge">Certificate</span>
                          )}
                        </div>
                      </div>

                      <div className="course-info">
                        <div className="course-category">{course.category || course.tags?.[0] || 'General'}</div>
                        <h3>{course.title}</h3>
                        <p className="course-description">
                          {course.description || 'Master this skill for your career growth'}
                        </p>

                        <div className="course-meta">
                          <div className="meta-item">
                            <span className="meta-icon">⏱️</span>
                            <span>{course.durationHours || 0}h</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-icon">👥</span>
                            <span>{(course.enrolled || 0).toLocaleString()}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-icon">📈</span>
                            <span>{course.completionRate || '85%'}</span>
                          </div>
                        </div>

                        <div className="card-hint">
                          <span className="hint-text">Click to flip and explore →</span>
                        </div>
                      </div>
                    </div>

                    {/* Back of card */}
                    <div className="card-back">
                      <h3>{course.title}</h3>

                      <div className="course-details">
                        <div className="detail-section">
                          <h4>What You'll Learn</h4>
                          <ul>
                            <li>Industry-relevant skills</li>
                            <li>Practical projects</li>
                            <li>Interview preparation</li>
                            {course.certificate && <li>Verifiable certificate</li>}
                          </ul>
                        </div>

                        <div className="detail-section">
                          <h4>Tags</h4>
                          <div className="tags-container">
                            {course.tags?.map((tag, index) => (
                              <span key={index} className="tag">{tag}</span>
                            )) || ['General']}
                          </div>
                        </div>

                        <div className="detail-section">
                          <h4>Includes</h4>
                          <div className="includes-list">
                            <span>🎥 Video lectures</span>
                            <span>📝 Assignments</span>
                            {course.certificate && <span>🏆 Certificate</span>}
                            <span>💬 Community access</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          className="btn-primary-sm"
                          onClick={(e) => handleEnroll(courseId, e)}
                        >
                          Enroll Now
                        </button>
                        <button
                          className="btn-outline-sm"
                          onClick={(e) => handlePreview(courseId, e)}
                        >
                          Preview
                        </button>
                        <button
                          className="btn-text-sm"
                          onClick={(e) => handleViewDetails(courseId, e)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar with AI Recommendations */}
        <aside className="courses-sidebar">
          <div className="sidebar-card ai-recommendations">
            <h3>🤖 AI Recommendations</h3>
            <div className="reco-list">
              <div className="reco-item">
                <span className="reco-icon">🔥</span>
                <div className="reco-content">
                  <h4>Complete 3 DSA problems today</h4>
                  <p>Based on your recent activity</p>
                </div>
                <span className="reco-badge">Daily</span>
              </div>
              <div className="reco-item">
                <span className="reco-icon">⭐</span>
                <div className="reco-content">
                  <h4>Continue Web Development course</h4>
                  <p>You're 65% completed</p>
                </div>
                <span className="reco-badge">Progress</span>
              </div>
              <div className="reco-item">
                <span className="reco-icon">📈</span>
                <div className="reco-content">
                  <h4>Trending: System Design Patterns</h4>
                  <p>Most viewed this week</p>
                </div>
                <span className="reco-badge">Trending</span>
              </div>
              <div className="reco-item">
                <span className="reco-icon">⚡</span>
                <div className="reco-content">
                  <h4>Quick 30-min AI tools workshop</h4>
                  <p>Boost your productivity</p>
                </div>
                <span className="reco-badge">Quick Win</span>
              </div>
            </div>
            <button
              className="btn-primary-sm"
              onClick={() => navigate('/recommendations')}
              style={{ width: '100%' }}
            >
              Get Personalized Recommendations
            </button>
          </div>

          <div className="sidebar-card certificate-card">
            <h3>🏆 Earn Certificates</h3>
            <p>Complete any course to receive a verifiable digital certificate that you can share on LinkedIn.</p>
            <ul className="certificate-features">
              <li>✓ Industry-recognized credentials</li>
              <li>✓ Share on LinkedIn & resumes</li>
              <li>✓ Verifiable online</li>
              <li>✓ No extra cost</li>
            </ul>
          </div>

          <div className="sidebar-card job-market-card">
            <h3>💼 In-Demand Skills</h3>
            <p>Top skills employers are hiring for:</p>
            <div className="skill-tags">
              <span className="skill-tag">React.js</span>
              <span className="skill-tag">Python</span>
              <span className="skill-tag">AWS</span>
              <span className="skill-tag">Docker</span>
              <span className="skill-tag">Machine Learning</span>
              <span className="skill-tag">System Design</span>
              <span className="skill-tag">TypeScript</span>
              <span className="skill-tag">Kubernetes</span>
            </div>
            <a href="/ai-support" className="career-link">
              Explore Career Paths →
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Courses;