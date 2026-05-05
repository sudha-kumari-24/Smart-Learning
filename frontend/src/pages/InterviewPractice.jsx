import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './InterviewPractice.css';

function InterviewPractice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const interviewType = searchParams.get('type') || 'general';

  const auth = useAuth();
  const user = auth?.user || null;
  const { show } = useNotification();

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);

  const [permissionStatus, setPermissionStatus] = useState({
    camera: 'checking',
    microphone: 'checking'
  });
  const [isRecording, setIsRecording] = useState(false);
  const [interviewDuration, setInterviewDuration] = useState(15);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);

  const interviewQuestions = {
    software: [
      {
        id: 1,
        question: "Tell me about yourself and your experience with software development.",
        keywords: ["experience", "software", "development", "projects", "skills"],
        tips: ["Focus on relevant experience", "Mention specific technologies", "Keep it under 2 minutes"]
      },
      {
        id: 2,
        question: "Explain the difference between REST and GraphQL.",
        keywords: ["REST", "GraphQL", "API", "endpoints", "queries", "flexibility"],
        tips: ["Compare architectural styles", "Give use cases for each", "Mention pros and cons"]
      },
      {
        id: 3,
        question: "How would you optimize a slow database query?",
        keywords: ["database", "query", "index", "optimization", "performance", "EXPLAIN"],
        tips: ["Start with query analysis", "Mention indexing strategies", "Discuss caching options"]
      }
    ],
    general: [
      {
        id: 1,
        question: "What are your greatest strengths?",
        keywords: ["strengths", "skills", "experience", "positive", "contribute", "teamwork"],
        tips: ["Pick 2-3 key strengths", "Provide specific examples", "Relate to job requirements"]
      },
      {
        id: 2,
        question: "Where do you see yourself in 5 years?",
        keywords: ["growth", "career", "goals", "development", "aspirations", "learning"],
        tips: ["Show ambition but be realistic", "Mention skill development", "Align with company growth"]
      }
    ]
  };

  const questions = interviewQuestions[interviewType] || interviewQuestions.general;

  // Speak text using Web Speech API
  const speakText = (text) => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        resolve(); // If speech synthesis not available, just continue
      }
    });
  };

  // Speak question with intro
  const speakQuestion = async (questionNumber) => {
    const questionText = `Question ${questionNumber + 1}. ${questions[questionNumber].question}`;
    await speakText(questionText);
    await speakText("Please answer now.");
    setWaitingForUser(true);
    setUserSpeaking(true);
  };

  // Move to next question
  const moveToNextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      await speakText("Let's move to the next question.");
      setTimeout(() => speakQuestion(nextQuestion), 1000);
    } else {
      await speakText("That was the last question. Thank you for your responses.");
      stopRecording();
    }
  };

  // Stop user speaking and move to next
  const handleUserFinishedSpeaking = () => {
    if (waitingForUser) {
      setUserSpeaking(false);
      setWaitingForUser(false);
      setTimeout(() => moveToNextQuestion(), 500);
    }
  };

  useEffect(() => {
    if (!user) {
      show('Please login to start interview practice', 'error');
      navigate('/comm-trainer');
      return;
    }

    requestPermissions();

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setPermissionStatus({ camera: 'granted', microphone: 'granted' });

    } catch (err) {
      console.error('Error accessing media devices:', err);
      setPermissionStatus({ camera: 'denied', microphone: 'denied' });
      show('Camera/microphone access denied. Please check permissions.', 'error');
    }
  };

  const startRecording = async () => {
    try {
      if (permissionStatus.camera !== 'granted' || permissionStatus.microphone !== 'granted') {
        show('Please grant camera and microphone permissions first', 'error');
        return;
      }

      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        streamRef.current = stream;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }

      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        saveRecording(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setInterviewStarted(true);
      show('Interview started!', 'success');

      // Start timer
      const interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= interviewDuration * 60) {
            clearInterval(interval);
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      setTimerInterval(interval);

      // Start with first question
      await speakText("Welcome to the interview practice. Let's begin.");
      setTimeout(() => speakQuestion(0), 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      show('Could not start recording. Please check permissions.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerInterval) clearInterval(timerInterval);
      window.speechSynthesis.cancel();

      show('Recording saved successfully!', 'success');
    }
  };




const saveRecording = async (blob) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${interviewType}_${user?.id || 'user'}_${interviewDuration}min_${timestamp}.webm`;
    
    // Get token - your token is working as shown in logs
    const token = localStorage.getItem('token');
    console.log('Token for video upload:', token ? 'Found' : 'Not found');
    
    // Create FormData
    const formData = new FormData();
    formData.append('video', blob, filename);
    formData.append('interviewType', interviewType);
    formData.append('duration', interviewDuration);
    formData.append('userId', user?.id || 'user');
    
    // Send to server
    const response = await fetch('/api/interview/upload-video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Video saved:', result);
      show(`Video saved successfully!`, 'success');
    } else {
      console.error('❌ Server error:', result);
      throw new Error(result.message || 'Failed to save video');
    }
    
  } catch (error) {
    console.error('Error saving video:', error);
    
    // Fallback: Download locally
    const fallbackFilename = `${interviewType}_${user?.id || 'user'}_${interviewDuration}min_${Date.now()}.webm`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fallbackFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    show(`Video downloaded locally. Error: ${error.message}`, 'warning');
  }
  
  setTimeout(() => {
    setShowResults(true);
  }, 1000);
};



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  if (permissionStatus.camera === 'denied' || permissionStatus.microphone === 'denied') {
    return (
      <div className="permission-denied">
        <h2>Camera/Microphone Access Required</h2>
        <p>Please enable camera and microphone permissions in your browser settings to use this feature.</p>
        <button onClick={() => navigate('/comm-trainer')} className="btn-primary">
          ← Back to Communication Trainer
        </button>
      </div>
    );
  }

  return (
    <section className="page interview-practice-page">
      <header className="page-header">
        <h2>{interviewType.replace('-', ' ').toUpperCase()} Interview Practice</h2>
        <p>Practice with video recording and audio questions</p>
        <button
          className="btn-back"
          onClick={() => navigate('/interview-scenarios')}
        >
          ← Back to Interview Scenarios
        </button>
      </header>

      <div className="interview-container">
        {/* Left Panel - Video Preview */}
        <div className="video-panel">
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-preview"
            />
            {isRecording && (
              <div className="recording-indicator">
                <div className="recording-dot"></div>
                Recording • {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {!interviewStarted ? (
            <div className="interview-controls">
              <div className="duration-selector">
                <label>Interview Duration:</label>
                <select
                  value={interviewDuration}
                  onChange={(e) => setInterviewDuration(Number(e.target.value))}
                  disabled={isRecording}
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>

              <button
                onClick={startRecording}
                className="btn-primary start-btn"
                disabled={permissionStatus.camera !== 'granted' || permissionStatus.microphone !== 'granted'}
              >
                {permissionStatus.camera === 'granted' && permissionStatus.microphone === 'granted'
                  ? 'Start Interview Recording'
                  : 'Requesting Permissions...'}
              </button>
            </div>
          ) : (
            <div className="recording-controls">
              <button onClick={stopRecording} className="btn-danger">
                Stop Recording & Save
              </button>
              <p className="recording-hint">Video will be saved to your interview directory</p>
            </div>
          )}
        </div>

        {/* Right Panel - Questions & Progress */}
        <div className="questions-panel">
          {!showResults ? (
            <>
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
                <span>Question {currentQuestion + 1} of {questions.length}</span>
              </div>

              <div className="current-question">
                <div className="question-status">
                  {isSpeaking ? (
                    <div className="speaking-indicator">
                      <div className="speaking-dot"></div>
                      <span>AI is asking question...</span>
                    </div>
                  ) : userSpeaking ? (
                    <div className="user-speaking-indicator">
                      <div className="user-speaking-dot"></div>
                      <span>Your turn to speak</span>
                    </div>
                  ) : (
                    <div className="waiting-indicator">
                      <span>Ready for next question</span>
                    </div>
                  )}
                </div>

                {interviewStarted && (
                  <>
                    <h3>Question {currentQuestion + 1}</h3>
                    <p className="question-text">{questions[currentQuestion].question}</p>

                    <div className="keywords-section">
                      <h4>Expected Keywords:</h4>
                      <div className="keywords-list">
                        {questions[currentQuestion].keywords.map((keyword, index) => (
                          <span key={index} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>

                    <div className="question-tips">
                      <h4>💡 Tips:</h4>
                      <ul>
                        {questions[currentQuestion].tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="answer-controls">
                      {waitingForUser && userSpeaking && (
                        <button
                          onClick={handleUserFinishedSpeaking}
                          className="btn-primary"
                        >
                          I've Finished Speaking → Next Question
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="interview-tips">
                <h4>🎤 Interview Instructions:</h4>
                <ul>
                  <li>Listen to the audio question carefully</li>
                  <li>Speak clearly when it's your turn</li>
                  <li>Click "I've Finished Speaking" when done</li>
                  <li>The AI will automatically move to next question</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="results-panel">
              <div className="results-header">
                <h3>🎉 Interview Completed!</h3>
                <p className="results-subtitle">Video saved to: frontend/src/assets/users_interview/</p>
              </div>

              <div className="results-summary">
                <div className="result-card">
                  <div className="result-icon">💾</div>
                  <h4>Video Saved</h4>
                  <p>Recording saved to database directory</p>
                  <small>Filename: {interviewType}_{user?.id}_...webm</small>
                </div>

                <div className="result-card">
                  <div className="result-icon">❓</div>
                  <h4>Questions Answered</h4>
                  <p className="score">{questions.length}</p>
                  <p>Total questions practiced</p>
                </div>

                <div className="result-card">
                  <div className="result-icon">⏱️</div>
                  <h4>Duration</h4>
                  <p className="score">{formatTime(recordingTime)}</p>
                  <p>Total interview time</p>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  onClick={() => navigate('/comm-trainer')}
                  className="btn-primary"
                >
                  ← Back to Communication Trainer
                </button>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestion(0);
                    setRecordingTime(0);
                    setInterviewStarted(false);
                    setIsSpeaking(false);
                    setUserSpeaking(false);
                    setWaitingForUser(false);
                  }}
                  className="btn-secondary"
                >
                  ↻ Practice Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default InterviewPractice;