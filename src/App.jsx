import { useState, useEffect, useRef } from 'react';
import './App.css'
import styles from './App.module.css';
import Header from './components/Header'
import Navigation from './components/Navigation'
import WorkoutTabs from './components/WorkoutTabs'
import ExerciseDetail from './components/ExerciseDetail';
import PlateCalculatorModal from './components/PlateCalculatorModal';
import NumberInputModal from './components/NumberInputModal'; // Import the new modal
import Timer from './components/Timer';

import WorkoutSelection from './components/WorkoutSelection';
import History from './components/History'; // NEW IMPORT
import HistoryDetail from './components/HistoryDetail'; // NEW IMPORT
import Settings from './components/Settings'; // NEW IMPORT
import { workouts as rawWorkouts } from './data';

// Process raw workout data to include a 'completed' flag for each exercise
const initialWorkoutsState = Object.keys(rawWorkouts).reduce((acc, workoutType) => {
  acc[workoutType] = rawWorkouts[workoutType].map(exercise => ({ ...exercise, status: 'pending', sets: [] }));
  return acc;
}, {});

function App() {
  const [currentView, setCurrentView] = useState('selection'); // 'selection', 'workout', 'history', or 'historyDetail'
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workouts, setWorkouts] = useState(initialWorkoutsState);
  const [activeWorkout, setActiveWorkout] = useState(null); // No active workout initially
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null); // For history detail view

  // Initialize state directly from localStorage
  const [workoutHistory, setWorkoutHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem('workoutHistory');
      if (savedHistory) {
        return JSON.parse(savedHistory).map(entry => ({ ...entry, date: new Date(entry.date) }));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
    return []; // Fallback to empty array
  });

  const [completionCounters, setCompletionCounters] = useState(() => {
    try {
      const savedCounters = localStorage.getItem('completionCounters');
      return savedCounters ? JSON.parse(savedCounters) : { push: 0, pull: 0, legs: 0 };
    } catch (error) {
      console.error("Failed to load counters from localStorage", error);
    }
    return { push: 0, pull: 0, legs: 0 }; // Fallback
  });

  // Save workout history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
      localStorage.setItem('completionCounters', JSON.stringify(completionCounters));
    } catch (error) {
      console.error("Failed to save workout history to localStorage", error);
    }
  }, [workoutHistory, completionCounters]);

  // State for the number input modal
  const [isNumberModalOpen, setIsNumberModalOpen] = useState(false);
  const [numberModalConfig, setNumberModalConfig] = useState({ initialValue: 0, onConfirm: () => {} });
  const [isPlateCalculatorOpen, setIsPlateCalculatorOpen] = useState(false);
  const [plateCalculatorConfig, setPlateCalculatorConfig] = useState({ initialValue: 0, onConfirm: () => {} });
  const [isDebugMode, setIsDebugMode] = useState(false);
  const beepRef = useRef(null);





  const handleViewHistoryDetail = (entry) => {
    setSelectedHistoryEntry(entry);
    setCurrentView('historyDetail');
  };

  const reorderCategoryWorkout = (workoutName, history) => {
    // 1. Create a map of exerciseId -> max completionOrder from all history
    const orderMap = history
      .flatMap(entry => entry.exercises)
      .reduce((map, ex) => {
        if (ex.completionOrder) {
          // If an exercise appears multiple times, keep the highest (most recent) order number
          map[ex.id] = Math.max(map[ex.id] || 0, ex.completionOrder);
        }
        return map;
      }, {});

    const defaultOrder = initialWorkoutsState[workoutName];

    // If no exercises have been completed for this category, return the default order
    if (Object.keys(orderMap).length === 0) {
      return defaultOrder;
    }

    // 2. Sort the default list. Higher order number means more recent, so it comes first.
    const reorderedExercises = [...defaultOrder].sort((a, b) => {
      const aOrder = orderMap[a.id] ?? -1; // Default to -1 if not found in history
      const bOrder = orderMap[b.id] ?? -1;
      return bOrder - aOrder; // Descending sort
    });

    return reorderedExercises;
  };

  const generateFullBodyWorkout = (history) => {
    // 1. Check for prerequisites: at least one of each main category workout completed.
    const completedCategories = new Set(history.map(entry => {
      if (entry.workoutType.toLowerCase().includes('push')) return 'push';
      if (entry.workoutType.toLowerCase().includes('pull')) return 'pull';
      if (entry.workoutType.toLowerCase().includes('legs')) return 'legs';
      return null;
    }));

    if (completedCategories.size < 3) {
      console.log("Prerequisites not met for dynamic full body workout. Returning default list.");
      return initialWorkoutsState['full body'];
    }

    // 2. Create a frequency map of all completed exercises from history
    const frequencyMap = history
      .flatMap(entry => entry.exercises)
      .reduce((map, exercise) => {
        map[exercise.id] = (map[exercise.id] || 0) + 1;
        return map;
      }, {});

    const getLeastFrequent = (category, count) => {
      const categoryExercises = rawWorkouts[category];
      return [...categoryExercises]
        .map(ex => ({ ...ex, count: frequencyMap[ex.id] || 0 }))
        .sort((a, b) => a.count - b.count)
        .slice(0, count);
    };

    // 3. Get the 2 least frequent from each main category
    const leastFrequentPush = getLeastFrequent('push', 2);
    const leastFrequentPull = getLeastFrequent('pull', 2);
    const leastFrequentLegs = getLeastFrequent('legs', 2);

    let fullBodyWorkout = [
      ...leastFrequentPush,
      ...leastFrequentPull,
      ...leastFrequentLegs,
    ];

    // 4. Find the 7th exercise
    if (fullBodyWorkout.length < 7) {
      const thirdLeastPush = getLeastFrequent('push', 3).pop();
      const thirdLeastPull = getLeastFrequent('pull', 3).pop();
      const thirdLeastLegs = getLeastFrequent('legs', 3).pop();

      const candidates = [thirdLeastPush, thirdLeastPull, thirdLeastLegs]
        .filter(Boolean) // Remove any undefined candidates
        .sort((a, b) => (a.count || 0) - (b.count || 0));
      
      if (candidates.length > 0) {
        fullBodyWorkout.push(candidates[0]);
      }
    }
    
    // Fallback to default if something goes wrong
    if (fullBodyWorkout.length < 7) {
        return initialWorkoutsState['full body'];
    }

    return fullBodyWorkout;
  };

  const handleStartWorkout = (workoutType) => {
    let workoutExercises;

    if (workoutType === 'full body') {
      workoutExercises = generateFullBodyWorkout(workoutHistory);
    } else {
      workoutExercises = reorderCategoryWorkout(workoutType, workoutHistory);
    }

    // Find the last performance for each exercise and pre-fill the data
    const exercisesWithPrefilledData = workoutExercises.map(exercise => {
      let lastPerformance = null;
      // Search history backwards to find the most recent entry for this exercise
      for (let i = workoutHistory.length - 1; i >= 0; i--) {
        const entry = workoutHistory[i];
        const foundExercise = entry.exercises.find(e => e.id === exercise.id);
        if (foundExercise && foundExercise.sets && foundExercise.sets.length > 0) {
          lastPerformance = foundExercise;
          break; // Found the most recent one, no need to look further
        }
      }

      if (lastPerformance) {
        const lastSet = lastPerformance.sets[lastPerformance.sets.length - 1];
        const prefilledData = {
          ...exercise,
          lastReps: lastSet.reps,
          lastWeight: lastSet.weight,
        };

        // Specifically for Leg Press, find the last set with plate details
        if (exercise.name === 'Leg Press') {
          const setWithPlateDetails = [...lastPerformance.sets].reverse().find(s => s.plateDetails);
          if (setWithPlateDetails) {
            prefilledData.lastPlateDetails = setWithPlateDetails.plateDetails;
          }
        }

        return prefilledData;
      }

      return exercise; // Return original exercise if no history is found
    });

    // Update the state for the current workout with the new list
    setWorkouts(prevWorkouts => ({
      ...prevWorkouts,
      [workoutType]: exercisesWithPrefilledData
    }));

    setActiveWorkout(workoutType);
    setCurrentView('workout');
  };

  const handleCompleteWorkout = () => {
    // 1. Get all exercises across ALL workouts that are completed and have sets.
    const allCompletedExercises = Object.values(workouts)
      .flat()
      .filter(ex => ex.status === 'completed' && ex.sets.some(set => set.reps || set.weight));

    // 2. If there are no completed exercises, just reset and exit.
    if (allCompletedExercises.length === 0) {
      setWorkouts(initialWorkoutsState);
      setCurrentView('selection');
      setActiveWorkout(null);
      return;
    }

    // 3. Create a mutable copy of the counters and tag exercises with an order number.
    let updatedCounters = { ...completionCounters };
    const allCompletedExercisesWithOrder = allCompletedExercises.map(completedEx => {
      let exerciseCategory = null;
      for (const cat in rawWorkouts) {
        if (rawWorkouts[cat].some(ex => ex.id === completedEx.id)) {
          exerciseCategory = cat;
          break;
        }
      }

      if (exerciseCategory && updatedCounters.hasOwnProperty(exerciseCategory)) {
        updatedCounters[exerciseCategory]++;
        return { ...completedEx, completionOrder: updatedCounters[exerciseCategory] };
      }
      return completedEx; // Return as-is if no category is matched
    });

    // Find incomplete exercises from the active workout to prioritize them next time
    const incompleteExercises = workouts[activeWorkout]
      .filter(ex => ex.status !== 'completed');

    // Find the highest completion order number from the exercises that were actually completed
    const maxOrder = allCompletedExercisesWithOrder.reduce((max, ex) => Math.max(max, ex.completionOrder || 0), 0);

    // Tag incomplete exercises with a higher order number so they appear first next time
    const incompleteExercisesWithOrder = incompleteExercises.map((ex, index) => ({
      ...ex,
      completionOrder: maxOrder + index + 1, // Assign ascending numbers starting after the max
      status: 'pending', // Reset status for next time
      sets: [], // Clear sets for next time
    }));

    // Combine the completed and prioritized incomplete exercises for the history entry
    const allExercisesForHistory = [...allCompletedExercisesWithOrder, ...incompleteExercisesWithOrder];

    // 4. Count completed exercises in each category (excluding 'full body').
    const counts = { push: 0, pull: 0, legs: 0 };
    allCompletedExercisesWithOrder.forEach(completedEx => {
      for (const workoutType in rawWorkouts) {
        if (counts.hasOwnProperty(workoutType)) { // Only count push, pull, legs
          if (rawWorkouts[workoutType].some(rawEx => rawEx.id === completedEx.id)) {
            counts[workoutType]++;
            break; // Move to the next completed exercise
          }
        }
      }
    });

    // 4. Determine the title based on the counts.
    let finalWorkoutTitle = '';
    const activeCategories = Object.entries(counts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]); // Sort descending by count

    if (activeCategories.length === 3) {
      finalWorkoutTitle = 'Full Body Mix';
    } else if (activeCategories.length > 0) {
      const primary = activeCategories[0][0];
      const secondaries = activeCategories.slice(1).map(cat => cat[0]);
      
      const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

      finalWorkoutTitle = capitalize(primary);
      if (secondaries.length > 0) {
        finalWorkoutTitle += ` w/ ${secondaries.map(capitalize).join(' & ')}`;
      }
    } else {
      // Fallback in case no categorized exercises were done (should be rare)
      finalWorkoutTitle = activeWorkout.charAt(0).toUpperCase() + activeWorkout.slice(1);
    }

    // 5. Create the history log.
    const newHistoryEntry = {
      id: Date.now(),
      date: new Date(),
      workoutType: finalWorkoutTitle,
      exercises: allExercisesForHistory, // Use the combined list for the history entry
    };
    setWorkoutHistory(prevHistory => [...prevHistory, newHistoryEntry]);
    setCompletionCounters(updatedCounters); // Save the new counter values

    // 6. Reset the app state.
    setWorkouts(initialWorkoutsState);
    setCurrentView('selection');
    setActiveWorkout(null);
  };

  const handleSetUpdate = (exerciseId, newSets) => {
    const exerciseToUpdate = workouts[activeWorkout].find(ex => ex.id === exerciseId);
    if (!exerciseToUpdate) return;

    const newStatus = exerciseToUpdate.status === 'pending' ? 'inProgress' : exerciseToUpdate.status;
    const updatedExercise = { ...exerciseToUpdate, sets: newSets, status: newStatus };

    setWorkouts(prevWorkouts => {
      const newWorkouts = { ...prevWorkouts };
      newWorkouts[activeWorkout] = newWorkouts[activeWorkout].map(ex =>
        ex.id === exerciseId ? updatedExercise : ex
      );
      return newWorkouts;
    });

    setSelectedExercise(updatedExercise);
  };

  const handleToggleComplete = (exerciseId, finalSets) => {
    let updatedExercise = null;
    setWorkouts(prevWorkouts => {
      const newWorkouts = { ...prevWorkouts };
      const newExercises = newWorkouts[activeWorkout].map(ex => {
        if (ex.id === exerciseId) {
          // Toggle between completed and inProgress
          const newStatus = ex.status === 'completed' ? 'inProgress' : 'completed';
          updatedExercise = { ...ex, status: newStatus, sets: finalSets };
          return updatedExercise;
        }
        return ex;
      });
      newWorkouts[activeWorkout] = newExercises;
      return newWorkouts;
    });

    if (updatedExercise) {
      setSelectedExercise(updatedExercise);
    }
  };

  const handleImportHistory = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedHistory = JSON.parse(e.target.result);
        // Basic validation
        if (!Array.isArray(importedHistory)) {
          throw new Error('Invalid history file format.');
        }

        if (window.confirm('Are you sure you want to replace your current history with the imported data?')) {
          setWorkoutHistory(importedHistory.map(entry => ({ ...entry, date: new Date(entry.date) })));
          // Recalculate completion counters from the imported history
          const newCounters = importedHistory.reduce((acc, entry) => {
            entry.exercises.forEach(ex => {
              if (ex.completionOrder && ex.completionOrder > (acc[ex.category] || 0)) {
                acc[ex.category] = ex.completionOrder;
              }
            });
            return acc;
          }, { push: 0, pull: 0, legs: 0 });
          setCompletionCounters(newCounters);

          alert('History imported successfully.');
          setCurrentView('selection');
        }
      } catch (error) {
        alert(`Failed to import history: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const openNumberModal = (initialValue, onConfirm) => {
    setNumberModalConfig({ initialValue, onConfirm });
    setIsNumberModalOpen(true);
  };

  const closeNumberModal = () => {
    setIsNumberModalOpen(false);
  };

  const openPlateCalculatorModal = (initialValue, onConfirm) => {
    setPlateCalculatorConfig({ initialValue, onConfirm });
    setIsPlateCalculatorOpen(true);
  };

  const closePlateCalculatorModal = () => {
    setIsPlateCalculatorOpen(false);
  };

  const handleNumberConfirm = (newValue) => {
    numberModalConfig.onConfirm(newValue);
    closeNumberModal();
  };

  const handlePlateCalculatorConfirm = (plateData) => {
    plateCalculatorConfig.onConfirm(plateData);
    closePlateCalculatorModal();
  };

  const handleExportHistory = () => {
    const historyJson = JSON.stringify(workoutHistory, null, 2);
    const blob = new Blob([historyJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetHistory = () => {
    if (window.confirm('Are you sure you want to reset all workout history? This action cannot be undone.')) {
      setWorkoutHistory([]);
      setCompletionCounters({ push: 0, pull: 0, legs: 0 });
      // The useEffect hook will handle updating localStorage
      alert('Workout history has been reset.');
      setCurrentView('selection'); // Go back to the main screen
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'settings':
        return <Settings 
          onNavigate={setCurrentView} 
          onExport={handleExportHistory} 
          onReset={handleResetHistory} 
          onImport={handleImportHistory}
          isDebugMode={isDebugMode}
          onToggleDebugMode={() => setIsDebugMode(!isDebugMode)}
        />;
      case 'historyDetail':
        return <HistoryDetail entry={selectedHistoryEntry} onNavigate={setCurrentView} />;
      case 'history':
        return <History history={workoutHistory} onNavigate={setCurrentView} onViewDetail={handleViewHistoryDetail} />;
      case 'workout':
        return (
          <>
            <Navigation 
              workouts={workouts}
              activeWorkout={activeWorkout}
            beepRef={beepRef}
              onWorkoutChange={setActiveWorkout}
              onCompleteWorkout={handleCompleteWorkout}
              isDebugMode={isDebugMode}
            />
            <WorkoutTabs 
              exercises={workouts[activeWorkout] || []} 
              onExerciseClick={setSelectedExercise}
              onCompleteWorkout={handleCompleteWorkout}
            />
          </>
        );
      case 'selection':
      default:
        return (
          <WorkoutSelection 
            workouts={rawWorkouts} 
            onStartWorkout={handleStartWorkout} 
            onNavigate={setCurrentView}
          activeWorkout={activeWorkout}
          isDebugMode={isDebugMode}
          />
        );
    }
  }

  return (
    <div className={styles.app}>
      <Header 
        onNavigateHome={() => setCurrentView('selection')} 
        onNavigateSettings={() => setCurrentView('settings')}
      />
      <div className={styles.container}>
        {renderContent()}
      </div>

      <audio ref={beepRef} preload="auto">
        <source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg" />
      </audio>

      {selectedExercise && (
        <div className={styles.modalOverlay}>
          <ExerciseDetail
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            onSetUpdate={handleSetUpdate}
            onToggleComplete={handleToggleComplete}
            openNumberModal={openNumberModal}
            openPlateCalculatorModal={openPlateCalculatorModal}
            beepRef={beepRef}
            isDebugMode={isDebugMode}
          />
        </div>
      )}

      {isNumberModalOpen && (
        <NumberInputModal 
          initialValue={numberModalConfig.value}
          onConfirm={handleNumberConfirm}
          onClose={closeNumberModal}
        />
      )}

      {isPlateCalculatorOpen && (
        <PlateCalculatorModal
          onConfirm={handlePlateCalculatorConfirm}
          onClose={closePlateCalculatorModal}
          initialValue={plateCalculatorConfig.initialValue}
          openNumberModal={openNumberModal}
        />
      )}
    </div>
  );
}

export default App
