import styles from './WorkoutTabs.module.css';
import Exercise from './Exercise';

function WorkoutTabs({ exercises, onExerciseClick, onAddExerciseClick }) {
  // Sort exercises by status: inProgress -> pending -> completed
  const sortedExercises = [...exercises].sort((a, b) => {
    const statusOrder = { inProgress: 0, pending: 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Find the index of the first pending exercise after the last in-progress one
  let nextExerciseIndex = -1;
  const lastInProgressIndex = sortedExercises.findLastIndex(ex => ex.status === 'inProgress');

  if (lastInProgressIndex !== -1) {
    nextExerciseIndex = lastInProgressIndex + 1;
  } else {
    nextExerciseIndex = sortedExercises.findIndex(ex => ex.status === 'pending');
  }

  return (
    <div className={styles.tabs}>
      {sortedExercises.map((exercise, index) => (
        <Exercise 
          key={exercise.id} 
          exercise={exercise} 
          onClick={() => onExerciseClick(exercise)} 
          isNext={index === nextExerciseIndex}
        />
      ))}
      
      <div className={styles.addLiftCard} onClick={onAddExerciseClick}>
        <span className={styles.addIcon}>+</span> Add Extra Lift
      </div>
    </div>
  );
}

export default WorkoutTabs;
