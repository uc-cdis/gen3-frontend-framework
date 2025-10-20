import { IDBPDatabase, openDB } from 'idb';
import { StorageOperationResults } from '../../../types';
import { getTimestamp } from '../../../utils';
import { StorageEntity } from '../types';

export interface CohortStorageReturnStatus<T> extends StorageOperationResults {
  data?: T;
}

export interface CohortStorageConfig {
  databaseName: string;
  storeName: string;
  schemaVersion?: number;
}

export class CohortStorage<
  T extends StorageEntity<K>,
  K extends string | number = string,
> {
  private readonly databaseName: string;
  private readonly storeName: string;
  private readonly schemaVersion: number;

  constructor(config: CohortStorageConfig) {
    this.databaseName = config.databaseName;
    this.storeName = config.storeName;
    this.schemaVersion = config.schemaVersion || 1;
  }

  private getDb(): Promise<IDBPDatabase> {
    try {
      const storeName = this.storeName;
      return openDB(this.databaseName, this.schemaVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        },
      });
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(`Database initialization failed: ${errorMessage}`);
    }
  }

  // ===== CREATE OPERATIONS =====

  /**
   * Save a single cohort to the database
   */
  async saveCohort(cohort: T): Promise<StorageOperationResults> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).put(cohort);
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
  async saveCohorts(cohorts: T[]): Promise<StorageOperationResults> {
    if (cohorts.length === 0)
      return {
        isError: true,
        status: 400,
        message: 'cannot add an empty array',
      };

    try {
      const db = await this.getDb();
      const tx = db.transaction(this.storeName, 'readwrite');

      // Batch all operations in a single transaction for better performance
      await Promise.all([
        ...cohorts.map((cohort) => tx.store.put({ ...cohort, saved: true })),
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
  async getCohort(id: K): Promise<CohortStorageReturnStatus<T>> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const cohort = (await store.get(id)) satisfies T;
      return {
        status: 200,
        message: 'success',
        data: cohort,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      return {
        isError: true,
        status: 401,
        message: `cannot find cohort ${id}`,
      };
    }
  }

  /**
   * Get all cohorts from the database
   */
  async getAllCohorts(): Promise<CohortStorageReturnStatus<Record<K, T>>> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);

      const savedCohorts =
        (await store.getAll()) satisfies Array<T> as Array<T>;
      if (!savedCohorts) {
        return {
          isError: true,
          status: 500,
          message: 'no cohorts returned',
        };
      }
      const cohorts = savedCohorts.reduce(
        (acc: Record<K, T>, cohort) => {
          const { id } = cohort;
          acc[id] = cohort;
          return acc;
        },
        {} as Record<K, T>,
      );
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
  async searchCohortsByName(
    searchTerm: string,
  ): Promise<CohortStorageReturnStatus<Record<K, T>>> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const allCohorts = (await store.getAll(
        this.storeName,
      )) satisfies Array<T> as Array<T>;

      // Filter in memory for partial name matching
      const searchLower = searchTerm.toLowerCase();
      return {
        status: 200,
        message: 'success',
        data: allCohorts
          .filter((cohort) => cohort.name.toLowerCase().includes(searchLower))
          .reduce(
            (acc: Record<K, T>, cohort) => {
              const { id } = cohort;
              acc[id] = cohort;
              return acc;
            },
            {} as Record<K, T>,
          ),
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
      const db = await this.getDb();
      const total = await db.count(this.storeName);
      return {
        status: 200,
        message: 'success',
        data: total,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      return {
        isError: true,
        status: 401,
        message: 'cannot find cohort count',
      };
    }
  }

  // ===== UPDATE OPERATIONS =====

  /**
   * Update an existing cohort (full replacement)
   */
  async updateCohort(cohort: T): Promise<StorageOperationResults> {
    try {
      const db = await this.getDb();

      // Verify cohort exists before updating
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const existing = await store.get(cohort.id);
      if (!existing) {
        return {
          isError: true,
          status: 401,
          message: 'cohort not found',
        };
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
  async deleteCohort(id: K): Promise<StorageOperationResults> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      // Verify cohort exists before deleting
      const existing = await db.get(this.storeName, id);
      if (!existing) {
        return {
          isError: true,
          status: 401,
          message: 'cohort not found',
        };
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
      const db = await this.getDb();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
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
  async cohortExists(id: K): Promise<CohortStorageReturnStatus<boolean>> {
    try {
      const db = await this.getDb();
      // Verify cohort exists before deleting
      const existing = await db.get(this.storeName, id);
      return { status: 200, message: `${id}: ${existing ? 'true' : 'false'}` };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Unable search for cohort. Error: ${errorMessage}`,
      };
    }
  }

  /**
   * Export all cohorts as JSON
   */
  async exportCohorts(): Promise<CohortStorageReturnStatus<Record<K, T>>> {
    return await this.getAllCohorts();
  }

  /**
   * Import cohorts from JSON data
   */
  async importCohorts(
    cohorts: T[],
    overwrite: boolean = false,
  ): Promise<void | CohortStorageReturnStatus<T>> {
    try {
      if (overwrite) {
        await this.deleteAllCohorts();
      }
      await this.saveCohorts(cohorts);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Failed to import cohorts: ${errorMessage}`,
      };
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    try {
      const db = await this.getDb();
      db.close();
    } catch (error) {
      console.error('Failed to close database:', error);
    }
  }
}
