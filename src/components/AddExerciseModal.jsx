import { useState } from 'react';
import styles from './AddExerciseModal.module.css';
import { normalizeExerciseId } from '../data';

function AddExerciseModal({ onClose, onAddExercise, activePlaylist, workoutHistory, getExerciseSequenceMap, exercisesList }) {
  const [searchQuery, setSearchQuery] = useState('');

  const { map: sequenceMap } = getExerciseSequenceMap(workoutHistory);

  // Filter out exercises already present in the active session and hibernated exercises
  const candidates = exercisesList.filter(
    ex => !ex.hibernated && !activePlaylist.some(p => p.id === ex.id)
  );

  // Associate sequence number and sort ascending (lowest/oldest first)
  const sortedCandidates = candidates.map(ex => {
    const seq = sequenceMap[ex.id] || 0;
    return { ...ex, seq };
  }).sort((a, b) => a.seq - b.seq);

  // Filter by search query (name or muscle group)
  const filteredCandidates = sortedCandidates.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.primary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastLoggedText = (exId) => {
    // Sort history from most recent to oldest
    const sortedHistoryDesc = [...workoutHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (const entry of sortedHistoryDesc) {
      if (entry.exercises.some(e => normalizeExerciseId(e.id) === exId)) {
        const date = new Date(entry.date);
        return `Logged ${date.toLocaleDateString()}`;
      }
    }
    return 'Never logged';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add Extra Lift</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <input 
          type="text" 
          placeholder="Search by lift name or muscle..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          autoFocus
        />

        <div className={styles.listContainer}>
          {filteredCandidates.length === 0 ? (
            <p className={styles.emptyText}>No exercises found matching your search.</p>
          ) : (
            <div className={styles.exerciseList}>
              {filteredCandidates.map((exercise) => {
                const lastLogged = getLastLoggedText(exercise.id);
                const isFresh = exercise.seq === 0;

                return (
                  <div 
                    key={exercise.id} 
                    className={styles.exerciseItem}
                    onClick={() => {
                      onAddExercise(exercise.id);
                      onClose();
                    }}
                  >
                    <div className={styles.itemLeft}>
                      <span className={styles.exerciseName}>{exercise.name}</span>
                      <div className={styles.badgeRow}>
                        <span className={`${styles.bodyPartBadge} ${styles[exercise.bodyPart]}`}>
                          {exercise.bodyPart === 'upper' ? 'Upper / Core' : 'Legs'}
                        </span>
                        <span className={styles.muscleBadge}>{exercise.primary}</span>
                        {exercise.custom && (
                          <span className={styles.customBadge}>User Added</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.itemRight}>
                      <span className={`${styles.freshnessBadge} ${isFresh ? styles.fresh : styles.logged}`}>
                        {isFresh ? 'Fresh' : lastLogged}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddExerciseModal;
