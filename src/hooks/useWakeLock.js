import { useState, useEffect, useCallback } from 'react';

let wakeLock = null;

export const useWakeLock = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      console.log('Wake Lock API not supported.');
      return;
    }
    if (wakeLock) {
      console.log('Wake Lock is already active.');
      return;
    }
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock is active.');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock was released.');
        wakeLock = null;
      });
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (!wakeLock) return;
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestWakeLock]);

  return { isSupported, requestWakeLock, releaseWakeLock };
};