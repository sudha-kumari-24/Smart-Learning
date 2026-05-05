// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    course: '',
    institution: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        fullName: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        dateOfBirth: form.dob,
        address: form.address,
        classCourse: form.course,
        schoolCollege: form.institution,
      };

      console.log('SIGNUP PAYLOAD:', payload);

      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      saveAuth(data.user, data.token);
      navigate('/');
      
    } catch (err) {
      console.error('SIGNUP ERROR:', err);
      setError(err.message);
    }
  }



  async function handleGoogleSuccess(credentialResponse) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google signup failed');

      saveAuth(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  function handleGoogleError() {
    setError('Google sign-up failed, please try again.');
  }

  return (
    <section className="page auth-page auth-split">
      {/* Left same visual as login */}
      <div className="auth-visual">
        <div className="auth-image-layer" />
        <div className="auth-visual-content">
          <span className="auth-pill">
            <span className="pill-dot" /> SmartLearning
          </span>
          <h2>Set up your student profile.</h2>
          <p>Tell us about your course so the AI can personalize your path.</p>
          <ul className="auth-benefits">
            <li>🎯 Course-specific plans</li>
            <li>📚 Smart reminders</li>
            <li>💬 Human + AI support</li>
          </ul>
        </div>
      </div>

     


      {/* Right side: signup form */}
      <div className="auth-panel">
        
        <header className="auth-header">
          <h2>Create student account</h2>
          <p>Just a few details to get a personalized dashboard.</p>
        </header>

        <div className="auth-card">


          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="pill"
            width="100%"
            text="signup_with"
            theme="outline"
          />

          <div className="auth-divider">
            <span>or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-grid">
            <div className="auth-field">
              <label>
                Full name
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
              </label>
            </div>

            <div className="auth-field">
              <label>
                Email
                <div className="input-with-icon">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </label>
            </div>

            <div className="auth-field">
              <label>
                Phone
                <div className="input-with-icon">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91..."
                    required
                  />
                </div>
              </label>
            </div>

            <div className="auth-field">
              <label>
                Date of birth
                <div className="input-with-icon">
                  <span className="input-icon">🎂</span>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
              </label>
            </div>

            <div className="auth-field auth-field-full">
              <label>
                Address
                <div className="input-with-icon">
                  <span className="input-icon">📍</span>
                  {/* <textarea
                    name="address"
                    rows="2"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="City, state, country"
                    required
                  /> */}

                  <input name="address"
                    type='text'
                    value={form.address}
                    onChange={handleChange}
                    placeholder="City, state, country"
                    required>
                  </input>


                </div>
              </label>
            </div>

            <div className="auth-field">
              <label>
                Class / Course
                <div className="input-with-icon">
                  <span className="input-icon">🎓</span>
                  <input
                    type="text"
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech CSE, Class 11"
                    required
                  />
                </div>
              </label>
            </div>

            <div className="auth-field">
              <label>
                School / College
                <div className="input-with-icon">
                  <span className="input-icon">🏫</span>
                  <input type="text"
                    name="institution"
                    value={form.institution}
                    onChange={handleChange}
                    placeholder="Institute name"
                    required
                  />
                </div>
              </label>
            </div>

            <div className="auth-field auth-field-full">
              <label>
                Password
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                </div>
              </label>
            </div>

            <div className="auth-actions">
              <button className="btn-primary wide" type="submit">
                Create account
              </button>
            </div>

             {error && <p className="error-text">{error}</p>}
             
          </form>
        </div>
      </div>
    </section>
  );
}

export default Signup;
