import styles from './Exercise.module.css';

function Exercise({ exercise, onClick, isNext }) {
  // Dynamically set the class based on the exercise's status and if it's next
  const exerciseClasses = [
    styles.exercise,
    styles[exercise.status] || '',
    isNext ? styles.next : ''
  ].join(' ');

  return (
    <div className={exerciseClasses} onClick={onClick}>
      <h3 className={styles.exerciseName}>{exercise.name}</h3>
    </div>
  );
}

export default Exercise;
