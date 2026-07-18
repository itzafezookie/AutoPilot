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
          <h2 className={styles.title}>
            {new Date(entry.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        </div>
        <button onClick={() => onNavigate('history')} className={styles.backButton}>Back</button>
      </div>

      <div className={styles.exerciseList}>
        {entry.exercises
          .filter(exercise => exercise.status === 'completed' || (exercise.sets && exercise.sets.length > 0))
          .map(exercise => (
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
