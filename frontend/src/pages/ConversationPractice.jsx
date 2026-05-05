import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './ConversationPractice.css';

// Import your images

import restaurantImg from '../assets/live_conv/restaurant.jpg';
import ambulanceImg from '../assets/live_conv/ambulance.jpg';
import friendImg from '../assets/live_conv/friend.jpg';
import policeImg from '../assets/live_conv/police.jpg';

function ConversationPractice() {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user || null;
  const { show } = useNotification();

  const [flippedCard, setFlippedCard] = useState(null);
  const [permissionChecked, setPermissionChecked] = useState(false);

  const scenarios = [
    {
      id: 'restaurant',
      title: 'Order at Restaurant',
      description: 'Practice ordering food and drinks at a restaurant',
      duration: '5-10 min',
      image: restaurantImg,
      lines: 6,
      emoji: '🍽️',
      features: [
        'Welcome & greeting',
        'Menu ordering',
        'Special requests',
        'Bill payment'
      ],
      sampleDialogues: [
        "Welcome to our restaurant!",
        "I'd like to see the menu, please.",
        "What's your special today?",
        "Can I get the bill?"
      ],
      difficulty: 'Easy'
    },
    {
      id: 'ambulance',
      title: 'Call Ambulance',
      description: 'Emergency conversation practice',
      duration: '3-5 min',
      image: ambulanceImg,
      lines: 6,
      emoji: '🚑',
      features: [
        'Emergency reporting',
        'Address description',
        'Symptom explanation',
        'First aid guidance'
      ],
      sampleDialogues: [
        "Emergency services, what's your emergency?",
        "I need an ambulance immediately!",
        "What's the address?",
        "Someone has chest pain."
      ],
      difficulty: 'Medium'
    },
    {
      id: 'friend',
      title: 'Talk with Friend',
      description: 'Casual conversation practice',
      duration: '5-8 min',
      image: friendImg,
      lines: 6,
      emoji: '👋',
      features: [
        'Casual greetings',
        'Daily updates',
        'Making plans',
        'Sharing experiences'
      ],
      sampleDialogues: [
        "Hey! How have you been?",
        "I've been good! Busy with work.",
        "Did you watch the game?",
        "We should catch up soon."
      ],
      difficulty: 'Easy'
    },
    {
      id: 'police',
      title: 'Report to Police',
      description: 'Formal reporting practice',
      duration: '5-7 min',
      image: policeImg,
      lines: 6,
      emoji: '👮',
      features: [
        'Formal reporting',
        'Incident description',
        'Witness information',
        'Case follow-up'
      ],
      sampleDialogues: [
        "Police station, how can I help?",
        "I want to report a theft.",
        "When did this happen?",
        "It was a blue bicycle."
      ],
      difficulty: 'Medium'
    }
  ];


  useEffect(() => {
    if (!user) {
      show('Please login to access conversation practice', 'error');
      navigate('/communication');
      return;
    }

    checkMicrophonePermission();
  }, [user]);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionChecked(true);
    } catch (error) {
      show('Microphone permission required for conversation practice. Please allow access.', 'warning');
    }
  };

  const handleCardClick = (scenarioId) => {
    setFlippedCard(flippedCard === scenarioId ? null : scenarioId);
  };

  const startConversation = (scenarioId) => {
    if (!('speechSynthesis' in window)) {
      show('Text-to-speech not supported. Please use Chrome or Edge browser.', 'error');
      return;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      show('Speech recognition not supported. Please use Chrome or Edge browser.', 'error');
      return;
    }

    navigate(`/conversation-chat?scenario=${scenarioId}`);
  };

  if (!user) {
    return (
      <div className="page">
        <div className="permission-denied">
          <h2>Please Login</h2>
          <p>You need to login to access conversation practice.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="page conversation-page">
      <header className="page-header">
        <h2>Live Conversation Practice</h2>
        <p>Select a scenario to practice real conversations with AI</p>
        <button
          className="btn-back"
          onClick={() => navigate('/communication')}
        >
          ← Back to Communication Trainer
        </button>
      </header>

      {!permissionChecked && (
        <div className="permission-alert">
          ⚠️ Microphone access required for speech practice
        </div>
      )}

      <div className="conversation-layout">
        <div className="conversation-grid">
          {scenarios.map(scenario => (
            <div
              key={scenario.id}
              className={`scenario-card-container ${flippedCard === scenario.id ? 'flipped' : ''}`}
              onClick={() => handleCardClick(scenario.id)}
            >
              <div className="scenario-card">
                {/* Front of Card */}
                <div className="card-front">
                  <div className="scenario-image">
                    <img
                      src={scenario.image}
                      alt={scenario.title}
                    />
                    <div className="scenario-badge">
                      <span className="level-badge">{scenario.difficulty}</span>
                      <span className="duration-badge">{scenario.duration}</span>
                    </div>
                  </div>

                  <div className="scenario-info">
                    <div className="scenario-category">Conversation Practice</div>
                    <h3>{scenario.title}</h3>
                    <p className="scenario-description">{scenario.description}</p>

                    <div className="scenario-meta">
                      <div className="meta-item">
                        <span className="meta-icon">🗣️</span>
                        <span>{scenario.lines} dialogues</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">🎯</span>
                        <span>{scenario.difficulty}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">{scenario.emoji}</span>
                        <span>Scenario</span>
                      </div>
                    </div>

                    <div className="card-hint">
                      <span className="hint-text">
                        👆 Click for details & start
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back of Card - FULL DETAILS */}
                <div className="card-back">
                  <div className="scenario-header-back">
                    <h3>{scenario.title}</h3>
                    <div className="scenario-stats-back">
                      <span className="stat-badge">{scenario.duration}</span>
                      <span className="stat-badge">{scenario.lines} dialogues</span>
                      <span className="stat-badge">{scenario.difficulty}</span>
                    </div>
                  </div>

                  <div className="scenario-details">
                    <div className="detail-section">
                      <h4>🎯 What You'll Practice</h4>
                      <ul className="features-list">
                        {scenario.features.map((feature, index) => (
                          <li key={index}>
                            <span className="feature-check">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="detail-section">
                      <h4>💬 Sample Dialogues</h4>
                      <div className="dialogues-preview">
                        {scenario.sampleDialogues.map((dialogue, index) => (
                          <div key={index} className="dialogue-line">
                            <span className="dialogue-icon">
                              {index % 2 === 0 ? '🤖' : '👤'}
                            </span>
                            <span className="dialogue-text">{dialogue}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>✨ Includes</h4>
                      <div className="includes-grid">
                        <div className="include-item">
                          <span className="include-icon">🎤</span>
                          <span>Real-time speech</span>
                        </div>
                        <div className="include-item">
                          <span className="include-icon">🤖</span>
                          <span>AI responses</span>
                        </div>
                        <div className="include-item">
                          <span className="include-icon">💡</span>
                          <span>Instant feedback</span>
                        </div>
                        <div className="include-item">
                          <span className="include-icon">📊</span>
                          <span>Progress tracking</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startConversation(scenario.id);
                      }}
                      className="btn-start-conversation"
                    >
                      🎤 Start Live Conversation →
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlippedCard(null);
                      }}
                      className="btn-flip-back"
                    >
                      ← Flip back to front
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - remains the same */}
        <div className="conversation-sidebar">
          <div className="sidebar-card">
            <h3>🎯 How It Works</h3>
            <div className="reco-list">
              <div className="reco-item">
                <div className="reco-icon">1</div>
                <div className="reco-content">
                  <h4>Select a Scenario</h4>
                  <p>Choose a conversation topic to practice</p>
                </div>
              </div>
              <div className="reco-item">
                <div className="reco-icon">2</div>
                <div className="reco-content">
                  <h4>Start Conversation</h4>
                  <p>Click "Start Conversation" on any card</p>
                </div>
              </div>
              <div className="reco-item">
                <div className="reco-icon">3</div>
                <div className="reco-content">
                  <h4>Speak & Listen</h4>
                  <p>Talk to AI and hear responses in real-time</p>
                </div>
              </div>
              <div className="reco-item">
                <div className="reco-icon">4</div>
                <div className="reco-content">
                  <h4>Get Feedback</h4>
                  <p>Receive instant pronunciation suggestions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>💡 Tips for Success</h3>
            <ul className="tips-list">
              <li>🎤 Speak clearly and at a natural pace</li>
              <li>👂 Listen carefully to AI questions</li>
              <li>🗣️ Try to use suggested keywords</li>
              <li>🔄 Practice multiple times for improvement</li>
              <li>🎯 Focus on one scenario at a time</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConversationPractice;