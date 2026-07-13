'use client';

/**
 * Safe localStorage hook with SSR check.
 * In Node.js v25+, the global localStorage exists but is broken — this handles that too.
 */
import { useState, useEffect, useCallback } from 'react';

function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = '__storage_test__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (!isStorageAvailable()) return;
    try {
      const item = window.localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    } catch { /* ignore */ }
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      if (isStorageAvailable()) {
        try { window.localStorage.setItem(key, JSON.stringify(newValue)); } catch { /* ignore */ }
      }
      return newValue;
    });
  }, [key]);

  return [storedValue, setValue];
}
