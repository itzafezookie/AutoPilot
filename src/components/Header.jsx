import { useState } from 'react';
import styles from './Header.module.css';
import logoUrl from '../assets/AutoPilot Logo.svg';
import homeIconUrl from '../assets/home-icon.svg';
import settingsIconUrl from '../assets/gear-icon.svg';
import VersionModal from './VersionModal';

function Header({ onNavigateHome, onNavigateSettings }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <img 
          src={logoUrl} 
          alt="AutoPilot Logo" 
          className={styles.logo}
          onClick={() => setIsModalOpen(true)}
        />
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
