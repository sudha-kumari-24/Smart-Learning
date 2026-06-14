import tickSound from '../assets/tick.mp3';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AnalogClock from './AnalogClock';

function StudyTimer({ onPause, isMuted = false }) {
    const { user } = useAuth();

    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);

    const intervalRef = useRef(null);
    const tickAudioRef = useRef(null);

  
    useEffect(() => {
        tickAudioRef.current = new Audio(tickSound);
        tickAudioRef.current.loop = true;
        tickAudioRef.current.volume = 0.5;
    }, []);

   
    useEffect(() => {
        if (tickAudioRef.current) {
            if (!isMuted && isRunning) {
                tickAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
            } else {
                tickAudioRef.current.pause();
            }
        }
    }, [isMuted, isRunning]);

   
    const startTimer = () => {
        if (isRunning) return;

        setIsRunning(true);

        if (!isMuted && tickAudioRef.current) {
            tickAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }

        intervalRef.current = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
    };

    
    const pauseTimer = async () => {
        if (!isRunning) return;

        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
        
        if (tickAudioRef.current) {
            tickAudioRef.current.pause();
        }

        if (!user?.id || seconds <= 0) return;

        try {
            await axios.post('http://localhost:5000/api/analytics/update', {
                userId: user.id,
                seconds,
                sessionType: 'timer'
            });

            if (onPause) {
                onPause(seconds);
            }

            setSeconds(0);
        } catch (err) {
            console.error('Failed to save progress', err);
        }
    };

   
    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
            if (tickAudioRef.current) {
                tickAudioRef.current.pause();
            }
        };
    }, []);

 
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return (
        <div style={{ marginTop: 20 }}>
            <h3>Study Timer</h3>

            <AnalogClock seconds={seconds} />

            <div style={{
                fontSize: 32,
                fontFamily: 'monospace',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'center'
            }}>
                {String(hours).padStart(2, '0')}:
                {String(mins).padStart(2, '0')}:
                {String(secs).padStart(2, '0')}
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 10, justifyContent: 'center' }}>
                <button className="timer-btn start" onClick={startTimer} disabled={isRunning}>
                    ⏵
                </button>
                <button className="timer-btn pause" onClick={pauseTimer} disabled={!isRunning}>
                    ❚❚
                </button>
            </div>
        </div>
    );
}

export default StudyTimer;