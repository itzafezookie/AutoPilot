import styles from './Settings.module.css';
import fezukLogo from '../assets/Fezuk Tech Logo.svg';

function Settings({ onExport, onImport, onReset, isDebugMode, onToggleDebugMode }) {
  const handleImportClick = () => {
    // This will trigger the hidden file input
    document.getElementById('import-file-input').click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h2 className={styles.title}>Settings</h2>
        <div className={styles.buttonGroup}>
          <button onClick={handleImportClick} className={styles.settingsButton}>
            Import History
          </button>
          <input 
            type="file" 
            id="import-file-input"
            style={{ display: 'none' }} 
            onChange={onImport}
            accept=".json"
          />
          <button onClick={onExport} className={styles.settingsButton}>
            Export History
          </button>
          <button onClick={onReset} className={`${styles.settingsButton} ${styles.dangerButton}`}>
            Reset History
          </button>
        </div>
        <div className={styles.debugSection}>
          <h3 className={styles.sectionTitle}>Debugging</h3>
          <div className={styles.toggleContainer}>
            <label htmlFor="debugModeToggle" className={styles.toggleLabel}>Debug Mode</label>
            <label className={styles.switch}>
              <input 
                id="debugModeToggle"
                type="checkbox" 
                checked={isDebugMode} 
                onChange={onToggleDebugMode} 
              />
              <span className={`${styles.slider} ${styles.round}`}></span>
            </label>
          </div>
          <p className={styles.debugInfo}>When enabled, all rest timers are set to 5 seconds.</p>
        </div>
      </div>
      <div className={styles.footer}>
        <img src={fezukLogo} alt="Fezuk Technologies Logo" className={styles.fezukLogo} />
        <p>Programmed by Fezuk Technologies via TRAE. <br>
        </br>&copy;{new Date().getFullYear()} All rights reserved.</p>
      </div>
    </div>
  );
}

export default Settings;
