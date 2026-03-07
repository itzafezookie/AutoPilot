import styles from './WorkoutTabs.module.css';
import Exercise from './Exercise';

function WorkoutTabs({ exercises, onExerciseClick, onCompleteWorkout }) {
  // Sort exercises by status: inProgress -> pending -> completed
  const sortedExercises = [...exercises].sort((a, b) => {
    const statusOrder = { inProgress: 0, pending: 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Find the index of the first pending exercise after the last in-progress one
  let nextExerciseIndex = -1;
  const lastInProgressIndex = sortedExercises.findLastIndex(ex => ex.status === 'inProgress');

  if (lastInProgressIndex !== -1) {
    // The next exercise is the one right after the last in-progress one
    nextExerciseIndex = lastInProgressIndex + 1;
  } else {
    // If nothing is in progress, the first pending exercise is the next one
    nextExerciseIndex = sortedExercises.findIndex(ex => ex.status === 'pending');
  }

  return (
    <div className={styles.tabs}>
      {sortedExercises.map((exercise, index) => (
        <Exercise 
          key={exercise.id} 
          exercise={exercise} 
          onClick={() => onExerciseClick(exercise)} 
          isNext={index === nextExerciseIndex} // Pass the isNext flag
        />
      ))}
    </div>
  );
}

export default WorkoutTabs;
