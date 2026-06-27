import styles from './WorkoutSelection.module.css';

function WorkoutSelection({ onStartWorkout, onNavigate, activeWorkoutType, recommendedWorkout, generateWorkoutPreview }) {
  const previewExercises = generateWorkoutPreview ? generateWorkoutPreview(recommendedWorkout) : [];

  return (
    <div className={styles.container}>
      {activeWorkoutType ? (
        <>
          <div className={styles.mainContent}>
            <h2 className={styles.title}>Workout in Progress</h2>
            <div className={styles.activeWorkoutCard}>
              <span className={styles.activeLabel}>
                {activeWorkoutType === 'upper' ? 'Upper Body / Core' : 'Legs'}
              </span>
              <button 
                onClick={() => onNavigate('workout')} 
                className={styles.continueButton}
              >
                Continue Session
              </button>
            </div>
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
            <div className={styles.headerSection}>
              <h2 className={styles.title}>Next Session</h2>
            </div>

            <div className={styles.workoutSelectionCard}>
              <div className={styles.workoutToggleHeader}>
                <span className={styles.workoutTypeTitle}>
                  {recommendedWorkout === 'upper' ? 'Upper Body / Core Workout' : 'Legs Workout'}
                </span>
              </div>

              <div className={styles.previewSection}>
                <h3 className={styles.previewTitle}>Playlist Preview (7 Lifts)</h3>
                <div className={styles.previewContainer}>
                  <ul className={styles.previewList}>
                    {previewExercises.map((exercise) => (
                      <li key={exercise.id} className={styles.previewItem}>
                        <span className={styles.exerciseName}>{exercise.name}</span>
                        <span className={styles.muscleBadge}>{exercise.primary}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                className={styles.startButton}
                onClick={() => onStartWorkout(recommendedWorkout)}
              >
                Start Workout
              </button>
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
