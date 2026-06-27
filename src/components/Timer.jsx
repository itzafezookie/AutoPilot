import React from 'react';
import styles from './Timer.module.css';

const PRESETS = {
  short: 45,
  medium: 60,
  long: 75,
};

const DEBUG_PRESET = 2;

function Timer({ countdown, isTimerActive, initialDuration, startTimer, stopTimer, isDebugMode }) {
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
            <button onClick={() => startTimer(PRESETS.short)} className={styles.presetButton}>
              Short ({isDebugMode ? DEBUG_PRESET : PRESETS.short}s)
            </button>
            <button onClick={() => startTimer(PRESETS.medium)} className={styles.presetButton}>
              Medium ({isDebugMode ? DEBUG_PRESET : PRESETS.medium}s)
            </button>
            <button onClick={() => startTimer(PRESETS.long)} className={styles.presetButton}>
              Long ({isDebugMode ? DEBUG_PRESET : PRESETS.long}s)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timer;