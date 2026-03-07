import React, { useState } from 'react';
import styles from './NumberInputModal.module.css';

function NumberInputModal({ initialValue, onConfirm, onClose }) {
  const [value, setValue] = useState(String(initialValue || ''));

  const handleKeyPress = (key) => {
    if (value.length >= 5) return; // Limit input length
    setValue(value + key);
  };

  const handleBackspace = () => {
    setValue(value.slice(0, -1));
  };

  const handleConfirm = () => {
    onConfirm(value);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.display}>{value || '0'}</div>
        <div className={styles.keypad}>
          <button className={styles.key} onClick={() => handleKeyPress('1')}>1</button>
          <button className={styles.key} onClick={() => handleKeyPress('2')}>2</button>
          <button className={styles.key} onClick={() => handleKeyPress('3')}>3</button>
          <button className={styles.key} onClick={() => handleKeyPress('4')}>4</button>
          <button className={styles.key} onClick={() => handleKeyPress('5')}>5</button>
          <button className={styles.key} onClick={() => handleKeyPress('6')}>6</button>
          <button className={styles.key} onClick={() => handleKeyPress('7')}>7</button>
          <button className={styles.key} onClick={() => handleKeyPress('8')}>8</button>
          <button className={styles.key} onClick={() => handleKeyPress('9')}>9</button>
          <button className={`${styles.key} ${styles.clear}`} onClick={() => setValue('')}>C</button>
          <button className={styles.key} onClick={() => handleKeyPress('0')}>0</button>
          <button className={`${styles.key} ${styles.backspace}`} onClick={handleBackspace}>&larr;</button>
        </div>
        <div className={styles.controls}>
          <button className={styles.key} onClick={onClose}>Cancel</button>
          <button className={`${styles.key} ${styles.confirmButton}`} onClick={handleConfirm}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default NumberInputModal;
