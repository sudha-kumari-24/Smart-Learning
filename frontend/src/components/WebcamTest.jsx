// just to check if it is asking for opening the camera or not.

import React, { useEffect, useRef, useState } from 'react';

function WebcamTest() {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function startCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        setError(err.message);
      }
    }
    startCam();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h3>Webcam Test</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: 300, border: '2px solid black' }}
      />
    </div>
  );
}

export default WebcamTest;
