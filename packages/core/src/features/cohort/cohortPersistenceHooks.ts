import { useState, useCallback } from 'react';
import { CohortPersistence, CohortReturnStatus } from './cohortPersistence';
import { Cohort, CohortId } from './types';

/**
 * A custom hook that provides functionality for saving a cohort using an asynchronous operation.
 *
 * This hook manages the state for loading and error handling while performing the save operation.
 * It returns a function to trigger the save action, along with the current loading status
 * and any errors encountered during the operation.
 *
 * @returns {Object} An object containing the following properties:
 * - `saveCohort` (function): A callback function to save a cohort, which takes a `Cohort` object
 *   as an argument and returns a Promise that resolves to a `CohortReturnStatus` object containing
 *   the result of the save operation.
 * - `isLoading` (boolean): A flag indicating whether the save operation is currently in progress.
 * - `error` (string | null): An error message if the save operation fails, or `null` if no error occurred.
 */
export const useSavePersistedCohort = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCohort = useCallback(
    async (cohort: Cohort): Promise<CohortReturnStatus> => {
      setIsLoading(true);
      setError(null);

      try {
        const persistence = CohortPersistence.getInstance();
        const result = await persistence.saveCohort(cohort);

        if (result.isError) {
          setError(result.message);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        return {
          isError: true,
          status: 500,
          message: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { saveCohort, isLoading, error };
};

/**
 * Hook for retrieving a cohort by id
 */
export const useGetPersistedCohortById = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCohort = useCallback(
    async (id: CohortId): Promise<CohortReturnStatus> => {
      setIsLoading(true);
      setError(null);

      try {
        const persistence = CohortPersistence.getInstance();
        const result = await persistence.getCohort(id);

        if (result.isError) {
          setError(result.message);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        return {
          isError: true,
          status: 500,
          message: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { getCohort, isLoading, error };
};

/**
 * Hook for retrieving all cohorts
 */
export const useGetAllPersistedCohorts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[] | null>(null);

  const getAllCohorts = useCallback(async (): Promise<CohortReturnStatus> => {
    setIsLoading(true);
    setError(null);

    try {
      const persistence = CohortPersistence.getInstance();
      const result = await persistence.getAllCohorts();

      if (result.isError) {
        setError(result.message);
      } else if (result.cohorts) {
        setCohorts(result.cohorts);
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return {
        isError: true,
        status: 500,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getAllCohorts, cohorts, isLoading, error };
};

/**
 * Hook for updating a cohort
 */
export const useUpdatePersistedCohort = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCohort = useCallback(
    async (cohort: Cohort): Promise<CohortReturnStatus> => {
      setIsLoading(true);
      setError(null);

      try {
        const persistence = CohortPersistence.getInstance();
        const result = await persistence.updateCohort(cohort);

        if (result.isError) {
          setError(result.message);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        return {
          isError: true,
          status: 500,
          message: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { updateCohort, isLoading, error };
};

/**
 * Hook for deleting a cohort
 */
export const useDeletePersistedCohort = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCohort = useCallback(
    async (id: CohortId): Promise<CohortReturnStatus> => {
      setIsLoading(true);
      setError(null);

      try {
        const persistence = CohortPersistence.getInstance();
        const result = await persistence.deleteCohort(id);

        if (result.isError) {
          setError(result.message);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        return {
          isError: true,
          status: 500,
          message: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { deleteCohort, isLoading, error };
};

/**
 * Hook for clearing all cohorts
 */
export const useClearAllPersistedCohorts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearCohorts = useCallback(async (): Promise<CohortReturnStatus> => {
    setIsLoading(true);
    setError(null);

    try {
      const persistence = CohortPersistence.getInstance();
      const result = await persistence.clearCohorts();

      if (result.isError) {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return {
        isError: true,
        status: 500,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { clearCohorts, isLoading, error };
};
