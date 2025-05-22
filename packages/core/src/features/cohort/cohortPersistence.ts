import { IDBPDatabase, openDB } from 'idb';
import { type Cohort, type CohortId } from './types';

const DATABASE_NAME = 'Gen3CohortPersistence';
const STORE_NAME = 'Gen3Cohorts';

/**
 * Interface for the result of a cohort storage operation
 */
export interface CohortOperationResult {
  isError?: boolean;
  status: number;
  message: string;
}

/**
 * Interface for the result of a cohort storage operation that returns cohort data
 */
export interface CohortReturnStatus extends CohortOperationResult {
  cohort?: Cohort;
  cohorts?: Cohort[];
}

/**
 * Class for persisting cohorts to IndexedDB
 */
export class CohortPersistence {
  private static instance: CohortPersistence;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Static method to get the singleton instance
  public static getInstance(): CohortPersistence {
    if (!CohortPersistence.instance) {
      CohortPersistence.instance = new CohortPersistence();
    }
    return CohortPersistence.instance;
  }

  private getDb(): Promise<IDBPDatabase> {
    return openDB(DATABASE_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  /**
   * Create or update a cohort in the database
   * @param cohort The cohort to save
   * @returns A CohortReturnStatus with the saved cohort
   */
  async saveCohort(cohort: Cohort): Promise<CohortReturnStatus> {
    try {
      const db = await this.getDb();
      await db.put(STORE_NAME, cohort);
      return {
        status: 200,
        message: 'Cohort saved successfully',
        cohort,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Failed to save cohort: ${errorMessage}`,
      };
    }
  }

  /**
   * Get a cohort by its ID
   * @param id The ID of the cohort to retrieve
   * @returns A CohortReturnStatus with the cohort if found
   */
  async getCohort(id: CohortId): Promise<CohortReturnStatus> {
    try {
      const db = await this.getDb();
      const cohort = await db.get(STORE_NAME, id);

      if (!cohort) {
        return {
          isError: true,
          status: 404,
          message: `Cohort with ID ${id} not found`,
        };
      }

      return {
        status: 200,
        message: 'Cohort retrieved successfully',
        cohort,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Failed to get cohort: ${errorMessage}`,
      };
    }
  }

  /**
   * Get all cohorts from the database
   * @returns A CohortReturnStatus with an array of all cohorts
   */
  async getAllCohorts(): Promise<CohortReturnStatus> {
    try {
      const db = await this.getDb();
      const cohorts = await db.getAll(STORE_NAME);

      return {
        status: 200,
        message: 'Cohorts retrieved successfully',
        cohorts,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Failed to get cohorts: ${errorMessage}`,
      };
    }
  }

  /**
   * Update an existing cohort
   * @param cohort The cohort with updated values
   * @returns A CohortReturnStatus with the updated cohort
   */
  async updateCohort(cohort: Cohort): Promise<CohortReturnStatus> {
    try {
      const db = await this.getDb();
      const existingCohort = await db.get(STORE_NAME, cohort.id);

      if (!existingCohort) {
        return {
          isError: true,
          status: 404,
          message: `Cohort with ID ${cohort.id} not found`,
        };
      }

      const updatedCohort = {
        ...existingCohort,
        ...cohort,
        modified_datetime: new Date().toISOString(),
      };

      await db.put(STORE_NAME, updatedCohort);

      return {
        status: 200,
        message: 'Cohort updated successfully',
        cohort: updatedCohort,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Failed to update cohort: ${errorMessage}`,
      };
    }
  }

  /**
   * Delete a cohort by its ID
   * @param id The ID of the cohort to delete
   * @returns A CohortReturnStatus indicating success or failure
   */
  async deleteCohort(id: CohortId): Promise<CohortReturnStatus> {
    try {
      const db = await this.getDb();
      const existingCohort = await db.get(STORE_NAME, id);

      if (!existingCohort) {
        return {
          isError: true,
          status: 404,
          message: `Cohort with ID ${id} not found`,
        };
      }

      await db.delete(STORE_NAME, id);

      return {
        status: 200,
        message: `Cohort with ID ${id} deleted successfully`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Failed to delete cohort: ${errorMessage}`,
      };
    }
  }

  /**
   * Clear all cohorts from the database
   * @returns A CohortReturnStatus indicating success or failure
   */
  async clearCohorts(): Promise<CohortReturnStatus> {
    try {
      const db = await this.getDb();
      await db.clear(STORE_NAME);

      return {
        status: 200,
        message: 'All cohorts cleared successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Failed to clear cohorts: ${errorMessage}`,
      };
    }
  }
}
