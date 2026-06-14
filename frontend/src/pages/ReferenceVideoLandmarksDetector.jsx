
import React, { useEffect, useRef, useState, useCallback } from 'react';

const ReferenceVideoLandmarksDetector = ({ 
  youtubeId,
  showLandmarks = true,
  onToggleLandmarks 
}) => {
  const videoContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fpsCounterRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(0);
  const [landmarksCount, setLandmarksCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const initMediaPipe = () => {
     
      if (window.Pose) {
        initializePoseDetector();
        return;
      }

     
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675472400/pose.js';
      script.onload = () => {
        console.log('✅ MediaPipe Pose loaded');
        initializePoseDetector();
      };
      script.onerror = (err) => {
        console.error('❌ Failed to load MediaPipe:', err);
        setError('Failed to load pose detection library');
      };
      
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };

    const initializePoseDetector = () => {
      try {
        poseRef.current = new window.Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        poseRef.current.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          selfieMode: false
        });

        poseRef.current.onResults(onPoseResults);
        setIsInitialized(true);
        console.log('✅ Pose detector initialized');
      } catch (err) {
        console.error('❌ Error initializing pose detector:', err);
        setError('Failed to initialize pose detector');
      }
    };

    initMediaPipe();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, []);

  
  const onPoseResults = useCallback((results) => {
    if (!canvasRef.current || !showLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
   
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
      const landmarks = results.poseLandmarks;
      setLandmarksCount(landmarks.length);
      
     
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00FF00';
      ctx.fillStyle = '#00FF00';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      
      const connections = window.POSE_CONNECTIONS || getDefaultConnections();
      
      connections.forEach(([start, end]) => {
        const startLandmark = landmarks[start];
        const endLandmark = landmarks[end];
        
        if (startLandmark && endLandmark && 
            startLandmark.visibility > 0.5 && endLandmark.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height);
          ctx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
          ctx.stroke();
        }
      });

     
      landmarks.forEach((landmark, index) => {
        if (landmark.visibility > 0.5) {
          const isKeyPoint = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index);
          const radius = isKeyPoint ? 4 : 2;
          
          ctx.beginPath();
          ctx.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            radius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });
    } else {
      setLandmarksCount(0);
    }
  }, [showLandmarks]);

  
  const getDefaultConnections = () => [
    [0, 1], [1, 2], [2, 3], [3, 7], [7, 8], [8, 9], [9, 10], [10, 0], // Face
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
    [11, 23], [12, 24], [23, 24], // Torso
    [23, 25], [25, 27], [24, 26], [26, 28] // Legs
  ];

  
  useEffect(() => {
    if (!youtubeId || !isInitialized) return;

    const loadYouTubePlayer = () => {
      if (!window.YT || !window.YT.Player) {
      
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = initializePlayer;
      } else {
        initializePlayer();
      }
    };

    const initializePlayer = () => {
      const player = new window.YT.Player('youtube-player-' + youtubeId, {
        videoId: youtubeId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 1,
          enablejsapi: 1
        },
        events: {
          onReady: (event) => {
            console.log('YouTube player ready');
            setupVideoCapture(event.target);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startDetection();
            } else {
              setIsPlaying(false);
              stopDetection();
            }
          },
          onError: (err) => {
            console.error('YouTube player error:', err);
            setError('Failed to load YouTube video');
          }
        }
      });
    };

    loadYouTubePlayer();
  }, [youtubeId, isInitialized]);

 
  const setupVideoCapture = (player) => {
    if (!canvasRef.current) return;

   
    const video = document.createElement('video');
    video.style.display = 'none';
    video.crossOrigin = 'anonymous';
    document.body.appendChild(video);

   
    const updateCanvasSize = () => {
      const container = videoContainerRef.current;
      if (container && canvasRef.current) {
        const rect = container.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

   
    const startDetection = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      let lastTime = performance.now();
      
      const detectLoop = () => {
        if (!isPlaying || !showLandmarks || !poseRef.current) {
          return;
        }

        try {
         
          const currentTime = performance.now();
          
        
          fpsCounterRef.current++;
          if (currentTime - lastFpsUpdateRef.current >= 1000) {
            setFps(fpsCounterRef.current);
            fpsCounterRef.current = 0;
            lastFpsUpdateRef.current = currentTime;
          }

         
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
           
          }

         
          animationFrameRef.current = requestAnimationFrame(detectLoop);
        } catch (err) {
          console.error('Detection error:', err);
          stopDetection();
        }
      };

      animationFrameRef.current = requestAnimationFrame(detectLoop);
    };

    const stopDetection = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      stopDetection();
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
    };
  };

 
  const startDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const detectLoop = () => {
      if (!isPlaying || !showLandmarks) return;
      
      fpsCounterRef.current++;
      const now = performance.now();
      
      if (now - lastFpsUpdateRef.current >= 1000) {
        setFps(fpsCounterRef.current);
        fpsCounterRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
      
      animationFrameRef.current = requestAnimationFrame(detectLoop);
    };

    animationFrameRef.current = requestAnimationFrame(detectLoop);
  }, [isPlaying, showLandmarks]);

  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  
  useEffect(() => {
    if (isPlaying && showLandmarks) {
      startDetection();
    } else {
      stopDetection();
    }
  }, [isPlaying, showLandmarks, startDetection, stopDetection]);

  if (error) {
    return (
      <div className="error-state">
        <p style={{ color: 'red' }}>{error}</p>
        <p>Using static reference landmarks instead.</p>
      </div>
    );
  }

  return (
    <div className="reference-video-detector">
      <div className="video-header" style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Reference Video Analysis</h3>
          {onToggleLandmarks && (
            <button
              onClick={onToggleLandmarks}
              style={{
                padding: '6px 12px',
                backgroundColor: showLandmarks ? 'rgba(0, 100, 0, 0.8)' : 'rgba(100, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {showLandmarks ? '👁‍🗨 Hide Landmarks' : '👁 Show Landmarks'}
            </button>
          )}
        </div>
        
        {showLandmarks && (
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginTop: '10px',
            fontSize: '13px',
            color: '#555'
          }}>
            <div>Status: <strong>{isInitialized ? 'Ready' : 'Loading...'}</strong></div>
            {isPlaying && <div>FPS: <strong>{fps}</strong></div>}
            <div>Landmarks: <strong>{landmarksCount}</strong></div>
          </div>
        )}
      </div>

      <div 
        ref={videoContainerRef}
        style={{ 
          position: 'relative',
          width: '100%',
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
          aspectRatio: '16/9'
        }}
      >
    
        <div 
          id={`youtube-player-${youtubeId}`}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
        
       
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      </div>

      <div style={{ 
        marginTop: '10px',
        padding: '10px',
        backgroundColor: 'rgba(0, 150, 0, 0.05)',
        borderRadius: '6px',
        fontSize: '13px'
      }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#006400' }}>
          <span style={{ color: '#00FF00', marginRight: '6px' }}>●</span>
          Real-time Pose Detection
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
          {showLandmarks 
            ? 'Green landmarks track the person\'s pose in the video. Play the video to see detection.'
            : 'Landmarks are hidden. Click "Show Landmarks" to enable detection.'}
        </p>
      </div>
    </div>
  );
};

export default ReferenceVideoLandmarksDetector;