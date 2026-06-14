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
  const recognitionRef = useRef(null);


  const fallbackQuestions = {
    software: [
      "Tell me about yourself and your software development experience.",
      "What programming languages are you most comfortable with?",
      "Describe a challenging technical problem you solved.",
      "How do you stay updated with new technologies?",
      "Explain your experience with version control systems like Git.",
      "What's your approach to debugging complex issues?",
      "Describe a project you're proud of.",
      "How do you handle tight deadlines?",
      "What's your experience with testing and quality assurance?",
      "Why do you want to work in software development?"
    ],
    general: [
      "Tell me about yourself.",
      "What are your greatest strengths?",
      "What's your biggest area for improvement?",
      "Why are you interested in this position?",
      "Describe a challenge you overcame at work.",
      "Where do you see yourself in 5 years?",
      "How do you handle constructive feedback?",
      "Describe your ideal work environment.",
      "What motivates you to do your best work?",
      "Do you have any questions for us?"
    ]
  };

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
  const [transcribedAnswer, setTranscribedAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const openrouterApiKey = 'YOUR_OPENROUTER_API_KEY'; 

 
  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      let finalTranscript = '';
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
       
        setTranscribedAnswer(finalTranscript.trim());
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };


  const startListeningForAnswer = () => {
    if (recognitionRef.current && !isListening) {
      setTranscribedAnswer('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

 
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  
  const getNextQuestionFromAI = async (userAnswer) => {
    setAiLoading(true);
    
    try {
      const messages = [
        {
          role: 'system',
          content: `You are an AI interviewer for a ${interviewType === 'software' ? 'Software Engineering' : 'General Job'} interview. 
          Based on the user's previous answer, ask the NEXT interview question. 
          You can ask a follow-up question OR a completely new question about a different topic.
          Keep questions concise (20-30 words max). Be professional and natural.
          Return ONLY the question text, nothing else.`
        },
        {
          role: 'user',
          content: `Previous question asked: "${currentQuestion}"\n\nUser's answer: "${userAnswer}"\n\nAsk the next interview question based on this answer.`
        }
      ];
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: messages,
          max_tokens: 100,
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
      throw new Error('API failed');
      
    } catch (error) {
      console.error('API error, using fallback:', error);
      return getFallbackQuestion();
    } finally {
      setAiLoading(false);
    }
  };

 
  const getFallbackQuestion = () => {
    const questions = fallbackQuestions[interviewType] || fallbackQuestions.general;
    const nextIndex = fallbackIndex % questions.length;
    setFallbackIndex(prev => prev + 1);
    return questions[nextIndex];
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
      startListeningForAnswer();
    }, 500);
  };

  
  const handleNextQuestion = async () => {
    if (!waitingForAnswer) return;
    
    
    stopListening();
    setWaitingForAnswer(false);
    
  
    const userAnswer = transcribedAnswer || "[User's answer captured in video]";
    
    
    setConversationHistory(prev => [...prev, 
      { role: 'user', content: userAnswer },
      { role: 'assistant', content: currentQuestion }
    ]);
    
   
    if (recordingTime >= (interviewDuration * 60) - 10) {
      await speakText("Time's up! Thank you for your participation.");
      stopRecordingAndGenerateReport();
      return;
    }
    
    
    const nextQuestion = await getNextQuestionFromAI(userAnswer);
    setCurrentQuestionNum(prev => prev + 1);
    
   
    setTimeout(() => askQuestion(nextQuestion), 500);
  };

  
  const startRecording = async () => {
    if (permissionStatus.camera !== 'granted' || permissionStatus.microphone !== 'granted') {
      show('Please grant permissions first', 'error');
      return;
    }
    
    try {
      
      initSpeechRecognition();
      
    
      setConversationHistory([]);
      setCurrentQuestionNum(1);
      setFallbackIndex(0);
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
              handleTimeUp();
            }
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
      
      const firstQuestion = getFallbackQuestion();
      setCurrentQuestion(firstQuestion);
      setConversationHistory([{ role: 'assistant', content: firstQuestion }]);
     

      await speakText(`Welcome to your ${interviewType} interview practice. You have ${interviewDuration} minutes.`);
      setTimeout(() => askQuestion(firstQuestion), 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      show('Could not start recording', 'error');
    }
  };

  
  const handleTimeUp = async () => {
    stopListening();
    await speakText("Time's up! Thank you for your participation.");
    stopRecordingAndGenerateReport();
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
      
      if (!response.ok) {
        throw new Error('Server upload failed');
      }
      
      console.log('✅ Video saved');
      show('Interview video saved!', 'success');
      
    } catch (error) {
      console.error('Server error, saving locally:', error);
      
      
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
    const score = Math.min(100, Math.floor((answeredQuestions / Math.max(totalQuestions, 1)) * 100));
    
    let feedback = '';
    let level = '';
    
    if (score >= 80) {
      level = 'Excellent';
      feedback = 'Great job! You handled the interview very well. Your responses were comprehensive and showed good communication skills.';
    } else if (score >= 60) {
      level = 'Good';
      feedback = 'Good effort! You answered most questions well. Consider providing more detailed examples in your responses.';
    } else if (score >= 40) {
      level = 'Average';
      feedback = 'You have a good foundation. Practice structuring your answers using the STAR method.';
    } else {
      level = 'Needs Improvement';
      feedback = 'Keep practicing! Focus on speaking clearly and providing specific examples in your answers.';
    }
    
    return { totalQuestions, answeredQuestions, score, level, feedback, duration: recordingTime };
  };

  
  const stopRecordingAndGenerateReport = () => {
    stopListening();
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerInterval) clearInterval(timerInterval);
      window.speechSynthesis.cancel();
      
      setInterviewStarted(false);
      setShowResults(true);
      
      show('Interview completed!', 'success');
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
      stopListening();
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
        <p>AI speaks | Your answers transcribed (hidden) | Dynamic next questions | Full video recording</p>
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
                <button 
                  onClick={handleNextQuestion} 
                  className="btn-success"
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Generating next question...' : 'Next Question →'}
                </button>
              )}
              <button onClick={stopRecordingAndGenerateReport} className="btn-danger">
                Stop Interview
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
                <div className="progress-stats">
                  <span>Question {currentQuestionNum}</span>
                  <span>Time: {formatTime(recordingTime)} / {formatTime(interviewDuration * 60)}</span>
                </div>
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
                      <span>🎤 Your turn to speak (listening...)</span>
                    </div>
                  ) : (
                    <div className="waiting-indicator">
                      <span>⏳ Processing...</span>
                    </div>
                  )}
                </div>

                {currentQuestion && (
                  <div className="question-card">
                    <h3>Current Question</h3>
                    <div className="question-text">
                      <p>{currentQuestion}</p>
                    </div>
                  </div>
                )}

                {waitingForAnswer && (
                  <div className="answer-controls">
                    <button 
                      onClick={handleNextQuestion} 
                      className="btn-primary btn-block"
                      disabled={aiLoading}
                    >
                      {aiLoading ? 'Generating next question...' : '✓ Next Question →'}
                    </button>
                  </div>
                )}
              </div>

              <div className="interview-tips">
                <h4>📋 How this works:</h4>
                <ul>
                  <li>AI speaks each question aloud</li>
                  <li>Your answers are transcribed in the background (not shown)</li>
                  <li>AI generates the next question based on your answer</li>
                  <li>Click "Next Question" when you finish speaking</li>
                  <li>If AI fails, pre-defined questions are used automatically</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="results-panel">
              <div className="results-header">
                <h3>🎉 Interview Complete!</h3>
                <p>Here's your performance summary</p>
              </div>

              {(() => {
                const report = generateReport();
                return (
                  <>
                    <div className="score-circle">
                      <div className="score-number">{report.score}%</div>
                      <div className="score-label">{report.level}</div>
                    </div>

                    <div className="report-stats">
                      <div className="stat-item">
                        <span className="stat-label">Questions Asked</span>
                        <span className="stat-value">{report.totalQuestions}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Questions Answered</span>
                        <span className="stat-value">{report.answeredQuestions}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Duration</span>
                        <span className="stat-value">{formatTime(report.duration)}</span>
                      </div>
                    </div>

                    <div className="feedback-section">
                      <h4>📝 Feedback</h4>
                      <p>{report.feedback}</p>
                    </div>

                    <div className="action-buttons">
                      <button onClick={() => navigate('/communication')} className="btn-primary">
                        ← Back
                      </button>
                      <button onClick={() => {
                        setShowResults(false);
                        setCurrentQuestionNum(1);
                        setRecordingTime(0);
                        setConversationHistory([]);
                        setWaitingForAnswer(false);
                        setFallbackIndex(0);
                      }} className="btn-secondary">
                        ↻ Start New Interview
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default InterviewPractice;