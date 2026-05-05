import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './CommTrainer.css';


import interview from '../assets/comm/interview.jpg';
import interact from '../assets/comm/interact.jpg';
import writing from '../assets/comm/writing.jpg';


function CommTrainer() {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user || null;
  const { show } = useNotification();

  const [permissionStatus, setPermissionStatus] = useState({
    camera: 'checking',
    microphone: 'checking'
  });

  useEffect(() => {
    // Check permissions on load
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check camera permission
      const cameraPermission = await navigator.permissions.query({ name: 'camera' });
      setPermissionStatus(prev => ({ ...prev, camera: cameraPermission.state }));
      
      // Check microphone permission
      const micPermission = await navigator.permissions.query({ name: 'microphone' });
      setPermissionStatus(prev => ({ ...prev, microphone: micPermission.state }));
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handleInterviewPractice = () => {
    if (!user) {
      show('Please login to access interview practice', 'error');
      return;
    }
    
    if (permissionStatus.camera !== 'granted' || permissionStatus.microphone !== 'granted') {
      show('Camera and microphone permissions are required for interview practice', 'warning');
    }
    
    navigate('/interview-scenarios');
  };

  const handleConversationPractice = () => {
    if (!user) {
      show('Please login to access conversation practice', 'error');
      return;
    }
    
    if (permissionStatus.microphone !== 'granted') {
      show('Microphone permission is required for conversation practice', 'warning');
    }
    
    navigate('/conversation-practice');
  };

  const handleWritingPractice = () => {
    if (!user) {
      show('Please login to access writing practice', 'error');
      return;
    }
    navigate('/writing-practice');
  };

  const handleRequestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      show('Camera and microphone permissions granted!', 'success');
      checkPermissions();
    } catch (error) {
      show('Failed to get permissions. Please allow access in browser settings.', 'error');
    }
  };

  return (
    <section className="page comm-page">
      <header className="page-header">
        <h2>Communication Trainer</h2>
        <p>Practice speaking, listening, and writing with AI‑guided scenarios.</p>
        
        {(!user || permissionStatus.camera !== 'granted' || permissionStatus.microphone !== 'granted') && (
          <div className="permission-alert">
            {!user && (
              <p className="alert-text">⚠️ Login required to save your progress</p>
            )}
            {(permissionStatus.camera !== 'granted' || permissionStatus.microphone !== 'granted') && (
              <div className="permission-status">
                <p>Required permissions:</p>
                <ul>
                  <li>📷 Camera: {permissionStatus.camera === 'granted' ? '✅ Granted' : '❌ Not granted'}</li>
                  <li>🎤 Microphone: {permissionStatus.microphone === 'granted' ? '✅ Granted' : '❌ Not granted'}</li>
                </ul>
                <button 
                  onClick={handleRequestPermissions}
                  className="btn-primary-sm"
                >
                  Grant Permissions
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="comm-layout">
        {/* Interview Practice Box */}
        <div className="card comm-card">
          <div className="comm-card-image">
            <img 
              src={interview}
              alt="Interview Practice" 
              className="comm-img"
            />
          </div>
          <h3>Interview Practice</h3>
          <p>Simulated interviews with video recording and keyword analysis.</p>
          <button 
            className="btn-primary-sm" 
            onClick={handleInterviewPractice}
            disabled={!user}
          >
            Explore Interviews
          </button>
          {!user && <p className="login-hint">Login required</p>}
        </div>

        {/* Live Conversation Box */}
        <div className="card comm-card">
          <div className="comm-card-image">
            <img 
              src={interact} 
              alt="Live Conversation" 
              className="comm-img"
            />
          </div>
          <h3>Live Conversation</h3>
          <p>Practice real-life scenarios with instant pronunciation feedback.</p>
          <button 
            className="btn-primary-sm" 
            onClick={handleConversationPractice}
            disabled={!user}
          >
            Start Conversation
          </button>
          {!user && <p className="login-hint">Login required</p>}
        </div>

        {/* Writing Practice Box */}
        <div className="card comm-card">
          <div className="comm-card-image">
            <img 
              src={writing}
              alt="Writing Practice" 
              className="comm-img"
            />
          </div>
          <h3>Writing Practice</h3>
          <p>Improve writing skills with grammar and style corrections.</p>
          <button 
            className="btn-primary-sm" 
            onClick={handleWritingPractice}
            disabled={!user}
          >
            Practice Writing
          </button>
          {!user && <p className="login-hint">Login required</p>}
        </div>
      </div>
    </section>
  );
}

export default CommTrainer;