import styles from './VersionModal.module.css';

function VersionModal({ isOpen, onClose, version }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Version Information</h2>
        <p className={styles.version}>AutoPilot v{version}</p>
        <p className={styles.copyright}>&copy; {new Date().getFullYear()} Fezuk Technologies. All rights reserved.</p>
        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  );
}

export default VersionModal;
