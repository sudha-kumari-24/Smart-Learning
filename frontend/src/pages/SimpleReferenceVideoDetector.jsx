import React, { useEffect, useRef, useState } from 'react';

import breathingVideo from '../assets/exercise_videos/breathing.mp4';
import bodyScanVideo from '../assets/exercise_videos/body_scan.mp4';
import focusResetVideo from '../assets/exercise_videos/focus_reset.mp4';
import deskStretchVideo from '../assets/exercise_videos/desk_stretch.mp4';
import neckShoulderVideo from '../assets/exercise_videos/neck_shoulder.mp4';
import eyeExerciseVideo from '../assets/exercise_videos/eye_exercise.mp4';
import studyDefaultVideo from '../assets/exercise_videos/study_default.mp4';

const videoMap = {
  breathing: breathingVideo,
  body_scan: bodyScanVideo,
  focus_reset: focusResetVideo,
  desk_stretch: deskStretchVideo,
  neck_shoulder: neckShoulderVideo,
  eye_exercise: eyeExerciseVideo,
  study_default: studyDefaultVideo
};

const SimpleReferenceVideoDetector = ({ 
  exerciseType = 'study_default',
  showLandmarks = false,
  onToggleLandmarks,
  onLandmarksDetected 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPoseReady, setIsPoseReady] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (!showLandmarks) return;

    const initMediaPipe = () => {
      if (window.Pose) {
        setupPoseDetector();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
      script.onload = setupPoseDetector;
      script.onerror = () => console.error('Failed to load MediaPipe');
      document.head.appendChild(script);
    };

    const setupPoseDetector = () => {
      try {
        poseRef.current = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        
        poseRef.current.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          selfieMode: false
        });
        
        poseRef.current.onResults(onPoseResults);
        setIsPoseReady(true);
        console.log('MediaPipe Pose ready for reference video');
      } catch (err) {
        console.error('Pose detector error:', err);
      }
    };

    initMediaPipe();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (poseRef.current) poseRef.current.close();
    };
  }, [showLandmarks]);

 
  const onPoseResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (canvas.width !== videoRef.current.videoWidth) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
      if (onLandmarksDetected) {
        onLandmarksDetected(results.poseLandmarks);
      }
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00FF00';
      ctx.fillStyle = '#00FF00';
      
      const connections = [
        [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
        [11, 23], [12, 24], [23, 24],
        [23, 25], [25, 27], [24, 26], [26, 28]
      ];
      
      connections.forEach(([start, end]) => {
        const p1 = results.poseLandmarks[start];
        const p2 = results.poseLandmarks[end];
        if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
        }
      });
      
      results.poseLandmarks.forEach((landmark) => {
        if (landmark.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
  };

  
  useEffect(() => {
    if (!showLandmarks || !isPoseReady || !videoRef.current) return;
    
    const detectFrame = async () => {
      if (videoRef.current && !videoRef.current.paused && videoRef.current.readyState >= 2) {
        try {
          await poseRef.current.send({ image: videoRef.current });
        } catch (err) {}
      }
      animationFrameRef.current = requestAnimationFrame(detectFrame);
    };
    
    animationFrameRef.current = requestAnimationFrame(detectFrame);
    
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [showLandmarks, isPoseReady]);

  const videoSrc = videoMap[exerciseType] || studyDefaultVideo;

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="simple-reference-detector">
      <div className="detector-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0 }}>Reference Video</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={togglePlayPause}
            disabled={!videoLoaded}
            style={{
              padding: '6px 12px',
              backgroundColor: isPlaying ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: videoLoaded ? 'pointer' : 'not-allowed',
              fontSize: '12px'
            }}
          >
            {isPlaying ? '⏸ Pause Video' : '▶ Play Video'}
          </button>
          {onToggleLandmarks && (
            <button
              onClick={onToggleLandmarks}
              style={{
                padding: '6px 12px',
                backgroundColor: showLandmarks ? '#dc3545' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showLandmarks ? '🔴 Hide Landmarks' : '🟢 Show Landmarks'}
            </button>
          )}
        </div>
      </div>
      
      <div style={{ position: 'relative', width: '100%', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          loop
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onLoadedData={() => setVideoLoaded(true)}
        />
        {showLandmarks && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
      
      {showLandmarks && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#4ade80', textAlign: 'center' }}>
          🟢 Pose detection active - Green landmarks show reference posture
        </div>
      )}
    </div>
  );
};

export default SimpleReferenceVideoDetector;