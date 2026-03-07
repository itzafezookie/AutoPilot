import { useState, useEffect, useRef } from 'react';
import styles from './Navigation.module.css';

const WORKOUT_TYPES = ['push', 'pull', 'legs', 'full body'];

function Navigation({ activeWorkout, onWorkoutChange, onCompleteWorkout }) {
  const navRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({});

  useEffect(() => {
    if (navRef.current && activeWorkout) {
      const activeIndex = WORKOUT_TYPES.indexOf(activeWorkout);
      if (activeIndex !== -1) {
        const activeButton = navRef.current.children[activeIndex];
        if (activeButton) {
          setSliderStyle({
            left: activeButton.offsetLeft,
            width: activeButton.offsetWidth,
          });
        }
      }
    }
  }, [activeWorkout]); // Dependency array only needs activeWorkout

  return (
    <nav className={styles.nav} ref={navRef}>
      {WORKOUT_TYPES.map(type => (
        <button 
          key={type}
          className={`${styles.navButton} ${activeWorkout === type ? styles.active : ''}`}
          onClick={() => onWorkoutChange(type)}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
      <div className={styles.slider} style={sliderStyle} />
      <button className={styles.completeButton} onClick={onCompleteWorkout}>
        ✓
      </button>
    </nav>
  );
}

export default Navigation;
