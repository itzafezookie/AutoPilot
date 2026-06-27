export const masterExercises = [
  { id: 1, name: 'Hammer Chest Press', bodyPart: 'upper', primary: 'Chest', secondary: ['Triceps', 'Shoulders (Front/Lateral)'], weightType: 'typed' },
  { id: 2, name: 'Hammer Incline Press', bodyPart: 'upper', primary: 'Chest', secondary: ['Triceps', 'Shoulders (Front/Lateral)'], weightType: 'typed' },
  { id: 3, name: 'Hammer Shoulder Press', bodyPart: 'upper', primary: 'Shoulders (Front/Lateral)', secondary: ['Triceps'], weightType: 'typed' },
  { id: 4, name: 'Lateral Raise (Deltoid)', bodyPart: 'upper', primary: 'Shoulders (Front/Lateral)', secondary: [], weightType: 'typed' },
  { id: 5, name: 'Pec Fly', bodyPart: 'upper', primary: 'Chest', secondary: [], weightType: 'typed' },
  { id: 6, name: 'Assisted Dips', bodyPart: 'upper', primary: 'Triceps', secondary: ['Chest', 'Shoulders (Front/Lateral)'], weightType: 'typed' },
  { id: 7, name: 'Cable Tricep Pushdowns', bodyPart: 'upper', primary: 'Triceps', secondary: [], weightType: 'typed' },
  { id: 8, name: 'Hammer Front Pulldown', bodyPart: 'upper', primary: 'Back (Lats/Rows)', secondary: ['Biceps'], weightType: 'typed' },
  { id: 9, name: 'Hammer Row', bodyPart: 'upper', primary: 'Back (Lats/Rows)', secondary: ['Biceps'], weightType: 'typed' },
  { id: 10, name: 'Rear Delt (Pec-Fly)', bodyPart: 'upper', primary: 'Rear Delts', secondary: ['Back (Lats/Rows)'], weightType: 'typed' },
  { id: 11, name: 'Back Extension', bodyPart: 'upper', primary: 'Lower Back', secondary: ['Glutes'], weightType: 'typed' },
  { id: 12, name: 'Cable Bicep Curls', bodyPart: 'upper', primary: 'Biceps', secondary: [], weightType: 'typed' },
  { id: 13, name: 'Assisted Pull Ups', bodyPart: 'upper', primary: 'Back (Lats/Rows)', secondary: ['Biceps'], weightType: 'typed' },
  { id: 14, name: 'Cable Face Pulls', bodyPart: 'upper', primary: 'Rear Delts', secondary: ['Back (Lats/Rows)'], weightType: 'typed' },
  { id: 15, name: 'Leg Press', bodyPart: 'legs', primary: 'Quads', secondary: ['Glutes', 'Calves'], weightType: 'plate' },
  { id: 16, name: 'Leg Extension', bodyPart: 'legs', primary: 'Quads', secondary: [], weightType: 'typed' },
  { id: 17, name: 'Leg Curl', bodyPart: 'legs', primary: 'Hamstrings', secondary: [], weightType: 'typed' },
  { id: 18, name: 'Calf Extension', bodyPart: 'legs', primary: 'Calves', secondary: [], weightType: 'typed' },
  { id: 19, name: 'Hip Abduction', bodyPart: 'legs', primary: 'Abductors (Outer)', secondary: ['Glutes'], weightType: 'typed' },
  { id: 20, name: 'Hip Adduction', bodyPart: 'legs', primary: 'Adductors (Inner)', secondary: [], weightType: 'typed' },
  { id: 21, name: 'Glute Bridges', bodyPart: 'legs', primary: 'Glutes', secondary: ['Hamstrings'], weightType: 'typed' }
];

export const normalizeExerciseId = (id) => {
  if (id === 22) return 1;  // Hammer Chest Press
  if (id === 23) return 9;  // Hammer Row
  if (id === 24) return 3;  // Hammer Shoulder Press
  if (id === 25) return 15; // Leg Press
  if (id === 26) return 11; // Back Extension
  if (id === 27) return 13; // Assisted Pull-Ups
  if (id === 28) return 7;  // Cable Tricep Pushdowns (was Tricep Pushdowns)
  return id;
};

// Backwards-compatibility wrapper during refactoring
export const workouts = {
  push: masterExercises.filter(ex => ex.id <= 7),
  pull: masterExercises.filter(ex => ex.id >= 8 && ex.id <= 14),
  legs: masterExercises.filter(ex => ex.id >= 15 && ex.id <= 21),
  'full body': masterExercises.filter(ex => [1, 9, 3, 15, 11, 13, 7].includes(ex.id))
};

export const migrateExercisesList = (list) => {
  if (!list || !Array.isArray(list)) return list;
  const muscleMap = {
    'Back': 'Back (Lats/Rows)',
    'Shoulders': 'Shoulders (Front/Lateral)',
    'Adductors': 'Adductors (Inner)'
  };
  return list.map(ex => {
    let primary = ex.primary;
    let secondary = ex.secondary || [];

    if (muscleMap[primary]) {
      primary = muscleMap[primary];
    }
    secondary = secondary.map(sec => muscleMap[sec] || sec);

    if (ex.id === 10 || ex.id === 14 || ex.name === 'Rear Delt (Pec-Fly)' || ex.name === 'Cable Face Pulls') {
      primary = 'Rear Delts';
    }
    if (ex.id === 11 || ex.name === 'Back Extension') {
      primary = 'Lower Back';
    }
    if (ex.id === 19 || ex.name === 'Hip Abduction') {
      primary = 'Abductors (Outer)';
      if (!secondary.includes('Glutes')) {
        secondary = [...secondary, 'Glutes'];
      }
    }
    if (ex.id === 20 || ex.name === 'Hip Adduction') {
      primary = 'Adductors (Inner)';
    }

    return {
      ...ex,
      primary,
      secondary
    };
  });
};

export const migrateWorkoutHistory = (history) => {
  if (!history || !Array.isArray(history)) return history;
  return history.map(entry => ({
    ...entry,
    exercises: migrateExercisesList(entry.exercises)
  }));
};
