/* global __APP_VERSION__ */
import { useState } from 'react';
import styles from './Header.module.css';
import logoUrl from '../assets/AutoPilot Logo.svg';
import homeIconUrl from '../assets/home-icon.svg';
import settingsIconUrl from '../assets/gear-icon.svg';
import VersionModal from './VersionModal';

function Header({ onNavigateHome, onNavigateSettings, countdown, isTimerActive, initialDuration, stopTimer }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const progress = initialDuration > 0 ? (countdown / initialDuration) * 100 : 100;

  return (
    <>
      <header className={styles.header}>
        <img 
          src={logoUrl} 
          alt="AutoPilot Logo" 
          className={styles.logo}
          onClick={() => setIsModalOpen(true)}
        />
        
        {isTimerActive && (
          <div 
            className={styles.timerPill} 
            onClick={stopTimer} 
            title="Click to cancel timer"
          >
            <div 
              className={styles.timerPillProgress} 
              style={{ width: `${progress}%` }} 
            />
            <span className={styles.timerPillText}>{formatTime(countdown)}</span>
          </div>
        )}

        <div className={styles.navButtons}>
          <button onClick={onNavigateSettings} className={styles.navButton}>
            <img src={settingsIconUrl} alt="Settings" className={styles.navIcon} />
          </button>
          <button onClick={onNavigateHome} className={styles.navButton}>
            <img src={homeIconUrl} alt="Home" className={styles.navIcon} />
          </button>
        </div>
      </header>
      
      <VersionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        version={__APP_VERSION__} 
      />
    </>
  );
}

export default Header;
