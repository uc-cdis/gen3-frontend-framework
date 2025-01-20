import { openDB, IDBPDatabase } from 'idb';
import type { Cohort } from './cohortSlice';

const DB_NAME = 'gen3-cohort-store';
const DB_VERSION = 1;
const STORE_NAME = 'cohorts';

interface CohortDB {
  cohorts: {
    key: string;
    value: Cohort;
    indexes: { 'gen3-cohorts-by-name': string };
  };
}

/**
 * Initialize the IndexDB database for cohort storage
 * @returns Promise<IDBPDatabase<CohortDB>>
 */
export const initializeDB = async (): Promise<IDBPDatabase<CohortDB>> => {
  return openDB<CohortDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create the cohorts store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });
        // Create an index on the name field for quick lookups
        store.createIndex('by-name', 'name');
      }
    },
  });
};

/**
 * Save a cohort to IndexDB
 * @param cohort - The cohort to save
 * @returns Promise<string> - The ID of the saved cohort
 */
export const saveCohort = async (cohort: Cohort): Promise<string> => {
  try {
    const db = await initializeDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Save the cohort
    await store.put({
      ...cohort,
      saved: true,
      modified: false,
      modified_datetime: new Date().toISOString(),
    });

    await tx.done;
    return cohort.id;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to save cohort: ${errorMessage}`);
  }
};

/**
 * Load all cohorts from IndexDB
 * @returns Promise<Cohort[]>
 */
export const loadCohorts = async (): Promise<Cohort[]> => {
  try {
    const db = await initializeDB();
    return await db.getAll(STORE_NAME);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to load cohorts: ${errorMessage}`);
  }
};

/**
 * Get a list of all cohort IDs and names
 * @returns Promise<Array<{ id: string, name: string }>>
 */
export const getCohortList = async (): Promise<
  Array<{ id: string; name: string }>
> => {
  try {
    const db = await initializeDB();
    const cohorts = await db.getAll(STORE_NAME);
    return cohorts.map(({ id, name }) => ({ id, name }));
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get cohort list: ${errorMessage}`);
  }
};

/**
 * Delete a specific cohort by ID
 * @param cohortId - The ID of the cohort to delete
 * @returns Promise<void>
 */
export const deleteCohort = async (cohortId: string): Promise<void> => {
  try {
    const db = await initializeDB();
    await db.delete(STORE_NAME, cohortId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to delete cohort: ${errorMessage}`);
  }
};

/**
 * Delete all cohorts from the database
 * @returns Promise<void>
 */
export const deleteAllCohorts = async (): Promise<void> => {
  try {
    const db = await initializeDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).clear();
    await tx.done;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to delete all cohorts: ${errorMessage}`);
  }
};

/**
 * Load a specific cohort by ID
 * @param cohortId - The ID of the cohort to load
 * @returns Promise<Cohort | undefined>
 */
export const loadCohortById = async (
  cohortId: string,
): Promise<Cohort | undefined> => {
  try {
    const db = await initializeDB();
    return await db.get(STORE_NAME, cohortId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to load cohort: ${errorMessage}`);
  }
};

/**
 * Find a cohort by name
 * @param name - The name of the cohort to find
 * @returns Promise<Cohort | undefined>
 */
export const findCohortByName = async (
  name: string,
): Promise<Cohort | undefined> => {
  try {
    const db = await initializeDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-name');
    return await index.get(name);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to find cohort by name: ${errorMessage}`);
  }
};
