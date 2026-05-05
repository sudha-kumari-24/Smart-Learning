import tickSound from '../assets/tick.mp3';


import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AnalogClock from './AnalogClock';


function StudyTimer({ onPause }) {
    const { user } = useAuth();

    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);

    const intervalRef = useRef(null);
    const tickAudioRef = useRef(null);

    // ---------- LOAD TICK SOUND ----------
    useEffect(() => {
        tickAudioRef.current = new Audio(tickSound);
        tickAudioRef.current.loop = true;
        tickAudioRef.current.volume = 0.5;
    }, []);

    // ---------- START TIMER ----------
    const startTimer = () => {
        if (isRunning) return;

        setIsRunning(true);

        tickAudioRef.current?.play();

        intervalRef.current = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
    };

    // ---------- PAUSE TIMER ----------
    const pauseTimer = async () => {
    if (!isRunning) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    tickAudioRef.current?.pause();

    if (!user?.id || seconds <= 0) return;

    try {
        await axios.post('http://localhost:5000/api/analytics/update', {
            userId: user.id,
            seconds
        });

        if (onPause) {
            onPause(seconds); // 👈 updates Profile total
        }

        setSeconds(0); // reset local timer
    } catch (err) {
        console.error('Failed to save progress', err);
    }
};


    // ---------- CLEANUP ----------
    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
            tickAudioRef.current?.pause();
        };
    }, []);

    // ---------- UI ----------
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
                justifyContent:'center'
            }}>
                {String(hours).padStart(2, '0')}:
                {String(mins).padStart(2, '0')}:
                {String(secs).padStart(2, '0')}
            </div>




            <div style={{ display: 'flex', gap: 20, marginTop: 10, justifyContent:'center' }}>
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
