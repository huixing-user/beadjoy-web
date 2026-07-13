// Polyfill for Node.js v25+ broken experimental localStorage
// Node.js v25 ships with an experimental global localStorage proxy
// that lacks getItem/setItem/removeItem methods, causing SSR crashes.
'use strict';

if (
  typeof localStorage === 'object' &&
  typeof localStorage.getItem !== 'function'
) {
  const store = new Map();

  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key) => store.get(String(key)) ?? null,
      setItem: (key, value) => store.set(String(key), String(value)),
      removeItem: (key) => store.delete(String(key)),
      clear: () => store.clear(),
      get length() { return store.size; },
      key: (index) => Array.from(store.keys())[index] ?? null,
    },
    writable: true,
    configurable: true,
  });

  console.log('[polyfill] Replaced broken Node.js v25 experimental localStorage');
}
