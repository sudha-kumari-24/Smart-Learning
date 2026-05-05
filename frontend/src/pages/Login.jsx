import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';



// for running first check the backend then frontend then backend again otherwise it will show fatch error.
// to see proper connections only works in backend.

// http://localhost:5000/api/health






function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false); // Safe addition

    const { saveAuth } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Email and password are required');
            return;
        }

        setLoading(true);

        console.log('LOGIN CLICKED', email, password);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                }),
            });

            console.log('Response status:', res.status);

            const data = await res.json();
            console.log('Response data:', data);

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            saveAuth(data.user, data.token);
            navigate('/');
        } catch (err) {
            console.error('LOGIN ERROR:', err);
            setError(err.message);
        } finally {
            setLoading(false);
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
            if (!res.ok) throw new Error(data.message || 'Google login failed');

            saveAuth(data.user, data.token);
            navigate('/');
        } catch (err) {
            console.error(err);
            // optionally show error on screen
        }
    }

    function handleGoogleError() {
        console.error('Google sign-in failed');
    }

    return (
        <section className="page auth-page auth-split">
            {/* Left image panel */}

            <div className="auth-visual">
                {/* <img src="../assets/signin scholars.png" alt="Hello Student" /> */}
                <div className="auth-image-layer" />
                <div className="auth-visual-content">
                    <span className="auth-pill">
                        <span className="pill-dot" /> SmartLearning
                    </span>
                    <h2>Study calmer, perform better.</h2>
                    <p>Track progress, get AI tips, and keep your mind relaxed while you learn.</p>
                    <ul className="auth-benefits">
                        <li>⚡ AI study guidance</li>
                        <li>🧠 Mood‑aware suggestions</li>
                        <li>📊 Visual progress analytics</li>
                    </ul>
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth-panel">
                <header className="auth-header">
                    <h2>Sign in</h2>
                    <p>Welcome back, continue your learning journey.</p>
                </header>

                <div className="auth-card">


                    {error && <p className="error-text">{error}</p>}

                    {/* Google button */}
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        shape="pill"
                        width="100%"
                        text="continue_with"
                        theme="outline"
                    />

                    <div className="auth-divider">
                        <span>or use email</span>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <label>
                            Email
                            <div className="input-with-icon">
                                <span className="input-icon">📧</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </label>

                        <label>
                            Password
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Your password"
                                    required
                                />
                            </div>
                        </label>

                        <button className="btn-primary wide" type="submit">
                            Sign in
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default Login;
