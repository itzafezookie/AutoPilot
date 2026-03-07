import styles from './History.module.css';

function History({ history, onNavigate, onViewDetail }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Workout History</h2>
        <button onClick={() => onNavigate('selection')} className={styles.backButton}>Back</button>
      </div>
      {history.length === 0 ? (
        <p>No workouts logged yet.</p>
      ) : (
        <div className={styles.historyList}>
          {history.map(entry => (
            <button key={entry.id} onClick={() => onViewDetail(entry)} className={styles.historyEntry}>
              <span className={styles.date}>{new Date(entry.date).toLocaleDateString()}</span>
              <span className={styles.workoutType}>{entry.workoutType}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
