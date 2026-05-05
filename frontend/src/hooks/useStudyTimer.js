import { useEffect, useRef, useState } from 'react';
import tickSound from '../assets/tick.mp3';

export function useStudyTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const intervalRef = useRef(null);
  const tickAudioRef = useRef(null);

  useEffect(() => {
    tickAudioRef.current = new Audio(tickSound);
    tickAudioRef.current.loop = true;
    tickAudioRef.current.volume = 0.5;

    return () => {
      clearInterval(intervalRef.current);
      tickAudioRef.current?.pause();
    };
  }, []);

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    tickAudioRef.current?.play();

    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const pause = () => {
    if (!isRunning) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    tickAudioRef.current?.pause();
  };

  const reset = () => setSeconds(0);

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
  };
}
