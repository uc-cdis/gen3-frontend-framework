// hooks/useFirstTimeUse.ts
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { DEFAULT_EXPIRATION_DAYS, FTU_KEY, FTU_VALUE } from './constants';

type StorageError = {
  store: string;
  error: unknown;
};

function logStorageError({ store, error }: StorageError) {
  console.warn(`[useFirstTimeUse] Failed to access ${store}:`, error);
}

function getCookieExpiry(days: number): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return expires;
}

function setLocalStorage(): void {
  try {
    localStorage.setItem(FTU_KEY, FTU_VALUE);
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

function setIndexedDB(): void {
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
        tx.objectStore('flags').put(FTU_VALUE, FTU_KEY);
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
    return localStorage.getItem(FTU_KEY) === FTU_VALUE;
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
          getReq.onsuccess = () => resolve(getReq.result === FTU_VALUE);
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
  const [cookies, setCookie] = useCookies([FTU_KEY]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAllStores = async (): Promise<boolean> => {
      // react-cookie handles the cookie check reactively
      if (cookies[FTU_KEY] === FTU_VALUE) return true;
      if (checkLocalStorage()) return true;
      if (await checkIndexedDB()) return true;
      return false;
    };

    checkAllStores().then((seen) => {
      setShowModal(!seen);
      setIsLoading(false);
    });
  }, [cookies]);

  const markSeen = (expirationDays: number = DEFAULT_EXPIRATION_DAYS) => {
    setCookie(FTU_KEY, FTU_VALUE, {
      path: '/',
      expires: getCookieExpiry(expirationDays),
      sameSite: 'lax',
    });
    setLocalStorage();
    setSessionStorage();
    setIndexedDB();
    setShowModal(false);
  };

  return { showModal, markSeen, isLoading };
}
