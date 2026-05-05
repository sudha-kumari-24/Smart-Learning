import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Recommendations.css';

const Recommendations = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/recommendations/questions');
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAnswer = (questionId, answer) => {
    const existingIndex = responses.findIndex(r => r.question_id === questionId);
    const newResponse = {
      question_id: questionId,
      question: questions.find(q => q.id === questionId)?.question,
      answer: answer
    };

    if (existingIndex >= 0) {
      const updated = [...responses];
      updated[existingIndex] = newResponse;
      setResponses(updated);
    } else {
      setResponses([...responses, newResponse]);
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    const userId = localStorage.getItem('userId') || 'temp_user';
    
    try {
      const response = await fetch('http://localhost:8002/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: responses,
          userId: userId
        })
      });
      
      const data = await response.json();
      setRecommendations(data);
      setCurrentStep(questions.length);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8002/api/recommendations/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatMessage,
          responses: responses
        })
      });
      
      const data = await response.json();
      setChatResponse(data.response);
      setChatMessage('');
    } catch (error) {
      console.error('Error sending chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const restartRecommendation = () => {
    setCurrentStep(0);
    setResponses([]);
    setRecommendations(null);
    setChatResponse('');
  };

  if (questions.length === 0) {
    return (
      <div className="recommendation-module">
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>Loading your personalized advisor...</p>
        </div>
      </div>
    );
  }

  // Question answering interface
  if (currentStep < questions.length && !recommendations) {
    const currentQuestion = questions[currentStep];
    const currentAnswer = responses.find(r => r.question_id === currentQuestion.id)?.answer;

    return (
      <div className="recommendation-module">
        <div className="recommendations-container">
          <div className="recommendations-header">
            <h1>🎯 Find Your Perfect Course</h1>
            <p>Let me ask you a few questions to understand your learning goals</p>
          </div>

          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="question-card">
            <div className="question-number">
              Question {currentStep + 1} of {questions.length}
            </div>
            <h2 className="question-text">{currentQuestion.question}</h2>
            
            <div className="options-grid">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option-btn ${currentAnswer === option ? 'selected' : ''}`}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="navigation-buttons">
              {currentStep > 0 && (
                <button 
                  className="nav-btn prev"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  ← Previous
                </button>
              )}
              
              {currentStep === questions.length - 1 && (
                <button 
                  className="nav-btn generate"
                  onClick={generateRecommendations}
                  disabled={responses.length < questions.length}
                >
                  {loading ? 'Analyzing...' : '✨ Get Recommendations'}
                </button>
              )}
            </div>
          </div>

          {/* AI Chat Assistant */}
          <div className="ai-chat-assistant">
            <button 
              className="chat-toggle-btn"
              onClick={() => setShowChat(!showChat)}
            >
              💬 Ask AI Assistant
            </button>
            
            {showChat && (
              <div className="chat-window">
                <div className="chat-header">
                  <h3>🤖 Learning Advisor</h3>
                  <button onClick={() => setShowChat(false)}>✕</button>
                </div>
                <div className="chat-messages">
                  {chatResponse && (
                    <div className="chat-bubble ai">
                      <p>{chatResponse}</p>
                    </div>
                  )}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Ask about courses..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <button onClick={sendChatMessage}>Send</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Recommendations results
  if (recommendations && recommendations.recommendations) {
    return (
      <div className="recommendation-module">
        <div className="recommendations-results">
          <div className="results-header">
            <h1>🎉 Your Personalized Course Recommendations</h1>
            <button className="restart-btn" onClick={restartRecommendation}>
              Start Over
            </button>
          </div>

          {recommendations.explanation && (
            <div className="ai-explanation">
              <div className="explanation-icon">🤖</div>
              <p>{recommendations.explanation}</p>
            </div>
          )}

          <div className="rec-courses-grid">
            {recommendations.recommendations.map((rec, idx) => (
              <div 
                key={rec.course._id} 
                className="rec-course-card"
                onClick={() => openCourse(rec.course._id)}
              >
                <div className="course-rank">#{idx + 1} Recommendation</div>
                <div className="rec-tags">
                  {rec.course.tags?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="rec-tag">{tag}</span>
                  ))}
                </div>
                <h3>{rec.course.title}</h3>
                <p className="course-description">{rec.course.description}</p>
                <div className="course-meta">
                  <span className="meta-item">📊 {rec.course.level}</span>
                  <span className="meta-item">⏱️ {rec.course.durationHours} hours</span>
                  <span className="meta-item">👨‍🏫 {rec.course.instructor}</span>
                </div>
                {rec.course.enrolled && (
                  <div className="course-stats">
                    <span>👥 {rec.course.enrolled.toLocaleString()} students</span>
                    {rec.course.completionRate && (
                      <span>✅ {rec.course.completionRate} completion</span>
                    )}
                  </div>
                )}
                <div className="rec-match-reasons">
                  <strong>Why this course?</strong>
                  <ul>
                    {rec.reasons.map((reason, i) => (
                      <li key={i}>✓ {reason}</li>
                    ))}
                  </ul>
                </div>
                <button className="rec-view-course-btn">
                  View Course →
                </button>
              </div>
            ))}
          </div>

          {/* Persistent AI Chat */}
          <div className="floating-chat">
            <button 
              className="floating-chat-btn"
              onClick={() => setShowChat(!showChat)}
            >
              💬 Need more help?
            </button>
            
            {showChat && (
              <div className="chat-window floating">
                <div className="chat-header">
                  <h3>🤖 Learning Advisor</h3>
                  <button onClick={() => setShowChat(false)}>✕</button>
                </div>
                <div className="chat-messages">
                  {chatResponse && (
                    <div className="chat-bubble ai">
                      <p>{chatResponse}</p>
                    </div>
                  )}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Ask for more recommendations..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <button onClick={sendChatMessage}>Send</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Recommendations;