import styles from './Navigation.module.css';

function Navigation({ activeWorkoutType, onCompleteWorkout }) {
  return (
    <nav className={styles.nav}>
      <span className={styles.workoutTitle}>
        {activeWorkoutType === 'upper' ? 'Upper Body / Core' : 'Legs'}
      </span>
      <button 
        className={styles.completeButton} 
        onClick={onCompleteWorkout} 
        title="Complete Workout"
      >
        ✓
      </button>
    </nav>
  );
}

export default Navigation;
