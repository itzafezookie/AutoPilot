import { useState, useEffect, useRef } from 'react';
import './App.css';
import styles from './App.module.css';
import Header from './components/Header';
import Navigation from './components/Navigation';
import WorkoutTabs from './components/WorkoutTabs';
import ExerciseDetail from './components/ExerciseDetail';
import PlateCalculatorModal from './components/PlateCalculatorModal';
import NumberInputModal from './components/NumberInputModal';
import AddExerciseModal from './components/AddExerciseModal';
import WorkoutSelection from './components/WorkoutSelection';
import History from './components/History';
import HistoryDetail from './components/HistoryDetail';
import Settings from './components/Settings';
import ManageExercises from './components/ManageExercises';
import { masterExercises, normalizeExerciseId, migrateExercisesList, migrateWorkoutHistory } from './data';
import { useWakeLock } from './hooks/useWakeLock';

function App() {
  const [currentView, setCurrentView] = useState('selection'); // 'selection', 'workout', 'history', 'historyDetail', 'settings', 'manageExercises'
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Dynamic Library State
  const [exercisesList, setExercisesList] = useState(() => {
    try {
      const savedExercises = localStorage.getItem('customExercises');
      if (savedExercises) {
        return migrateExercisesList(JSON.parse(savedExercises));
      }
    } catch (error) {
      console.error("Failed to load custom exercises from localStorage", error);
    }
    return masterExercises;
  });

  // Dynamic Playlist and Scheduling states
  const [activeWorkoutType, setActiveWorkoutType] = useState(null); // 'upper', 'legs', or null
  const [activePlaylist, setActivePlaylist] = useState([]); // Array of exercises in active session
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);

  // Initialize history directly from localStorage
  const [workoutHistory, setWorkoutHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem('workoutHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory).map(entry => ({ ...entry, date: new Date(entry.date) }));
        return migrateWorkoutHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
    return [];
  });

  const [completionCounters, setCompletionCounters] = useState(() => {
    try {
      const savedCounters = localStorage.getItem('completionCounters');
      return savedCounters ? JSON.parse(savedCounters) : { push: 0, pull: 0, legs: 0 };
    } catch (error) {
      console.error("Failed to load counters from localStorage", error);
    }
    return { push: 0, pull: 0, legs: 0 };
  });

  // Save history and exercises to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
      localStorage.setItem('completionCounters', JSON.stringify(completionCounters));
      localStorage.setItem('customExercises', JSON.stringify(exercisesList));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [workoutHistory, completionCounters, exercisesList]);

  // Hoisted Rest Timer States
  const [countdown, setCountdown] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [initialDuration, setInitialDuration] = useState(0);
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  // Dialog / Input States
  const [isNumberModalOpen, setIsNumberModalOpen] = useState(false);
  const [numberModalConfig, setNumberModalConfig] = useState({ initialValue: 0, onConfirm: () => {} });
  const [isPlateCalculatorOpen, setIsPlateCalculatorOpen] = useState(false);
  const [plateCalculatorConfig, setPlateCalculatorConfig] = useState({ initialValue: 0, onConfirm: () => {} });
  const [isDebugMode, setIsDebugMode] = useState(false);
  const beepRef = useRef(null);

  // Timer Sound Utility
  const playMultipleBeeps = (times) => {
    if (!beepRef.current) return;
    let playCount = 0;
    const playInterval = setInterval(() => {
      if (playCount < times) {
        beepRef.current.currentTime = 0;
        beepRef.current.play();
        playCount++;
      } else {
        clearInterval(playInterval);
      }
    }, 300);
  };

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (isTimerActive && countdown === 0) {
      setIsTimerActive(false);
      playMultipleBeeps(5);
      releaseWakeLock();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, countdown, releaseWakeLock]);

  const startTimer = (duration) => {
    const time = isDebugMode ? 2 : duration;
    setCountdown(time);
    setInitialDuration(time);
    setIsTimerActive(true);
    requestWakeLock();
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    setCountdown(0);
    setInitialDuration(0);
    releaseWakeLock();
  };

  // Exercise library manipulation
  const handleCreateExercise = (newEx) => {
    const nextId = exercisesList.length > 0 ? Math.max(...exercisesList.map(e => e.id)) + 1 : 1;
    const createdEx = {
      ...newEx,
      id: nextId,
      secondary: [],
      custom: true
    };
    setExercisesList(prev => [...prev, createdEx]);
  };

  const handleDeleteExercise = (id) => {
    setExercisesList(prev => prev.filter(ex => ex.id !== id));
  };

  const handleUpdateExercise = (updatedEx) => {
    setExercisesList(prev => prev.map(ex => ex.id === updatedEx.id ? updatedEx : ex));
  };

  // Historical Ledger Calculation
  const getExerciseSequenceMap = (history) => {
    const map = {};
    exercisesList.forEach(ex => {
      map[ex.id] = 0;
    });

    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    let sequenceNumber = 1;
    sortedHistory.forEach(entry => {
      const completedInEntry = entry.exercises
        .filter(ex => ex.status === 'completed' || (ex.sets && ex.sets.length > 0))
        .sort((a, b) => (a.completionOrder || 0) - (b.completionOrder || 0));

      completedInEntry.forEach(ex => {
        const normalizedId = normalizeExerciseId(ex.id);
        map[normalizedId] = sequenceNumber++;
      });
    });

    return { map, nextSequenceNumber: sequenceNumber };
  };

  // Dynamic Scheduling Logic
  const getNextWorkoutType = (history) => {
    if (history.length === 0) return 'upper';

    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastEntry = sortedHistory[0];

    const lastWorkoutDate = new Date(lastEntry.date);
    const now = new Date();
    const diffTime = Math.abs(now - lastWorkoutDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) {
      console.log(`Last workout was ${diffDays} days ago (> 7 days). Resetting recommended workout to Upper Body / Core.`);
      return 'upper';
    }

    let upperCount = 0;
    let legsCount = 0;
    lastEntry.exercises.forEach(ex => {
      const normalizedId = normalizeExerciseId(ex.id);
      const original = exercisesList.find(me => me.id === normalizedId);
      if (original) {
        if (original.bodyPart === 'upper') upperCount++;
        if (original.bodyPart === 'legs') legsCount++;
      }
    });

    if (upperCount > legsCount) {
      return 'legs';
    } else if (legsCount > upperCount) {
      return 'upper';
    }

    return 'upper';
  };

  // Generate 7 exercises matching bodyPart sorted by oldest logged sequence, respecting max-2 primary muscle tag restriction
  const generateWorkoutPlaylist = (workoutType) => {
    const { map: sequenceMap } = getExerciseSequenceMap(workoutHistory);
    const candidates = exercisesList.filter(ex => ex.bodyPart === workoutType && !ex.hibernated);

    const candidatesWithSeq = candidates.map(ex => ({
      ...ex,
      seq: sequenceMap[ex.id] || 0
    }));
    candidatesWithSeq.sort((a, b) => a.seq - b.seq);

    const playlist = [];
    const primaryMuscleCounts = {};

    for (const exercise of candidatesWithSeq) {
      if (playlist.length === 7) break;

      const primaryTag = exercise.primary;
      const currentCount = primaryMuscleCounts[primaryTag] || 0;

      if (currentCount < 2) {
        playlist.push(exercise);
        primaryMuscleCounts[primaryTag] = currentCount + 1;
      }
    }

    // Fallback in case constraint limits playlist size to under 7
    if (playlist.length < 7) {
      for (const exercise of candidatesWithSeq) {
        if (playlist.length === 7) break;
        if (!playlist.some(p => p.id === exercise.id)) {
          playlist.push(exercise);
        }
      }
    }

    return playlist;
  };

  // Start Session
  const handleStartWorkout = (workoutType) => {
    const workoutExercises = generateWorkoutPlaylist(workoutType);

    // Pre-fill each exercise with the last completed reps & weight from history
    const exercisesWithPrefilledData = workoutExercises.map(exercise => {
      let lastPerformance = null;
      for (let i = workoutHistory.length - 1; i >= 0; i--) {
        const entry = workoutHistory[i];
        const foundExercise = entry.exercises.find(e => normalizeExerciseId(e.id) === exercise.id);
        if (foundExercise && foundExercise.sets && foundExercise.sets.length > 0) {
          lastPerformance = foundExercise;
          break;
        }
      }

      if (lastPerformance) {
        const lastSet = lastPerformance.sets[lastPerformance.sets.length - 1];
        const prefilledData = {
          ...exercise,
          status: 'pending',
          sets: [],
          lastReps: lastSet.reps,
          lastWeight: lastSet.weight,
        };

        if (exercise.weightType === 'plate') {
          const setWithPlateDetails = [...lastPerformance.sets].reverse().find(s => s.plateDetails);
          if (setWithPlateDetails) {
            prefilledData.lastPlateDetails = setWithPlateDetails.plateDetails;
          }
        }
        return prefilledData;
      }

      return {
        ...exercise,
        status: 'pending',
        sets: []
      };
    });

    setActivePlaylist(exercisesWithPrefilledData);
    setActiveWorkoutType(workoutType);
    setCurrentView('workout');
  };

  // Gym Chaos A: Machine Unavailable (Skipping and replacing in active playlist)
  const handleMachineUnavailable = (exerciseId) => {
    const filteredPlaylist = activePlaylist.filter(ex => ex.id !== exerciseId);

    const primaryMuscleCounts = {};
    filteredPlaylist.forEach(ex => {
      primaryMuscleCounts[ex.primary] = (primaryMuscleCounts[ex.primary] || 0) + 1;
    });

    const { map: sequenceMap } = getExerciseSequenceMap(workoutHistory);
    const candidates = exercisesList.filter(
      ex => ex.bodyPart === activeWorkoutType && !ex.hibernated && !filteredPlaylist.some(p => p.id === ex.id)
    );

    const candidatesWithSeq = candidates.map(ex => ({
      ...ex,
      seq: sequenceMap[ex.id] || 0
    }));
    candidatesWithSeq.sort((a, b) => a.seq - b.seq);

    let replacement = null;
    for (const candidate of candidatesWithSeq) {
      const currentCount = primaryMuscleCounts[candidate.primary] || 0;
      if (currentCount < 2) {
        replacement = candidate;
        break;
      }
    }

    if (!replacement && candidatesWithSeq.length > 0) {
      replacement = candidatesWithSeq[0];
    }

    if (replacement) {
      let lastPerformance = null;
      for (let i = workoutHistory.length - 1; i >= 0; i--) {
        const entry = workoutHistory[i];
        const foundExercise = entry.exercises.find(e => normalizeExerciseId(e.id) === replacement.id);
        if (foundExercise && foundExercise.sets && foundExercise.sets.length > 0) {
          lastPerformance = foundExercise;
          break;
        }
      }

      const prefilledReplacement = {
        ...replacement,
        status: 'pending',
        sets: [],
        ...(lastPerformance ? {
          lastReps: lastPerformance.sets[lastPerformance.sets.length - 1].reps,
          lastWeight: lastPerformance.sets[lastPerformance.sets.length - 1].weight,
        } : {})
      };

      if (replacement.weightType === 'plate' && lastPerformance) {
        const setWithPlateDetails = [...lastPerformance.sets].reverse().find(s => s.plateDetails);
        if (setWithPlateDetails) {
          prefilledReplacement.lastPlateDetails = setWithPlateDetails.plateDetails;
        }
      }

      setActivePlaylist([...filteredPlaylist, prefilledReplacement]);
    } else {
      setActivePlaylist(filteredPlaylist);
    }
  };

  // Gym Chaos B: Add Exercise (Appending extra lift to end of playlist)
  const handleAddNewExercise = (exerciseId) => {
    if (activePlaylist.some(ex => ex.id === exerciseId)) {
      alert("This exercise is already in your active workout!");
      return;
    }

    const original = exercisesList.find(ex => ex.id === exerciseId);
    if (!original) return;

    let lastPerformance = null;
    for (let i = workoutHistory.length - 1; i >= 0; i--) {
      const entry = workoutHistory[i];
      const foundExercise = entry.exercises.find(e => normalizeExerciseId(e.id) === exerciseId);
      if (foundExercise && foundExercise.sets && foundExercise.sets.length > 0) {
        lastPerformance = foundExercise;
        break;
      }
    }

    const prefilledExercise = {
      ...original,
      status: 'pending',
      sets: [],
      ...(lastPerformance ? {
        lastReps: lastPerformance.sets[lastPerformance.sets.length - 1].reps,
        lastWeight: lastPerformance.sets[lastPerformance.sets.length - 1].weight,
      } : {})
    };

    if (original.weightType === 'plate' && lastPerformance) {
      const setWithPlateDetails = [...lastPerformance.sets].reverse().find(s => s.plateDetails);
      if (setWithPlateDetails) {
        prefilledExercise.lastPlateDetails = setWithPlateDetails.plateDetails;
      }
    }

    setActivePlaylist(prev => [...prev, prefilledExercise]);
  };

  // Complete Workout Session and Save Log
  const handleCompleteWorkout = () => {
    const completedExercises = activePlaylist.filter(
      ex => ex.status === 'completed' && ex.sets.some(set => set.reps || set.weight)
    );

    if (completedExercises.length === 0) {
      setActivePlaylist([]);
      setActiveWorkoutType(null);
      setCurrentView('selection');
      return;
    }

    const { nextSequenceNumber } = getExerciseSequenceMap(workoutHistory);
    let seq = nextSequenceNumber;

    const completedWithOrder = completedExercises.map(ex => ({
      ...ex,
      completionOrder: seq++
    }));

    let title = activeWorkoutType === 'upper' ? 'Upper Body / Core' : 'Legs';
    const hasLegsExtra = activeWorkoutType === 'upper' && completedWithOrder.some(ex => ex.bodyPart === 'legs');
    const hasUpperExtra = activeWorkoutType === 'legs' && completedWithOrder.some(ex => ex.bodyPart === 'upper');
    
    if (hasLegsExtra) title += ' w/ Legs Extra';
    if (hasUpperExtra) title += ' w/ Upper Extra';

    const newHistoryEntry = {
      id: Date.now(),
      date: new Date(),
      workoutType: title,
      exercises: completedWithOrder,
    };

    setWorkoutHistory(prev => [...prev, newHistoryEntry]);

    setActivePlaylist([]);
    setActiveWorkoutType(null);
    setCurrentView('selection');
  };

  // Handle Updates in active playlist
  const handleSetUpdate = (exerciseId, newSets) => {
    const exerciseToUpdate = activePlaylist.find(ex => ex.id === exerciseId);
    if (!exerciseToUpdate) return;

    const newStatus = exerciseToUpdate.status === 'pending' ? 'inProgress' : exerciseToUpdate.status;
    const updatedExercise = { ...exerciseToUpdate, sets: newSets, status: newStatus };

    setActivePlaylist(prev => prev.map(ex => ex.id === exerciseId ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const handleToggleComplete = (exerciseId, finalSets) => {
    let updatedExercise = null;
    setActivePlaylist(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const newStatus = ex.status === 'completed' ? 'inProgress' : 'completed';
        updatedExercise = { ...ex, status: newStatus, sets: finalSets };
        return updatedExercise;
      }
      return ex;
    }));

    if (updatedExercise) {
      setSelectedExercise(updatedExercise);
    }
  };

  // History Import / Export Settings
  const handleImportHistory = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedHistory = JSON.parse(e.target.result);
        if (!Array.isArray(importedHistory)) {
          throw new Error('Invalid history file format.');
        }

        if (window.confirm('Are you sure you want to replace your current history with the imported data?')) {
          const parsed = importedHistory.map(entry => ({ ...entry, date: new Date(entry.date) }));
          setWorkoutHistory(migrateWorkoutHistory(parsed));
          setCompletionCounters({ push: 0, pull: 0, legs: 0 }); // reset legacy counters
          alert('History imported successfully.');
          setCurrentView('selection');
        }
      } catch (error) {
        alert(`Failed to import history: ${error.message}`);
      }
    };
    reader.readAsText(file);
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
      alert('Workout history has been reset.');
      setCurrentView('selection');
    }
  };

  // Dialog helpers
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

  const handleViewHistoryDetail = (entry) => {
    setSelectedHistoryEntry(entry);
    setCurrentView('historyDetail');
  };

  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);

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
      case 'manageExercises':
        return <ManageExercises
          onNavigate={setCurrentView}
          exercisesList={exercisesList}
          onCreateExercise={handleCreateExercise}
          onDeleteExercise={handleDeleteExercise}
          onUpdateExercise={handleUpdateExercise}
        />;
      case 'historyDetail':
        return <HistoryDetail entry={selectedHistoryEntry} onNavigate={setCurrentView} />;
      case 'history':
        return <History history={workoutHistory} onNavigate={setCurrentView} onViewDetail={handleViewHistoryDetail} />;
      case 'workout':
        return (
          <>
            <Navigation 
              activeWorkoutType={activeWorkoutType}
              onCompleteWorkout={handleCompleteWorkout}
            />
            <WorkoutTabs 
              exercises={activePlaylist} 
              onExerciseClick={setSelectedExercise}
              onAddExerciseClick={() => setIsAddExerciseOpen(true)}
            />
          </>
        );
      case 'selection':
      default:
        return (
          <WorkoutSelection 
            onStartWorkout={handleStartWorkout} 
            onNavigate={setCurrentView}
            activeWorkoutType={activeWorkoutType}
            recommendedWorkout={getNextWorkoutType(workoutHistory)}
            generateWorkoutPreview={generateWorkoutPlaylist}
          />
        );
    }
  };

  return (
    <div className={styles.app}>
      <Header 
        onNavigateHome={() => setCurrentView('selection')} 
        onNavigateSettings={() => setCurrentView('settings')}
        countdown={countdown}
        isTimerActive={isTimerActive}
        initialDuration={initialDuration}
        stopTimer={stopTimer}
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
            countdown={countdown}
            isTimerActive={isTimerActive}
            initialDuration={initialDuration}
            startTimer={startTimer}
            stopTimer={stopTimer}
            onMachineUnavailable={handleMachineUnavailable}
          />
        </div>
      )}

      {isNumberModalOpen && (
        <NumberInputModal 
          initialValue={numberModalConfig.initialValue}
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

      {isAddExerciseOpen && (
        <AddExerciseModal
          onClose={() => setIsAddExerciseOpen(false)}
          onAddExercise={handleAddNewExercise}
          activePlaylist={activePlaylist}
          workoutHistory={workoutHistory}
          getExerciseSequenceMap={getExerciseSequenceMap}
          exercisesList={exercisesList}
        />
      )}
    </div>
  );
}

export default App;
