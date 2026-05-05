// SimpleReferenceVideoDetector.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';

const SimpleReferenceVideoDetector = ({ 
  youtubeEmbed,
  showLandmarks = true,
  onToggleLandmarks 
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(0);
  const [landmarks, setLandmarks] = useState([]);
  const [simulatedTime, setSimulatedTime] = useState(0);

  // Simulate landmark movement (for demo purposes)
  const simulateLandmarks = useCallback((time) => {
    const baseLandmarks = [];
    
    // Create base perfect posture landmarks
    for (let i = 0; i < 33; i++) {
      let x, y;
      
      if (i === 0) { // Nose
        x = 0.5 + Math.sin(time * 0.001) * 0.02;
        y = 0.2 + Math.cos(time * 0.0005) * 0.01;
      } else if (i === 11) { // Left shoulder
        x = 0.4 + Math.sin(time * 0.002) * 0.01;
        y = 0.35;
      } else if (i === 12) { // Right shoulder
        x = 0.6 + Math.sin(time * 0.002) * 0.01;
        y = 0.35;
      } else if (i === 13) { // Left elbow
        x = 0.35 + Math.sin(time * 0.003) * 0.02;
        y = 0.45;
      } else if (i === 14) { // Right elbow
        x = 0.65 + Math.sin(time * 0.003) * 0.02;
        y = 0.45;
      } else if (i === 15) { // Left wrist
        x = 0.3 + Math.sin(time * 0.004) * 0.03;
        y = 0.55;
      } else if (i === 16) { // Right wrist
        x = 0.7 + Math.sin(time * 0.004) * 0.03;
        y = 0.55;
      } else if (i === 23) { // Left hip
        x = 0.45;
        y = 0.55 + Math.sin(time * 0.001) * 0.005;
      } else if (i === 24) { // Right hip
        x = 0.55;
        y = 0.55 + Math.sin(time * 0.001) * 0.005;
      } else {
        x = 0.5 + (Math.random() * 0.1 - 0.05);
        y = 0.2 + (i / 33 * 0.7);
      }
      
      // Add subtle movement
      x += Math.sin(time * 0.001 + i) * 0.01;
      y += Math.cos(time * 0.001 + i) * 0.01;
      
      baseLandmarks.push({ 
        x: Math.max(0.1, Math.min(0.9, x)), 
        y: Math.max(0.1, Math.min(0.9, y)),
        visibility: 1 
      });
    }
    
    return baseLandmarks;
  }, []);

  // Draw landmarks on canvas
  const drawLandmarks = useCallback(() => {
    if (!canvasRef.current || !showLandmarks) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (landmarks.length === 0) return;
    
    // Set drawing style - ALWAYS GREEN for reference
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00FF00';
    ctx.fillStyle = '#00FF00';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Define connections
    const POSE_CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 7], [7, 8], [8, 9], [9, 10], [10, 0], // Face
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [25, 27], [24, 26], [26, 28] // Legs
    ];
    
    // Draw connections
    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    });
    
    // Draw points
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility > 0.5) {
        const isKeyPoint = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index);
        const radius = isKeyPoint ? 4 : 2;
        
        ctx.beginPath();
        ctx.arc(
          landmark.x * width,
          landmark.y * height,
          radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });
  }, [landmarks, showLandmarks]);

  // Animation loop for simulated detection
  useEffect(() => {
    if (!showLandmarks || !isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }
    
    let frameCount = 0;
    let lastTime = performance.now();
    let lastFpsUpdate = lastTime;
    
    const animate = (currentTime) => {
      // Calculate FPS
      frameCount++;
      if (currentTime - lastFpsUpdate >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }
      
      // Update simulated time
      setSimulatedTime(prev => prev + 16); // ~60fps
      
      // Generate new landmarks
      const newLandmarks = simulateLandmarks(currentTime);
      setLandmarks(newLandmarks);
      
      // Draw landmarks
      drawLandmarks();
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showLandmarks, isPlaying, simulateLandmarks, drawLandmarks]);

  // Update canvas dimensions
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        drawLandmarks();
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [drawLandmarks]);

  // Simulate video play state based on iframe interaction
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source === containerRef.current?.querySelector('iframe')?.contentWindow) {
        // Handle YouTube player messages
        const data = event.data;
        if (data === 'playing') {
          setIsPlaying(true);
        } else if (data === 'paused') {
          setIsPlaying(false);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="simple-reference-detector">
      <div className="controls">
        <h3>Reference Video Analysis</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '6px 12px',
              backgroundColor: isPlaying ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'} Simulation
          </button>
          
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
                fontWeight: 'bold'
              }}
            >
              {showLandmarks ? '👁‍🗨 Hide Landmarks' : '👁 Show Landmarks'}
            </button>
          )}
        </div>
      </div>
      
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative',
          width: '100%',
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
          aspectRatio: '16/9'
        }}
      >
        {/* YouTube Video */}
        <iframe
          src={youtubeEmbed}
          title="Posture Reference"
          allowFullScreen
          frameBorder="0"
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
        
        {/* Landmarks Overlay */}
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
      
      {/* Stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '10px',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div>Status: <strong>{isPlaying ? 'Simulating' : 'Paused'}</strong></div>
        <div>FPS: <strong>{fps}</strong></div>
        <div>Landmarks: <strong>{landmarks.length}</strong></div>
        <div>Mode: <strong>Demo Simulation</strong></div>
      </div>
      
      <div style={{ 
        marginTop: '10px',
        padding: '10px',
        backgroundColor: 'rgba(0, 150, 0, 0.05)',
        borderRadius: '6px',
        fontSize: '12px'
      }}>
        <p style={{ margin: 0, color: '#006400' }}>
          <strong>Note:</strong> This is a simulation showing how pose detection would work on the reference video.
          Real detection would require video frame extraction from YouTube.
        </p>
      </div>
    </div>
  );
};

export default SimpleReferenceVideoDetector;