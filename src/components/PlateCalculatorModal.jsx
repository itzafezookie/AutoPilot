import React, { useState, useEffect } from 'react';
import styles from './PlateCalculatorModal.module.css';

const PLATE_WEIGHTS = [45, 25, 10];

function PlateCalculatorModal({ onConfirm, onClose, initialValue, openNumberModal }) {
  // Set initial state based on whether initialValue is a detailed object or just a number
  const getInitialState = () => {
    if (initialValue && typeof initialValue === 'object' && initialValue.plateCounts) {
      return {
        sled: initialValue.sledWeight || 90,
        plates: initialValue.plateCounts || { 45: 0, 25: 0, 10: 0 },
      };
    }
    // Fallback for when initialValue is just a number or undefined
    return {
      sled: 90,
      plates: { 45: 0, 25: 0, 10: 0 },
    };
  };

  const [sledWeight, setSledWeight] = useState(getInitialState().sled);
  const [plateCounts, setPlateCounts] = useState(getInitialState().plates);

  const totalWeight = sledWeight + (Object.entries(plateCounts).reduce(
    (acc, [weight, count]) => acc + (parseInt(weight) * count), 0
  ) * 2);

  const handlePlateChange = (weight, delta) => {
    setPlateCounts(prev => ({
      ...prev,
      [weight]: Math.max(0, prev[weight] + delta)
    }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Plate Calculator</h2>
        
        <div className={styles.calculator}>
          <div className={styles.sledInput}>
            <label>Sled Weight (lbs)</label>
            <div 
              className={styles.numberInput}
              onClick={() => openNumberModal(sledWeight, (newValue) => setSledWeight(Number(newValue) || 0))}
            >
              {sledWeight}
            </div>
          </div>

          {PLATE_WEIGHTS.map(weight => (
            <div key={weight} className={styles.plateRow}>
              <span className={styles.plateLabel}>{weight} lbs</span>
              <div className={styles.plateControls}>
                <button onClick={() => handlePlateChange(weight, -1)}>-</button>
                <span className={styles.plateCount}>{plateCounts[weight]}</span>
                <button onClick={() => handlePlateChange(weight, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.totalWeight}>
          Total: <span>{totalWeight} lbs</span>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.controlButton}>Cancel</button>
          <button onClick={() => onConfirm({ totalWeight, plateCounts, sledWeight })} className={`${styles.controlButton} ${styles.confirmButton}`}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default PlateCalculatorModal;