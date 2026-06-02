import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StressRelief.css';

import breathing from '../assets/exercise_img/breathing.png';
import body from '../assets/exercise_img/body_relax.jpg';
import focus from '../assets/exercise_img/focus_reset.png';
import desk from '../assets/exercise_img/desk_stretch.jpg';
import neck from '../assets/exercise_img/neck_shoulder_stretch.webp';
import eye from '../assets/exercise_img/eye.jpg';

function StressRelief() {
  const navigate = useNavigate();

  const handleStartPosture = (exerciseType) => {
    navigate('/posture-assistant', { state: { exerciseType } });
  };

  return (
    <section className="page stress-page">
      <header className="page-header">
        <h2>Stress Relief & Meditation</h2>
        <p>Quick exercises designed to reset your mind between study sessions.</p>
      </header>

      <div className="stress-grid">
        <div className="card">
          <h3>3‑Minute Breathing</h3>
          <p>Guided inhale–hold–exhale cycles with soft background visuals.</p>
          <img src={breathing} alt="Breathing exercise" />
          <button className="btn-primary-sm" onClick={() => handleStartPosture('breathing')}>
            Start Session
          </button>
        </div>

        <div className="card">
          <h3>Body Relaxing</h3>
          <p>Relax each part of your body slowly, from toes to head.</p>
          <img src={body} alt="Body relaxation" />
          <button className="btn-primary-sm" onClick={() => handleStartPosture('body_scan')}>
            Start Session
          </button>
        </div>

        <div className="card">
          <h3>Focus Reset</h3>
          <p>Short visualization to clear distractions before a focused block.</p>
          <img src={focus} alt="Focus reset" />
          <button className="btn-primary-sm" onClick={() => handleStartPosture('focus_reset')}>
            Start Session
          </button>
        </div>

        <div className="card">
          <h3>Desk Stretch</h3>
          <p>Simple stretches you can do at your desk to reduce tension.</p>
          <img src={desk} alt="Desk stretch" />
          <button className="btn-primary-sm" onClick={() => handleStartPosture('desk_stretch')}>
            Start Session
          </button>
        </div>

        <div className="card">
          <h3>Neck & Shoulder Relax</h3>
          <p>Focus on neck and shoulder muscles to relieve stiffness.</p>
          <img src={neck} alt="Neck and shoulder stretch" />
          <button className="btn-primary-sm" onClick={() => handleStartPosture('neck_shoulder')}>
            Start Session
          </button>
        </div>

        <div className="card">
          <h3>Eye Exercise</h3>
          <p>Protect your eyes with quick visual exercises between study sessions.</p>
          <img src={eye} alt="Eye exercise" />
          <button className="btn-primary-sm" onClick={() => handleStartPosture('eye_exercise')}>
            Start Session
          </button>
        </div>
      </div>
    </section>
  );
}

export default StressRelief;