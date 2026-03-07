import { useState, useEffect } from 'react';
import styles from './ExerciseDetail.module.css';
import Timer from './Timer'; // Import the Timer component

function ExerciseDetail({ exercise, onClose, onSetUpdate, onToggleComplete, openNumberModal, openPlateCalculatorModal }) {
  const { sets, lastReps, lastWeight } = exercise;

  const addSet = () => {
    // When adding a new set, we timestamp the one that was just completed.
    const setsWithTimestamp = sets.map((set, index) => {
      if (index === sets.length - 1 && !set.timestamp) { // Only timestamp if it hasn't been already
        return { ...set, timestamp: new Date() };
      }
      return set;
    });

    const newSet = { id: (sets.length || 0) + 1 };

    // If there are existing sets, copy the last one.
    if (sets.length > 0) {
      const lastSet = setsWithTimestamp[setsWithTimestamp.length - 1];
      newSet.reps = lastSet.reps;
      newSet.weight = lastSet.weight;
    } 
    // If this is the first set, use the historical pre-filled data.
    else if (lastReps !== undefined && lastWeight !== undefined) {
      newSet.reps = lastReps;
      newSet.weight = lastWeight;
    } 
    // Otherwise, start with empty values.
    else {
      newSet.reps = '';
      newSet.weight = '';
    }

    onSetUpdate(exercise.id, [...setsWithTimestamp, newSet]);
  };

  const deleteSet = (indexToDelete) => {
    const newSets = sets.filter((_, index) => index !== indexToDelete);
    onSetUpdate(exercise.id, newSets);
  };

  const handleSetChange = (index, field, value) => {
    const newSets = [...sets];
    // If the value is an object with plateCounts, it came from the PlateCalculator
    if (field === 'weight' && value && typeof value === 'object' && value.plateCounts) {
      newSets[index]['weight'] = value.totalWeight;
      newSets[index]['plateDetails'] = value; // Store the whole object
    } else {
      newSets[index][field] = value;
    }
    onSetUpdate(exercise.id, newSets);
  };

  const handleComplete = () => {
    // Timestamp the final set before completing the exercise
    const finalSets = sets.map((set, index) => {
      if (index === sets.length - 1 && !set.timestamp) {
        return { ...set, timestamp: new Date() };
      }
      return set;
    });

    onToggleComplete(exercise.id, finalSets);
    onClose(); // Close the modal after completing
  };

  if (!exercise) {
    return null;
  }

  return (
    <div className={styles.modalContent}>
        <span className={styles.closeModal} onClick={onClose}>&times;</span>
        <h2 className={styles.title}>{exercise.name}</h2>
        
        <div className={styles.setsContainer}>
          {sets.map((set, index) => (
            <div key={set.id} className={styles.setRow}>
              <h3>Set {index + 1}</h3>
              <div 
                className={styles.inputField}
                onClick={() => openNumberModal(set.reps, (newValue) => handleSetChange(index, 'reps', newValue))}
              >
                {set.reps || 'Reps'}
              </div>
              <div 
                className={styles.inputField}
                onClick={() => {
                  if (exercise.name === 'Leg Press') {
                    // For leg press, the initial value for the calculator is the detailed object from the last session
                    const initialCalcValue = set.plateDetails || exercise.lastPlateDetails || set.weight;
                    openPlateCalculatorModal(initialCalcValue, (newValue) => handleSetChange(index, 'weight', newValue));
                  } else {
                    openNumberModal(set.weight, (newValue) => handleSetChange(index, 'weight', newValue));
                  }
                }}
              >
                {set.weight || 'Lbs'}
              </div>
              <div className={styles.timestamp}>
                {set.timestamp ? new Date(set.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
              <button onClick={() => deleteSet(index)} className={styles.deleteButton}>🗑️</button>
            </div>
          ))}
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={addSet} className={styles.actionButton}>New Set</button>
          <button onClick={handleComplete} className={styles.completeButton}>Complete Exercise</button>
        </div>

        <Timer />

      </div>
  );
}

export default ExerciseDetail;