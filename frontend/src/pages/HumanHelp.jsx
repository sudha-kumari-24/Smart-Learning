import React, { useState } from 'react';
import './HumanHelp.css';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function HumanHelp() {

  const { user, token } = useAuth();
  const notify = useNotification();
  const [topic, setTopic] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!token || !user) {
      notify.show('Please sign in first to request human help');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/support/call-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topic, note })
      });

      const data = await res.json();

      if (!res.ok) {
        notify.show(data.message || 'Request failed');
        return;
      }

      notify.show('Request submitted successfully! A mentor will contact you soon.', 'success');
      setSubmitted(true);
    } catch (err) {
      notify.show('Server not reachable. Please try again.');
      setError('Unable to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  }

  const topicIcons = {
    'Study planning': '📚',
    'Career guidance': '💼',
    'Stress / mental health': '🧘'
  };

  const topicDescriptions = {
    'Study planning': 'Get help with study schedules, exam preparation, and learning strategies',
    'Career guidance': 'Discuss career paths, internships, resume building, and job opportunities',
    'Stress / mental health': 'Talk about managing stress, anxiety, and maintaining mental wellbeing'
  };

  return (
    <section className="human-page">
      <div className="human-header">
        <div className="human-header-content">
          <div className="human-header-icon">🤝</div>
          <h2>Request Human Help</h2>
          <p>Connect with a real mentor, counselor, or support member for personalized guidance</p>
        </div>
      </div>

      <div className="human-container">
        {/* Info Cards */}
        <div className="human-info-grid">
          <div className="human-info-card">
            <div className="info-icon">⏰</div>
            <h4>Quick Response</h4>
            <p>We'll get back to you within 24 hours</p>
          </div>
          <div className="human-info-card">
            <div className="info-icon">🎯</div>
            <h4>Personalized Help</h4>
            <p>Get one-on-one guidance tailored to your needs</p>
          </div>
          <div className="human-info-card">
            <div className="info-icon">🔒</div>
            <h4>Confidential</h4>
            <p>Your conversations are private and secure</p>
          </div>
        </div>

       
        <div className="human-card-wrapper">
          <div className="human-card">
            {submitted ? (
              <div className="success-container">
                <div className="success-animation">
                  <div className="success-checkmark">✓</div>
                </div>
                <h3>Request Submitted Successfully! 🎉</h3>
                <p className="success-text">
                  Your request has been recorded. A human helper will reach out to you soon via email or phone.
                </p>
                <div className="success-details">
                  <div className="detail-item">
                    <span className="detail-label">Topic:</span>
                    <span className="detail-value">{topic}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Response Time:</span>
                    <span className="detail-value">Within 24 hours</span>
                  </div>
                </div>
                <button 
                  className="btn-new-request"
                  onClick={() => {
                    setSubmitted(false);
                    setTopic('');
                    setNote('');
                  }}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <>
                <div className="card-header">
                  <div className="card-header-icon">📝</div>
                  <div>
                    <h3>Request Assistance</h3>
                    <p>Fill out the form below and we'll connect you with the right person</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="human-form">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📌</span>
                      Topic for Call
                    </label>
                    <div className="topic-options">
                      {['Study planning', 'Career guidance', 'Stress / mental health'].map((option) => (
                        <div
                          key={option}
                          className={`topic-card ${topic === option ? 'selected' : ''}`}
                          onClick={() => setTopic(option)}
                        >
                          <div className="topic-icon">{topicIcons[option]}</div>
                          <div className="topic-content">
                            <h4>{option}</h4>
                            <p>{topicDescriptions[option]}</p>
                          </div>
                          <div className="topic-radio">
                            {topic === option && <div className="radio-dot"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">💬</span>
                      Brief Note
                    </label>
                    <div className="textarea-wrapper">
                      <textarea
                        rows="5"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Describe your situation in 2–3 lines... What do you need help with? Any specific questions?"
                        required
                        className="human-textarea"
                      />
                      <div className="textarea-char-count">
                        {note.length} characters
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="error-message">
                      <span className="error-icon">⚠️</span>
                      {error}
                    </div>
                  )}

                  <button
                    className={`btn-submit ${isSubmitting ? 'submitting' : ''}`}
                    type="submit"
                    disabled={!token || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span>📞</span>
                        Request Call
                      </>
                    )}
                  </button>

                  {!token && (
                    <div className="login-warning">
                      <span>🔐</span>
                      Please sign in to request human help
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>

       
        <div className="human-faq">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-grid">
            <div className="faq-item">
              <div className="faq-question">❓ How soon will I get a response?</div>
              <div className="faq-answer">We typically respond within 24 hours during business days.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">❓ Will my information be kept private?</div>
              <div className="faq-answer">Yes, all conversations are confidential and secure.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">❓ What if I need immediate help?</div>
              <div className="faq-answer">For urgent matters, please contact emergency services or our 24/7 helpline.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HumanHelp;