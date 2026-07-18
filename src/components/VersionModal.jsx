import styles from './VersionModal.module.css';

const CHANGELOG = [
  {
    version: '2.1',
    date: 'July 18, 2026',
    changes: [
      'Alternating category recommendations correctly even for partial workouts.',
      'Simplified workout history to show only formatted dates and only completed exercises.',
      'Interactive sliding toggle on the main screen to switch workout categories manually.',
      'Ability to delete standard preloaded exercises in addition to custom ones.',
      'Decimal value input support on the weight entry keypad with inline Clear action.',
      'Dynamic muscle list compilation and custom muscle target creation.'
    ]
  },
  {
    version: '2.0',
    date: 'June 27, 2026',
    changes: [
      'Initial release of Workout Tracker v2.',
      'Plate calculator integration.',
      'Wake lock rest timers.',
      'History backup and restore features.'
    ]
  }
];

function VersionModal({ isOpen, onClose, version }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Version Information</h2>
        <p className={styles.version}>AutoPilot v{version}</p>
        
        <div className={styles.changelogSection}>
          <h3 className={styles.changelogTitle}>What's New</h3>
          <div className={styles.changelogList}>
            {CHANGELOG.map((release) => (
              <div key={release.version} className={styles.release}>
                <div className={styles.releaseHeader}>
                  <span className={styles.releaseVersion}>v{release.version}</span>
                  <span className={styles.releaseDate}>{release.date}</span>
                </div>
                <ul className={styles.releaseChanges}>
                  {release.changes.map((change, index) => (
                    <li key={index} className={styles.changeItem}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className={styles.copyright}>&copy; {new Date().getFullYear()} Fezuk Technologies. All rights reserved.</p>
        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  );
}

export default VersionModal;
