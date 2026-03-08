import { useState, useEffect } from 'react';
import styles from './WorkoutSelection.module.css';
import Timer from './Timer';

function WorkoutSelection({ workouts, onStartWorkout, onNavigate, activeWorkout }) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [displayedWorkout, setDisplayedWorkout] = useState(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleSelectWorkout = (workoutType) => {
    if (displayedWorkout && displayedWorkout !== workoutType) {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setSelectedWorkout(workoutType);
        setDisplayedWorkout(workoutType);
        setIsAnimatingOut(false);
      }, 300); // Match CSS transition duration
    } else {
      setSelectedWorkout(workoutType);
      setDisplayedWorkout(workoutType);
    }
  };

  return (
    <div className={styles.container}>
      {activeWorkout ? (
        <>
          <div className={styles.mainContent}>
            <h2 className={styles.title}>{activeWorkout.name}</h2>
            <button onClick={() => onNavigate('workout')} className={styles.continueButton}>
              Continue Workout
            </button>
          </div>
          <div className={styles.historyButtonContainer}>
            <button onClick={() => onNavigate('history')} className={styles.historyButton}>
              View Workout History
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.mainContent}>
            <h2 className={styles.title}>Choose Your Workout</h2>
            <div className={styles.categoryButtons}>
              {Object.keys(workouts).map(type => (
                <button 
                  key={type} 
                  className={`${styles.categoryButton} ${selectedWorkout === type ? styles.selected : ''}`}
                  onClick={() => handleSelectWorkout(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.revealContainer}>
              {displayedWorkout && (
                <div className={`${styles.previewWrapper} ${isAnimatingOut ? styles.animatingOut : ''}`}>
                  <h3 className={styles.previewTitle}>{displayedWorkout.charAt(0).toUpperCase() + displayedWorkout.slice(1)} Preview</h3>
                  <ul className={styles.previewList}>
                    {workouts[displayedWorkout].map((exercise) => (
                      <li key={exercise.id}>{exercise.name}</li>
                    ))}
                  </ul>
                  <button
                    className={styles.startButton}
                    onClick={() => onStartWorkout(selectedWorkout)}
                    disabled={!selectedWorkout}
                  >
                    Start Workout
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={styles.historyButtonContainer}>
            <button onClick={() => onNavigate('history')} className={styles.historyButton}>
              View Workout History
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default WorkoutSelection;
