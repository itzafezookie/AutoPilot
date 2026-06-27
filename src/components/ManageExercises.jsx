import { useState } from 'react';
import styles from './ManageExercises.module.css';

const MUSCLES_BY_BODYPART = {
  upper: [
    'Chest',
    'Back (Lats/Rows)',
    'Shoulders (Front/Lateral)',
    'Rear Delts',
    'Biceps',
    'Triceps',
    'Core (Abs/Obliques)',
    'Lower Back'
  ],
  legs: [
    'Quads',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Adductors (Inner)',
    'Abductors (Outer)'
  ]
};

function ManageExercises({ onNavigate, exercisesList, onCreateExercise, onDeleteExercise, onUpdateExercise }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [weightType, setWeightType] = useState('typed'); // 'typed' or 'plate'
  const [bodyPart, setBodyPart] = useState('upper'); // 'upper' or 'legs'
  const [primary, setPrimary] = useState('Chest');

  // Filtering & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'muscle', 'custom'

  const handleBodyPartChange = (part) => {
    setBodyPart(part);
    // Set a default primary muscle matching the selected body part
    setPrimary(part === 'upper' ? 'Chest' : 'Quads');
  };

  const handleEditClick = (exercise) => {
    setEditingExercise(exercise);
    setName(exercise.name);
    setWeightType(exercise.weightType);
    setBodyPart(exercise.bodyPart);
    setPrimary(exercise.primary);
  };

  const handleToggleHibernate = (exercise) => {
    onUpdateExercise({
      ...exercise,
      hibernated: !exercise.hibernated
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingExercise) {
      onUpdateExercise({
        ...editingExercise,
        name: name.trim(),
        bodyPart,
        primary,
        weightType
      });
    } else {
      onCreateExercise({
        name: name.trim(),
        bodyPart,
        primary,
        weightType
      });
    }

    // Reset form and go back to list
    setName('');
    setWeightType('typed');
    setBodyPart('upper');
    setPrimary('Chest');
    setIsAdding(false);
    setEditingExercise(null);
  };

  const handleCancel = () => {
    setName('');
    setWeightType('typed');
    setBodyPart('upper');
    setPrimary('Chest');
    setIsAdding(false);
    setEditingExercise(null);
  };

  // Compile list of all muscles for filter dropdown
  const ALL_MUSCLES = [
    ...MUSCLES_BY_BODYPART.upper,
    ...MUSCLES_BY_BODYPART.legs
  ];

  const processExercises = (exercises, targetBodyPart) => {
    let filtered = exercises.filter(ex => ex.bodyPart === targetBodyPart);

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(q) || 
        ex.primary.toLowerCase().includes(q)
      );
    }

    // Muscle filter
    if (muscleFilter !== 'All') {
      filtered = filtered.filter(ex => ex.primary === muscleFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      // Hibernated cleanly drops to the bottom of the list
      if (a.hibernated && !b.hibernated) return 1;
      if (!a.hibernated && b.hibernated) return -1;

      if (sortBy === 'muscle') {
        const muscleCompare = a.primary.localeCompare(b.primary);
        if (muscleCompare !== 0) return muscleCompare;
      } else if (sortBy === 'custom') {
        if (a.custom && !b.custom) return -1;
        if (!a.custom && b.custom) return 1;
      }

      return a.name.localeCompare(b.name);
    });

    return filtered;
  };

  const upperExercises = processExercises(exercisesList, 'upper');
  const legsExercises = processExercises(exercisesList, 'legs');

  const renderExerciseCard = (exercise) => (
    <div key={exercise.id} className={`${styles.exerciseCard} ${exercise.hibernated ? styles.hibernatedCard : ''}`}>
      <div className={styles.cardLeft}>
        <div className={styles.nameRow}>
          <span className={styles.exerciseName}>{exercise.name}</span>
          {exercise.custom && (
            <span className={styles.customBadge}>User Added</span>
          )}
        </div>
        <span className={styles.muscleLabel}>{exercise.primary}</span>
      </div>
      <div className={styles.cardRight}>
        <span className={styles.weightTypeTag}>
          {exercise.weightType === 'plate' ? 'Plate Calc' : 'Standard'}
        </span>
        <button 
          onClick={() => handleEditClick(exercise)} 
          className={styles.editButton}
          title="Edit Exercise"
        >
          Edit
        </button>
        <button 
          onClick={() => handleToggleHibernate(exercise)} 
          className={exercise.hibernated ? styles.unhibernateButton : styles.hibernateButton}
          title={exercise.hibernated ? "Unhibernate Exercise" : "Hibernate Exercise"}
        >
          {exercise.hibernated ? "Unhibernate" : "Hibernate"}
        </button>
        {exercise.custom && (
          <button 
            onClick={() => onDeleteExercise(exercise.id)} 
            className={styles.deleteButton}
            title="Delete Custom Exercise"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {(isAdding || editingExercise) ? (
        <div className={styles.formContainer}>
          <h2 className={styles.title}>{editingExercise ? 'Edit Exercise' : 'Add Exercise'}</h2>
          
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="ex-name">Name</label>
              <input 
                type="text" 
                id="ex-name"
                className={styles.input} 
                placeholder="e.g. Barbell Bicep Curl" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                required
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Weight Tracking Mode</label>
              <div className={styles.segmentedControl}>
                <button
                  type="button"
                  className={`${styles.segmentButton} ${weightType === 'typed' ? styles.active : ''}`}
                  onClick={() => setWeightType('typed')}
                >
                  Standard/Typed
                </button>
                <button
                  type="button"
                  className={`${styles.segmentButton} ${weightType === 'plate' ? styles.active : ''}`}
                  onClick={() => setWeightType('plate')}
                >
                  Plate Calculator
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Workout Target Category</label>
              <div className={styles.segmentedControl}>
                <button
                  type="button"
                  className={`${styles.segmentButton} ${bodyPart === 'upper' ? styles.active : ''}`}
                  onClick={() => handleBodyPartChange('upper')}
                >
                  Upper Body / Core
                </button>
                <button
                  type="button"
                  className={`${styles.segmentButton} ${bodyPart === 'legs' ? styles.active : ''}`}
                  onClick={() => handleBodyPartChange('legs')}
                >
                  Legs
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="ex-muscle">Primary Muscle Target</label>
              <select 
                id="ex-muscle"
                className={styles.select}
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
              >
                {MUSCLES_BY_BODYPART[bodyPart].map(muscle => (
                  <option key={muscle} value={muscle}>{muscle}</option>
                ))}
              </select>
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={!name.trim()}
              >
                {editingExercise ? 'Save Changes' : 'Save Exercise'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.listContainer}>
          <div className={styles.header}>
            <h2 className={styles.title}>Manage Exercises</h2>
            <button onClick={() => onNavigate('settings')} className={styles.backButton}>Back</button>
          </div>

          <button onClick={() => setIsAdding(true)} className={styles.addButton}>
            + Add Exercise
          </button>

          {/* Filtering and Sorting Controls */}
          <div className={styles.controlsRow}>
            <input 
              type="text" 
              placeholder="Search by name or muscle..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.selectsRow}>
              <select 
                value={muscleFilter} 
                onChange={(e) => setMuscleFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">All Muscles</option>
                {ALL_MUSCLES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="name">Sort by Name</option>
                <option value="muscle">Sort by Muscle</option>
                <option value="custom">Sort by Custom</option>
              </select>
            </div>
          </div>

          <div className={styles.scrollList}>
            <div className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>Upper Body / Core</h3>
              <div className={styles.exerciseGrid}>
                {upperExercises.length === 0 ? (
                  <span className={styles.noExercises}>No exercises found</span>
                ) : (
                  upperExercises.map(renderExerciseCard)
                )}
              </div>
            </div>

            <div className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>Legs</h3>
              <div className={styles.exerciseGrid}>
                {legsExercises.length === 0 ? (
                  <span className={styles.noExercises}>No exercises found</span>
                ) : (
                  legsExercises.map(renderExerciseCard)
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageExercises;
