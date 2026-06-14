
import React, { useEffect, useRef } from 'react';

const LandmarksOverlay = ({ 
  landmarks, 
  status, 
  width = 640, 
  height = 480,
  isVisible = true 
}) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !isVisible || !landmarks || landmarks.length === 0) return;
    
    const ctx = canvasRef.current.getContext('2d');
    drawLandmarks(ctx, landmarks, status, width, height);
  }, [landmarks, status, width, height, isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10
      }}
    />
  );
};


const drawLandmarks = (ctx, landmarks, status, width, height) => {

  ctx.clearRect(0, 0, width, height);
  
  if (!landmarks || landmarks.length === 0) return;
  
 
  const lineColor = status === 'correct' ? '#00ff00' : '#ff0000';
  const pointColor = status === 'correct' ? '#00cc00' : '#cc0000';
  
 
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  
  
  const connections = [
    [0, 1], [1, 2], [2, 3], 
  ];
  
  connections.forEach(([startIdx, endIdx]) => {
    if (landmarks[startIdx] && landmarks[endIdx]) {
      ctx.beginPath();
      ctx.moveTo(landmarks[startIdx].x * width, landmarks[startIdx].y * height);
      ctx.lineTo(landmarks[endIdx].x * width, landmarks[endIdx].y * height);
      ctx.stroke();
    }
  });
  
 
  ctx.fillStyle = pointColor;
  landmarks.forEach((landmark) => {
    if (landmark && landmark.x && landmark.y) {
      ctx.beginPath();
      ctx.arc(
        landmark.x * width,
        landmark.y * height,
        3, // radius
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  });
};

export default LandmarksOverlay;