import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './InterviewPractice.css';

function InterviewPractice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const interviewType = searchParams.get('type') || 'general';

  const { user } = useAuth();
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
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [interviewReport, setInterviewReport] = useState(null);

  const openrouterApiKey = 'YOUR_OPENROUTER_API_KEY'; 

  
  const fallbackQuestions = {
    software: [
      "Tell me about yourself and your software development experience.",
      "What programming languages are you most comfortable with?",
      "Explain a challenging technical problem you solved.",
      "How do you stay updated with new technologies?",
      "Describe your ideal software development role."
    ],
    general: [
      "Tell me about yourself.",
      "What are your greatest strengths?",
      "Why are you interested in this position?",
      "Describe a challenge you overcame at work.",
      "Where do you see yourself in 5 years?"
    ]
  };

 
  const getAIQuestion = async (previousAnswer = null) => {
    setAiLoading(true);
    
    try {
      const messages = [
        {
          role: 'system',
          content: `You are an AI interviewer for a ${interviewType === 'software' ? 'Software Engineering' : 'General'} position. Ask one short, professional question at a time. Keep questions under 25 words.`
        }
      ];
      
    
      conversationHistory.forEach(msg => {
        messages.push(msg);
      });
      
     
      if (previousAnswer) {
        messages.push({
          role: 'user',
          content: previousAnswer
        });
      }
      
      
      if (conversationHistory.length === 0) {
        messages.push({
          role: 'user',
          content: 'Start the interview with an appropriate opening question.'
        });
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: messages,
          max_tokens: 80,
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
      
    } catch (error) {
      console.error('AI error, using fallback:', error);
    }
    
    
    const questions = fallbackQuestions[interviewType] || fallbackQuestions.general;
    const index = (conversationHistory.length / 2) % questions.length;
    return questions[index];
  };


  const speakText = (text) => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  };


  const askQuestion = async (questionText) => {
    setCurrentQuestion(questionText);
    setWaitingForAnswer(false);
    
    
    await speakText(questionText);
    
    setTimeout(() => {
      setWaitingForAnswer(true);
      show('🎤 Your turn to speak. Click "Finished Speaking" when done.', 'info');
    }, 500);
  };


  const loadNextQuestion = async (userAnswer = null) => {
   
    if (userAnswer) {
      setConversationHistory(prev => [...prev, 
        { role: 'user', content: userAnswer }
      ]);
    }
    
    
    const nextQuestion = await getAIQuestion(userAnswer);
    
   
    setConversationHistory(prev => [...prev, 
      { role: 'assistant', content: nextQuestion }
    ]);
    
    setCurrentQuestionNum(prev => prev + 1);
    
    
    await askQuestion(nextQuestion);
  };

 
  const handleFinishedSpeaking = async () => {
    if (!waitingForAnswer) return;
    
    setWaitingForAnswer(false);
    
    
    if (recordingTime >= (interviewDuration * 60) - 10) {
      await speakText("Time's up! Thank you for your participation.");
      stopRecordingAndGenerateReport();
      return;
    }
    
   
    await loadNextQuestion("[User's spoken answer]");
  };

  
  const startRecording = async () => {
    if (permissionStatus.camera !== 'granted' || permissionStatus.microphone !== 'granted') {
      show('Please grant permissions first', 'error');
      return;
    }
    
    try {
      
      setConversationHistory([]);
      setCurrentQuestionNum(1);
      setInterviewReport(null);
      recordedChunksRef.current = [];
      
     
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
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
      
     
      const interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= interviewDuration * 60) {
            clearInterval(interval);
            if (interviewStarted) {
              stopRecordingAndGenerateReport();
            }
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
     
      await speakText(`Welcome to your ${interviewType} interview practice. You have ${interviewDuration} minutes.`);
      
      
      const firstQuestion = await getAIQuestion();
      setConversationHistory([{ role: 'assistant', content: firstQuestion }]);
      await askQuestion(firstQuestion);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      show('Could not start recording', 'error');
    }
  };

  
  const saveRecording = async (blob) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${interviewType}_${user?.id || 'user'}_${interviewDuration}min_${timestamp}.webm`;
      
    
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('video', blob, filename);
      formData.append('interviewType', interviewType);
      formData.append('duration', interviewDuration);
      formData.append('userId', user?.id || 'user');
      
      const response = await fetch('/api/interview/upload-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        console.log('✅ Video saved to server');
        show('Interview video saved!', 'success');
      } else {
        throw new Error('Server upload failed');
      }
      
    } catch (error) {
      console.error('Server save error, saving locally:', error);
      
      // Fallback: Download locally
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${interviewType}_${user?.id || 'user'}_${interviewDuration}min_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      show('Video saved to Downloads folder', 'success');
    }
  };

  
  const generateReport = () => {
    const totalQuestions = conversationHistory.filter(m => m.role === 'assistant').length;
    const answeredQuestions = conversationHistory.filter(m => m.role === 'user').length;
    
    
    const expectedQuestions = Math.min(10, Math.floor(recordingTime / 60) + 1);
    const completionScore = Math.min(100, Math.floor((answeredQuestions / expectedQuestions) * 100));
    
    
    const engagementScore = Math.min(100, Math.floor((conversationHistory.length / 2 / 8) * 100));
    
    
    const overallScore = Math.floor((completionScore + engagementScore) / 2);
    
    
    let feedback = '';
    let level = '';
    
    if (overallScore >= 80) {
      level = 'Excellent';
      feedback = 'Great job! You handled the interview very well. Your responses were comprehensive and showed good communication skills.';
    } else if (overallScore >= 60) {
      level = 'Good';
      feedback = 'Good effort! You answered most questions well. Consider providing more detailed examples in your responses.';
    } else if (overallScore >= 40) {
      level = 'Average';
      feedback = 'You have a good foundation. Practice structuring your answers using the STAR method (Situation, Task, Action, Result).';
    } else {
      level = 'Needs Improvement';
      feedback = 'Keep practicing! Focus on speaking clearly, providing specific examples, and staying engaged throughout the interview.';
    }
    
    const report = {
      totalQuestions,
      answeredQuestions,
      completionScore,
      engagementScore,
      overallScore,
      level,
      feedback,
      duration: recordingTime,
      interviewType,
      date: new Date().toLocaleString()
    };
    
    setInterviewReport(report);
    
   
    const reports = JSON.parse(localStorage.getItem('interviewReports') || '[]');
    reports.unshift(report);
    localStorage.setItem('interviewReports', JSON.stringify(reports.slice(0, 10)));
  };

 
  const stopRecordingAndGenerateReport = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerInterval) clearInterval(timerInterval);
      window.speechSynthesis.cancel();
      
      setInterviewStarted(false);
      
    
      generateReport();
      setShowResults(true);
      
      show('Interview completed! Report generated.', 'success');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  
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
      console.error('Permission error:', err);
      setPermissionStatus({ camera: 'denied', microphone: 'denied' });
      show('Camera/microphone access required', 'error');
    }
  };

  useEffect(() => {
    if (!user) {
      show('Please login to start interview practice', 'error');
      navigate('/communication');
      return;
    }
    requestPermissions();
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  if (permissionStatus.camera === 'denied') {
    return (
      <div className="permission-denied">
        <h2>Camera/Microphone Required</h2>
        <p>Please enable permissions in your browser settings.</p>
        <button onClick={() => navigate('/communication')} className="btn-primary">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <section className="page interview-practice-page">
      <header className="page-header">
        <h2>{interviewType === 'software' ? 'Software Engineering' : 'General'} Interview Practice</h2>
        <p>AI interviewer speaks | Video recording | Instant feedback & scoring</p>
        <button className="btn-back" onClick={() => navigate('/interview-scenarios')}>
          ← Back to Scenarios
        </button>
      </header>

      <div className="interview-container">
        {/* Left Panel - Video */}
        <div className="video-panel">
          <div className="video-container">
            <video ref={videoRef} autoPlay playsInline muted className="camera-preview" />
            {isRecording && (
              <div className="recording-indicator">
                <div className="recording-dot"></div>
                Recording • {formatTime(recordingTime)} / {interviewDuration}:00
              </div>
            )}
          </div>

          {!interviewStarted && !showResults ? (
            <div className="interview-controls">
              <div className="duration-selector">
                <label>Duration:</label>
                <select value={interviewDuration} onChange={(e) => setInterviewDuration(Number(e.target.value))}>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
              <button onClick={startRecording} className="btn-primary start-btn">
                Start AI Interview
              </button>
            </div>
          ) : interviewStarted && !showResults ? (
            <div className="recording-controls">
              {waitingForAnswer && (
                <button onClick={handleFinishedSpeaking} className="btn-success" disabled={aiLoading}>
                  {aiLoading ? 'Loading next question...' : '✓ I\'ve Finished Speaking → Next Question'}
                </button>
              )}
              <button onClick={stopRecordingAndGenerateReport} className="btn-danger">
                Stop & End Interview
              </button>
            </div>
          ) : null}
        </div>

       
        <div className="questions-panel">
          {!showResults ? (
            <>
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(recordingTime / (interviewDuration * 60)) * 100}%` }}></div>
                </div>
                <span>Time: {formatTime(recordingTime)} / {formatTime(interviewDuration * 60)}</span>
              </div>

              <div className="current-question">
                <div className="question-status">
                  {aiLoading ? (
                    <div className="loading-indicator">
                      <span>🤖 AI is preparing next question...</span>
                    </div>
                  ) : isSpeaking ? (
                    <div className="speaking-indicator">
                      <div className="speaking-dot"></div>
                      <span>🔊 AI is speaking...</span>
                    </div>
                  ) : waitingForAnswer ? (
                    <div className="waiting-indicator active">
                      <div className="user-speaking-dot"></div>
                      <span>🎤 Your turn to speak</span>
                    </div>
                  ) : (
                    <div className="waiting-indicator">
                      <span>⏳ Waiting...</span>
                    </div>
                  )}
                </div>

                {currentQuestion && (
                  <>
                    <h3>Question {currentQuestionNum}</h3>
                    <div className="question-bubble">
                      <p>{currentQuestion}</p>
                    </div>
                  </>
                )}

                {waitingForAnswer && (
                  <div className="answer-hint">
                    <p>💡 Speak your answer naturally, then click "Finished Speaking" when done.</p>
                  </div>
                )}
              </div>

              <div className="interview-tips">
                <h4>📋 Interview Tips:</h4>
                <ul>
                  <li>AI will speak each question aloud</li>
                  <li>Answer naturally when it's your turn</li>
                  <li>Click "Finished Speaking" to proceed</li>
                  <li>Interview stops automatically at time limit</li>
                  <li>A detailed report with score will be generated</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="results-panel">
              <div className="results-header">
                <h3>🎉 Interview Complete!</h3>
                <p>Here's your performance report</p>
              </div>

              {interviewReport && (
                <>
                  <div className="score-circle">
                    <div className="score-number">{interviewReport.overallScore}%</div>
                    <div className="score-label">{interviewReport.level}</div>
                  </div>

                  <div className="report-stats">
                    <div className="stat-item">
                      <span className="stat-label">Questions Asked</span>
                      <span className="stat-value">{interviewReport.totalQuestions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Questions Answered</span>
                      <span className="stat-value">{interviewReport.answeredQuestions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Duration</span>
                      <span className="stat-value">{formatTime(interviewReport.duration)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Completion Score</span>
                      <span className="stat-value">{interviewReport.completionScore}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Engagement Score</span>
                      <span className="stat-value">{interviewReport.engagementScore}%</span>
                    </div>
                  </div>

                  <div className="feedback-section">
                    <h4>📝 Feedback</h4>
                    <p>{interviewReport.feedback}</p>
                  </div>

                  <div className="action-buttons">
                    <button onClick={() => navigate('/communication')} className="btn-primary">
                      ← Back
                    </button>
                    <button onClick={() => {
                      setShowResults(false);
                      setCurrentQuestionNum(1);
                      setRecordingTime(0);
                      setCurrentQuestion('');
                      setConversationHistory([]);
                      setInterviewReport(null);
                      setWaitingForAnswer(false);
                    }} className="btn-secondary">
                      ↻ Start New Interview
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default InterviewPractice;