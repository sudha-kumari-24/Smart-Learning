import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useStudyTimer } from '../hooks/useStudyTimer';
import SimpleReferenceVideoDetector from './SimpleReferenceVideoDetector';
import './PostureAssistant.css';

const WS_URL = 'ws://localhost:8000/ws/posture';

function PostureAssistant() {
  const location = useLocation();
  const exerciseType = location.state?.exerciseType || 'study_default';

 
  const [detectionOn, setDetectionOn] = useState(false);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('idle');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [landmarks, setLandmarks] = useState([]);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [lastSpokenTime, setLastSpokenTime] = useState(0);
  const [timerManuallyStarted, setTimerManuallyStarted] = useState(false);
  const [referenceLandmarks, setReferenceLandmarks] = useState([]);
  const [showReferenceLandmarks, setShowReferenceLandmarks] = useState(false);


  const videoRef = useRef(null);
  const landmarksCanvasRef = useRef(null);
  const wsRef = useRef(null);
  const speechRef = useRef(null);
  const lastDrawTimeRef = useRef(0);
  const lastStatusRef = useRef('idle');


  const { seconds, isRunning, start, pause, reset } = useStudyTimer();
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;


  const saveTimerProgress = useCallback(async () => {
    if (!seconds || seconds <= 0) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/analytics/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: "demo_user", 
          seconds: seconds,
          sessionType: 'posture' 
        })
      });
      const data = await response.json();
      console.log('Timer saved:', data);
    } catch (err) {
      console.error('Failed to save timer:', err);
    }
  }, [seconds]);

  
  const handlePauseTimer = () => {
    pause();
    setTimerManuallyStarted(false);
    saveTimerProgress(); 
  };

 
  const speak = useCallback((text) => {
    const now = Date.now();
    if (now - lastSpokenTime < 15000) return;

    if (!speechRef.current) {
      speechRef.current = new SpeechSynthesisUtterance();
      speechRef.current.rate = 1.0;
      speechRef.current.pitch = 1.0;
      speechRef.current.volume = 1.0;
    }

    window.speechSynthesis.cancel();
    speechRef.current.text = text;
    window.speechSynthesis.speak(speechRef.current);
    setLastSpokenTime(now);
  }, [lastSpokenTime]);

 
  useEffect(() => {
    const hasPerson = landmarks && landmarks.length > 10 && 
      landmarks[11] && landmarks[11].x !== undefined &&
      landmarks[12] && landmarks[12].x !== undefined;

    if (timerManuallyStarted) {
      if (hasPerson && !isRunning) {
        start();
        console.log("✅ Person detected - Timer resumed");
      } else if (!hasPerson && isRunning) {
        pause();
        console.log("👤 No person detected - Timer paused");
      }
    }
  }, [landmarks, isRunning, timerManuallyStarted, start, pause]);

 
  const drawLandmarksOnCanvas = useCallback((landmarksArray, currentStatus) => {
    if (!landmarksCanvasRef.current || !landmarksArray || landmarksArray.length === 0) {
      return;
    }

    const canvas = landmarksCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }
    } else {
      canvas.width = 640;
      canvas.height = 480;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    const lineColor = currentStatus === 'correct' ? '#00FF00' : '#FF0000';
    const pointColor = currentStatus === 'correct' ? '#00FF00' : '#FF0000';

    ctx.lineWidth = 3;
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = pointColor;

    const POSE_CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 7],
      [10, 9], [9, 8], [8, 4], [4, 5],
      [11, 23], [12, 24],
      [11, 13], [12, 14],
      [13, 15], [14, 16],
      [23, 25], [24, 26],
      [25, 27], [26, 28],
      [11, 12],
      [23, 24]
    ];

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      if (landmarksArray[startIdx] && landmarksArray[endIdx] &&
        landmarksArray[startIdx].x !== undefined &&
        landmarksArray[endIdx].x !== undefined) {
        ctx.beginPath();
        ctx.moveTo(landmarksArray[startIdx].x * canvas.width, landmarksArray[startIdx].y * canvas.height);
        ctx.lineTo(landmarksArray[endIdx].x * canvas.width, landmarksArray[endIdx].y * canvas.height);
        ctx.stroke();
      }
    });

    landmarksArray.forEach((landmark, index) => {
      if (landmark && landmark.x !== undefined && landmark.y !== undefined) {
        const radius = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index) ? 5 : 3;
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }, []);

  
  useEffect(() => {
    if (!landmarksCanvasRef.current) return;
    const canvas = landmarksCanvasRef.current;
    if (showLandmarks) {
      canvas.style.opacity = '1';
      canvas.style.visibility = 'visible';
    } else {
      canvas.style.opacity = '0';
      setTimeout(() => {
        if (!showLandmarks && canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.style.visibility = 'hidden';
        }
      }, 150);
    }
  }, [showLandmarks]);

  
  useEffect(() => {
    if (!detectionOn) {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      return;
    }

    console.log("🎥 Setting up webcam...");

    navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      audio: false
    }).then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log("Video play error:", e));
        console.log("✅ Webcam started");
      }
    }).catch(err => {
      console.error('❌ Webcam error:', err);
      setDetectionOn(false);
      setStatus('idle');
      setComment('Failed to access camera. Please check permissions.');
    });

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [detectionOn]);


  useEffect(() => {
    if (!detectionOn) return;

    console.log("🟡 Starting WebSocket connection...");
    setConnectionStatus('connecting');

    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log('🟢 WebSocket CONNECTED');
      setConnectionStatus('connected');
      wsRef.current.send(JSON.stringify({
        exercise_type: exerciseType,
        user_id: "demo_user"
      }));
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'ready') {
          console.log("✅ Server ready for frames");
          return;
        }

        if (data.status) {
          setStatus(data.status);
          lastStatusRef.current = data.status;
        }

        if (data.message || data.comment) {
          const newComment = data.message || data.comment;
          setComment(newComment);
          if (data.status === 'incorrect' && newComment) speak(newComment);
          else if (data.status === 'correct' && Math.random() < 0.1) speak("Good posture");
        }

        if (data.landmarks && Array.isArray(data.landmarks)) {
          setLandmarks(data.landmarks);
          if (showLandmarks) {
            requestAnimationFrame(() => {
              drawLandmarksOnCanvas(data.landmarks, data.status);
            });
          }
        }

        if (data.visualized_frame && videoRef.current) {
          const img = new Image();
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(function (blob) {
              if (blob) {
                const url = URL.createObjectURL(blob);
                videoRef.current.src = url;
                if (videoRef.current._previousBlobUrl) URL.revokeObjectURL(videoRef.current._previousBlobUrl);
                videoRef.current._previousBlobUrl = url;
              }
            }, 'image/jpeg');
          };
          img.src = `data:image/jpeg;base64,${data.visualized_frame}`;
        }
      } catch (err) {
        console.error("❌ JSON parse error:", err);
      }
    };

    wsRef.current.onerror = (error) => console.error('❌ WebSocket error:', error);
    wsRef.current.onclose = () => {
      console.log('🔴 WebSocket CLOSED');
      setConnectionStatus('disconnected');
      if (detectionOn) {
        setStatus('idle');
        setComment('Connection lost');
        setLandmarks([]);
      }
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (videoRef.current?._previousBlobUrl) URL.revokeObjectURL(videoRef.current._previousBlobUrl);
    };
  }, [detectionOn, exerciseType, speak, drawLandmarksOnCanvas, showLandmarks]);

  
  useEffect(() => {
    if (!detectionOn || !wsRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let isSending = false;
    let sendInterval;

    const checkVideoReady = () => {
      const video = videoRef.current;
      return video && video.readyState === 4 && video.videoWidth > 0;
    };

    const sendFrame = () => {
      if (isSending || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      if (!checkVideoReady()) return;

      isSending = true;
      try {
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        const dataURL = canvas.toDataURL('image/jpeg', 0.7);
        const base64Data = dataURL.split(',')[1];
        wsRef.current.send(base64Data);
      } catch (error) {
        console.error("Error capturing frame:", error);
      } finally {
        isSending = false;
      }
    };

    const readyCheck = setInterval(() => {
      if (checkVideoReady()) {
        clearInterval(readyCheck);
        sendInterval = setInterval(sendFrame, 100);
      }
    }, 500);

    return () => {
      clearInterval(readyCheck);
      if (sendInterval) clearInterval(sendInterval);
    };
  }, [detectionOn]);

  const handleReferenceLandmarks = useCallback((landmarksData) => {
    setReferenceLandmarks(landmarksData);
  }, []);

  const toggleDetection = () => {
    if (detectionOn) {
      setDetectionOn(false);
      setStatus('idle');
      setComment('');
      setLandmarks([]);
      setConnectionStatus('disconnected');
      if (landmarksCanvasRef.current) {
        const ctx = landmarksCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, landmarksCanvasRef.current.width, landmarksCanvasRef.current.height);
      }
    } else {
      setDetectionOn(true);
      setStatus('connecting');
      setComment('Starting camera and connection...');
    }
  };

  return (
    <section className="page posture-page">
      <header className="page-header">
        <span style={{ float: 'right', textAlign: 'center' }}>
          <span style={{ fontSize: 28, fontFamily: 'monospace' }}>
            {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <br />
          <span style={{ display: 'flex', justifyContent: 'center', gap: 15, marginTop: 10 }}>
            <button className="timer-btn start" onClick={() => { start(); setTimerManuallyStarted(true); }} disabled={isRunning}>
              ⏵ Start Timer
            </button>
            <button className="timer-btn pause" onClick={handlePauseTimer} disabled={!isRunning}>
              ❚❚ Pause Timer
            </button>
          </span>
        </span>
        <h2>Posture & Exercise Assistant</h2>
        <p>Reference video + real-time posture guidance</p>
      </header>

      <div className="posture-container">
        {/* Reference Video */}
        <div className="reference-video">
          <SimpleReferenceVideoDetector
            exerciseType={exerciseType}
            showLandmarks={showReferenceLandmarks}
            onToggleLandmarks={() => setShowReferenceLandmarks(!showReferenceLandmarks)}
            onLandmarksDetected={handleReferenceLandmarks}
          />
        </div>

       
        <div className="live-detection">
          <h3>
            Live Detection
            <span style={{
              marginLeft: '10px',
              fontSize: '14px',
              color: connectionStatus === 'connected' ? 'green' : connectionStatus === 'connecting' ? 'orange' : 'red'
            }}>
              {connectionStatus === 'connected' ? '🟢 Connected' : connectionStatus === 'connecting' ? '🟡 Connecting...' : '🔴 Disconnected'}
            </span>
          </h3>

          <div className="live-canvas">
            {!detectionOn ? (
              <div className="idle-state">
                <p>Click "Start Detection" to begin posture tracking</p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Status: {status.toUpperCase()}</p>
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#000' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)', width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' }} />
                <canvas ref={landmarksCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: 'scaleX(-1)', mixBlendMode: 'screen' }} />
                <button onClick={() => setShowLandmarks(!showLandmarks)} style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '8px 12px', backgroundColor: showLandmarks ? 'rgba(0, 100, 0, 0.8)' : 'rgba(100, 0, 0, 0.8)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backdropFilter: 'blur(4px)', fontWeight: 'bold' }}>
                  {showLandmarks ? '👁‍🗨 Hide Landmarks' : '👁 Show Landmarks'}
                </button>
              </div>
            )}
          </div>

          
          <div className="feedback">
            <div style={{
              padding: '15px',
              backgroundColor: status === 'correct' ? '#d4edda' : status === 'incorrect' ? '#f8d7da' : '#f0f0f0',
              borderRadius: '8px',
              border: `2px solid ${status === 'correct' ? '#28a745' : status === 'incorrect' ? '#dc3545' : '#6c757d'}`
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Status: <span style={{ color: status === 'correct' ? 'green' : status === 'incorrect' ? 'red' : '#555', marginLeft: '10px' }}>{status.toUpperCase()}</span>
              </p>
              <p className="comment-text">{comment || 'Waiting for detection...'}</p>
              {status === 'incorrect' && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                  <p style={{ fontWeight: 'bold', color: '#856404', marginBottom: '5px' }}>⚠️ Posture Issues:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'black' }}>
                    <li>Keep your spine straight</li>
                    <li>Align shoulders with hips</li>
                    <li>Keep head centered</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <button className="btn-primary" onClick={toggleDetection} style={{ marginTop: '20px', padding: '12px 24px', fontSize: '16px', backgroundColor: detectionOn ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {detectionOn ? <><span>⏹</span> Stop Posture Detection</> : <><span>▶</span> Start Posture Detection</>}
          </button>
        </div>
      </div>
    </section>
  );
}

export default PostureAssistant;