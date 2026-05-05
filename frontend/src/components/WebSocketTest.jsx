import React, { useEffect, useState } from 'react';

function WebSocketTest() {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/test');

    ws.onopen = () => setStatus('connected');
    ws.onerror = () => setStatus('error');
    ws.onclose = () => setStatus('closed');

    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h3>WebSocket Test</h3>
      <p>Status: <b>{status}</b></p>
    </div>
  );
}

export default WebSocketTest;
