import styles from './HistoryDetail.module.css';

function HistoryDetail({ entry, onNavigate }) {
  if (!entry) {
    return (
      <div className={styles.container}>
        <p>No history entry selected.</p>
        <button onClick={() => onNavigate('history')} className={styles.backButton}>Back to History</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{entry.workoutType}</h2>
          <p className={styles.date}>{new Date(entry.date).toDateString()}</p>
        </div>
        <button onClick={() => onNavigate('history')} className={styles.backButton}>Back</button>
      </div>

      <div className={styles.exerciseList}>
        {entry.exercises.map(exercise => (
          <div key={exercise.id} className={styles.exerciseCard}>
            <h3 className={styles.exerciseName}>{exercise.name}</h3>
            <div className={styles.setList}>
              {exercise.sets.map((set, index) => (
                <div key={index} className={styles.setRow}>
                  <span>Set {index + 1}</span>
                  <span>{set.reps} reps</span>
                  <span>{set.weight} lbs</span>
                  <span className={styles.timestamp}>{new Date(set.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoryDetail;
