// hooks/useFirstTimeUse.ts
import { useEffect, useState } from 'react';
import { DEFAULT_EXPIRATION_DAYS, FTU_KEY, FTU_VALUE } from './constants';

type StorageError = {
  store: string;
  error: unknown;
};

type StoredData = {
  value: string;
  expiresAt: number;
};

function logStorageError({ store, error }: StorageError) {
  console.warn(`[useFirstTimeUse] Failed to access ${store}:`, error);
}

function getExpirationTimestamp(days: number): number {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

function setLocalStorage(expirationDays: number): void {
  try {
    const data: StoredData = {
      value: FTU_VALUE,
      expiresAt: getExpirationTimestamp(expirationDays),
    };
    localStorage.setItem(FTU_KEY, JSON.stringify(data));
  } catch (error) {
    logStorageError({ store: 'localStorage', error });
  }
}

function setSessionStorage(): void {
  try {
    sessionStorage.setItem(FTU_KEY, FTU_VALUE);
  } catch (error) {
    logStorageError({ store: 'sessionStorage', error });
  }
}

function setIndexedDB(expirationDays: number): void {
  try {
    const req = indexedDB.open('app_prefs', 1);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('flags')) {
        db.createObjectStore('flags');
      }
    };

    req.onsuccess = (e) => {
      try {
        const db = (e.target as IDBOpenDBRequest).result;
        const tx = db.transaction('flags', 'readwrite');
        const data: StoredData = {
          value: FTU_VALUE,
          expiresAt: getExpirationTimestamp(expirationDays),
        };
        tx.objectStore('flags').put(data, FTU_KEY);
        tx.onerror = () =>
          logStorageError({ store: 'indexedDB.transaction', error: tx.error });
      } catch (error) {
        logStorageError({ store: 'indexedDB.write', error });
      }
    };

    req.onerror = () =>
      logStorageError({ store: 'indexedDB.open', error: req.error });

    req.onblocked = () =>
      logStorageError({
        store: 'indexedDB.open',
        error: new Error('IndexedDB open blocked by an existing connection'),
      });
  } catch (error) {
    logStorageError({ store: 'indexedDB', error });
  }
}

function checkLocalStorage(): boolean {
  try {
    const item = localStorage.getItem(FTU_KEY);
    if (!item) return false;

    // Try parsing as JSON (new format with expiration)
    try {
      const data = JSON.parse(item);
      // Check if it's an object with the expected structure
      if (typeof data === 'object' && data !== null && 'value' in data) {
        const storedData = data as StoredData;
        if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
          // Expired, remove it
          localStorage.removeItem(FTU_KEY);
          return false;
        }
        return storedData.value === FTU_VALUE;
      }
      // Parsed as JSON but not the expected format - treat as legacy
      if (item === FTU_VALUE) {
        return true;
      }
      return false;
    } catch {
      // JSON parse failed - treat as legacy format (plain string)
      if (item === FTU_VALUE) {
        return true; // Still valid
      }
      return false;
    }
  } catch (error) {
    logStorageError({ store: 'localStorage.read', error });
    return false;
  }
}

function checkIndexedDB(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('app_prefs', 1);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('flags')) {
          db.createObjectStore('flags');
        }
      };

      req.onsuccess = (e) => {
        try {
          const db = (e.target as IDBOpenDBRequest).result;
          const getReq = db
            .transaction('flags')
            .objectStore('flags')
            .get(FTU_KEY);
          getReq.onsuccess = () => {
            const result = getReq.result;
            if (!result) {
              resolve(false);
              return;
            }

            // Check if it's the new format with expiration
            if (typeof result === 'object' && 'expiresAt' in result) {
              const data = result as StoredData;
              if (Date.now() > data.expiresAt) {
                // Expired, remove it
                const deleteTx = db.transaction('flags', 'readwrite');
                deleteTx.objectStore('flags').delete(FTU_KEY);
                resolve(false);
                return;
              }
              resolve(data.value === FTU_VALUE);
            } else {
              // Legacy format
              resolve(result === FTU_VALUE);
            }
          };
          getReq.onerror = () => {
            logStorageError({ store: 'indexedDB.get', error: getReq.error });
            resolve(false);
          };
        } catch (error) {
          logStorageError({ store: 'indexedDB.read', error });
          resolve(false);
        }
      };

      req.onerror = () => {
        logStorageError({ store: 'indexedDB.open', error: req.error });
        resolve(false);
      };

      req.onblocked = () => {
        logStorageError({
          store: 'indexedDB.open',
          error: new Error('IndexedDB open blocked by an existing connection'),
        });
        resolve(false);
      };
    } catch (error) {
      logStorageError({ store: 'indexedDB', error });
      resolve(false);
    }
  });
}

export function useFirstTimeUse() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAllStores = async (): Promise<boolean> => {
      // Check localStorage and IndexedDB (persists across logout)
      if (checkLocalStorage()) return true;
      if (await checkIndexedDB()) return true;
      return false;
    };

    checkAllStores().then((seen) => {
      setShowModal(!seen);
      setIsLoading(false);
    });
  }, []);

  const markSeen = (expirationDays: number = DEFAULT_EXPIRATION_DAYS) => {
    setLocalStorage(expirationDays);
    setSessionStorage();
    setIndexedDB(expirationDays);
    setShowModal(false);
  };

  return { showModal, markSeen, isLoading };
}
