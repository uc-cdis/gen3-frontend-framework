import { openDB, IDBPDatabase } from 'idb';
import { StorageOperationResults, getTimestamp} from '@gen3/core';
import { Cohort, CohortId } from '../types';
import { CohortStorageReturnStatus, } from './types';

const DATABASE_NAME = 'Gen3CohortDiscovery';
const STORE_NAME = 'cohorts';
const DB_SCHEMA_VERSION = 1;

export class CohortStorage {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initializeDB();
  }

  /**
   * Initialize the IndexedDB database with proper schema
   */
  private async initializeDB(): Promise<IDBPDatabase> {
    try {
      return await openDB(DATABASE_NAME, DB_SCHEMA_VERSION, {
        upgrade: (db, oldVersion, newVersion, transaction) => {

          // Version 1: Initial schema
          if (oldVersion < 1) {
            const store = db.createObjectStore(STORE_NAME, {
              keyPath: 'id'
            });
          }
        },

        blocked: () => {
          console.warn('CohortDB: Database upgrade blocked by another connection');
        },

        blocking: () => {
          console.warn('CohortDB: This connection is blocking a database upgrade');
        },

        terminated: () => {
          console.error('CohortDB: Database connection terminated unexpectedly');
        }
      });
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(`Database initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Get the database instance
   */
  private async getDB(): Promise<IDBPDatabase> {
    return await this.dbPromise;
  }

  // ===== CREATE OPERATIONS =====

  /**
   * Save a single cohort to the database
   */
  async saveCohort(cohort: Cohort): Promise<StorageOperationResults> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(cohort);
      await tx.done;
      return { status: 200, message: 'cohort added' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      return { isError: true, status: 500, message: 'unable to save cohort' };
    }
  }

  /**
   * Save multiple cohorts in a single transaction (bulk operation)
   */
  async saveCohorts(cohorts: Cohort[]): Promise<StorageOperationResults> {
    if (cohorts.length === 0) return { isError: true, status: 400, message: 'cannot add an empty array' };;

    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');

      // Batch all operations in single transaction for better performance
      await Promise.all([
        ...cohorts.map((cohort) => tx.store.put({ ...cohort, saved: true
        })),
        tx.done,
      ]);
      return { status: 200, message: 'cohorts added' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      return { isError: true, status: 500, message: 'unable to save cohort' };
    }
  }

  // ===== READ OPERATIONS =====

  /**
   * Get a specific cohort by ID
   */
  async getCohort(id: CohortId): Promise<CohortStorageReturnStatus<Cohort>> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const cohort = (await store.get(id)) satisfies Cohort;
      return {
        status: 200,
        message: 'success',
        data: cohort };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      return { isError: true, status: 401, message: `cannot find cohort ${id}` };
    }
  }

  /**
   * Get all cohorts from the database
   */
  async getAllCohorts(): Promise<CohortStorageReturnStatus<Record<CohortId, Cohort>>> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      const savedCohorts = (await store.getAll()) satisfies Array<Cohort> as Array<Cohort>;
      if (!savedCohorts) {
        return {
          isError: true,
          status: 500,
          message: 'no cohorts returned',
        }
      }
      const cohorts = savedCohorts.reduce((acc: Record<CohortId, Cohort>, cohort) => {
        const { id } = cohort;
        acc[id] = cohort;
        return acc;
      }, {});
      return {
        status: 200,
        message: 'success',
        data: cohorts,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      return { isError: true, status: 401, message: 'cannot return cohorts' };
    }
  }

  /**
   * Search cohorts by name (case-insensitive partial match)
   */
  async searchCohortsByName(searchTerm: string): Promise<CohortStorageReturnStatus<Record<CohortId, Cohort>>> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const allCohorts = await store.getAll(STORE_NAME) satisfies Array<Cohort> as Array<Cohort>;

      // Filter in memory for partial name matching
      const searchLower = searchTerm.toLowerCase();
      return {
        status: 200,
        message: 'success',
        data: allCohorts.filter(cohort =>
          cohort.name.toLowerCase().includes(searchLower)).reduce((acc: Record<CohortId, Cohort>, cohort) => {
            const { id } = cohort;
            acc[id] = cohort;
            return acc;
          }, {})
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      return { isError: true, status: 401, message: 'cannot find cohorts' };
    }
  }

  /**
   * Count total number of cohorts
   */
  async getCohortCount(): Promise<CohortStorageReturnStatus<number>> {
    try {
      const db = await this.getDB();
      const total =  await db.count(STORE_NAME);
      return {
        status: 200,
        message: 'success',
        data: total
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      return { isError: true, status: 401, message: 'cannot find cohort count' };
    }

  }

  // ===== UPDATE OPERATIONS =====

  /**
   * Update an existing cohort (full replacement)
   */
  async updateCohort(cohort: Cohort): Promise<StorageOperationResults> {
    try {
      const db = await this.getDB();

      // Verify cohort exists before updating
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const existing = await store.get(cohort.id);
      if (!existing) {
        return {
          isError: true,
          status: 401,
          message: 'cohort not found',
        }
      }

      const timestamp = getTimestamp();
      const updated = {
        ...existing,
        modifiedDatetime: timestamp,
      };

      store.put(updated);
      await tx.done;
      return { status: 200, message: 'success' };
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        isError: true,
        status: 500,
        message: `Unable to update cohort: ${cohort.id}. Error: ${errorMessage}`,
      };
    }
  }

  // ===== DELETE OPERATIONS =====

  /**
   * Delete a specific cohort by ID
   */
  async deleteCohort(id: CohortId): Promise<StorageOperationResults> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      // Verify cohort exists before deleting
      const existing = await db.get(STORE_NAME, id);
      if (!existing) {
        return {
          isError: true,
          status: 401,
          message: 'cohort not found',
        }
      }

      store.delete(id);
      await tx.done;
      return { status: 200, message: `${id} deleted` };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Unable to delete cohort: ${id}. Error: ${errorMessage}`,
      };
    }
  }

  /**
   * Delete all cohorts from the database
   */
  async deleteAllCohorts(): Promise<StorageOperationResults> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      await tx.done;
      return { status: 200, message: `all cohorts deleted` };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Unable to delete all cohorts. Error: ${errorMessage}`,
      };
    }
  }

  // ===== UTILITY OPERATIONS =====

  /**
   * Check if a cohort exists
   */
  async cohortExists(id: CohortId): Promise<CohortStorageReturnStatus<boolean>> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      // Verify cohort exists before deleting
      const existing = await db.get(STORE_NAME, id);

      return {
        return cohort !== undefined;
      }

      return cohort !== undefined;
    } catch (error) {
      console.error(`Failed to check if cohort exists ${id}:`, error);
      return false;
    }
  }

  /**
   * Export all cohorts as JSON
   */
  async exportCohorts(): Promise<CohortStorageReturnStatus<Record<CohortId, Cohort>>> {
    return await this.getAllCohorts();
  }

  /**
   * Import cohorts from JSON data
   */
  async importCohorts(cohorts: Cohort[], overwrite: boolean = false): Promise<void> {
    try {
      if (overwrite) {
        await this.deleteAllCohorts();
      }

      await this.saveCohorts(cohorts);
      console.log(`Imported ${cohorts.length} cohorts`);
    } catch (error) {
      console.error('Failed to import cohorts:', error);
      throw new Error(`Failed to import cohorts: ${error.message}`);
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    try {
      const db = await this.getDB();
      db.close();
      console.log('CohortDB connection closed');
    } catch (error) {
      console.error('Failed to close database:', error);
    }
  }

}

// Export a singleton instance
export const cohortStorage = new CohortStorage();