import React, { useState, useEffect } from 'react';
import styles from './Timer.module.css';
import { useWakeLock } from '../hooks/useWakeLock';

const PRESETS = {
  short: 45,
  medium: 60,
  long: 75,
};

const DEBUG_PRESET = 2;

function Timer({ beepRef, isDebugMode }) {
  const [countdown, setCountdown] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [initialDuration, setInitialDuration] = useState(0);
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  useEffect(() => {
    let interval = null;
    if (isTimerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (isTimerActive && countdown === 0) {
      setIsTimerActive(false);
      if (beepRef.current) {
        playMultipleBeeps(5);
      }
      releaseWakeLock();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, countdown, beepRef, releaseWakeLock]);

  const playMultipleBeeps = (times) => {
    if (!beepRef.current) return;
    
    let playCount = 0;
    const playInterval = setInterval(() => {
      if (playCount < times) {
        beepRef.current.currentTime = 0;
        beepRef.current.play();
        playCount++;
      } else {
        clearInterval(playInterval);
      }
    }, 300); // Play a beep every 300ms
  };

  const startTimer = (duration) => {
    const time = isDebugMode ? DEBUG_PRESET : duration;
    setCountdown(time);
    setInitialDuration(time);
    setIsTimerActive(true);
    requestWakeLock();
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    setCountdown(0);
    setInitialDuration(0);
    releaseWakeLock();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const progress = initialDuration > 0 ? (countdown / initialDuration) * 100 : 100;

  return (
    <div className={styles.timerContainer}>
      <div className={styles.timeDisplay}>{formatTime(countdown)}</div>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
      </div>
      <div className={styles.buttonContainer}>
        {isTimerActive ? (
          <button onClick={stopTimer} className={`${styles.controlButton} ${styles.stop}`}>Stop</button>
        ) : (
          <div className={styles.presetButtons}>
            <button onClick={() => startTimer(PRESETS.short)} className={styles.presetButton}>Short ({isDebugMode ? DEBUG_PRESET : PRESETS.short}s)</button>
            <button onClick={() => startTimer(PRESETS.medium)} className={styles.presetButton}>Medium ({isDebugMode ? DEBUG_PRESET : PRESETS.medium}s)</button>
            <button onClick={() => startTimer(PRESETS.long)} className={styles.presetButton}>Long ({isDebugMode ? DEBUG_PRESET : PRESETS.long}s)</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timer;