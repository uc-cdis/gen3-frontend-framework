import { useState, useCallback } from 'react';
import { CohortPersistence } from './cohortPersistence';
import {
  Cohort,
  CohortId,
  CohortPersistenceSaveUpdateParameters,
} from './types';
import { useCoreDispatch } from '../../hooks';
import { addUnsavedCohort, createNewCohort, removeCohort } from './cohortSlice';

export interface CohortPersistenceError {
  status: number;
  message: string;
}

export interface SaveOrUpdateCohortResult {
  cohortAlreadyExists: boolean;
  newCohortId?: string;
}

/**
 * A custom hook that for saving a cohort using an asynchronous operation.
 * This hook is used in the Cohort Manager and is mostly compatible with the GDC Data portal.
 *
 * This hook manages the state for loading and error handling while performing the save operation.
 * It returns a function to trigger the save action, along with the current loading status
 * and any errors encountered during the operation. If the passed cohort has the same name as
 * an existing cohort, the save operation will fail.
 *
 * @param {boolean} enforceUniqueNames - If true, the save operation will fail if the cohort has the same name as an existing cohort.
 *
 * @returns {Object} An object containing the following properties:
 * - `saveCohort` (function): A callback function to save a cohort, which takes a `Cohort` object
 *   as an argument and returns a Promise that resolves to a `CohortReturnStatus` object containing
 *   the result of the save operation.
 * - `isLoading` (boolean): A flag indicating whether the save operation is currently in progress.
 * - `error` (string | null): An error message if the save operation fails, or `null` if no error occurred.
 */

export const useSavePersistedCohort = (enforceUniqueNames: boolean = true) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CohortPersistenceError | null>(null);

  const saveCohort = useCallback(
    async ({
      newName,
      cohortId,
      filters,
    }: CohortPersistenceSaveUpdateParameters): Promise<SaveOrUpdateCohortResult> => {
      setIsLoading(true);
      setError(null);

      let result: SaveOrUpdateCohortResult = {
        cohortAlreadyExists: false,
        newCohortId: undefined,
      };
      try {
        const persistence = CohortPersistence.getInstance();
        const cohortExists = await persistence.checkIfCohortNameExists(newName);

        if (
          enforceUniqueNames &&
          cohortExists?.cohortByNameExists !== undefined &&
          cohortExists.cohortByNameExists
        ) {
          result = { cohortAlreadyExists: true, newCohortId: undefined };
          setError({
            status: 409,
            message: `A cohort with the name ${newName} already exists. Please choose a different name.`,
          });
        } else {
          const saveResult = await persistence.saveCohort({
            name: newName,
            id: cohortId,
            filters,
            modified_datetime: new Date().toISOString(),
            modified: false,
          });

          if (saveResult.isError) {
            setError({
              status: saveResult.status,
              message: saveResult.message,
            });
          } else {
            result = {
              cohortAlreadyExists: false,
              newCohortId: saveResult?.cohort?.id,
            };
          }
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError({
          status: 500,
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }

      return result;
    },
    [],
  );

  return { saveCohort, isLoading, error, isError: error !== null };
};

export const useReplaceExistingPersistedCohort = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CohortPersistenceError | null>(null);

  const dispatch = useCoreDispatch();

  const replaceCohort = useCallback(
    async ({
      newName,
      cohortId,
      filters,
    }: CohortPersistenceSaveUpdateParameters): Promise<SaveOrUpdateCohortResult> => {
      setIsLoading(true);
      setError(null);

      let result: SaveOrUpdateCohortResult = {
        cohortAlreadyExists: false,
        newCohortId: undefined,
      };
      try {
        const persistence = CohortPersistence.getInstance();
        const existingCohort = await persistence.getCohort(cohortId);

        // cohort exists, delete it
        if (!existingCohort.isError) {
          await persistence.deleteCohort(cohortId);
          dispatch(
            removeCohort({
              shouldShowMessage: false,
              id: cohortId,
            }),
          );

          // now we can add a new cohort

          const newCohort = createNewCohort({
            filters,
            customName: newName,
            id: cohortId,
          });
          dispatch(addUnsavedCohort(newCohort));

          const saveResult = await persistence.saveCohort(newCohort);

          if (saveResult.isError) {
            setError({
              status: saveResult.status,
              message: saveResult.message,
            });
          } else {
            result = {
              cohortAlreadyExists: false,
              newCohortId: saveResult?.cohort?.id,
            };
          }
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError({
          status: 500,
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }

      return result;
    },
    [],
  );

  return { replaceCohort, isLoading, error, isError: error !== null };
};

/**
 * Hook for retrieving a cohort by id
 */
export const useGetPersistedCohortById = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CohortPersistenceError | null>(null);

  const getCohort = useCallback(async (id: CohortId): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const persistence = CohortPersistence.getInstance();
      const result = await persistence.getCohort(id);

      if (result.isError) {
        setError({
          status: result.status,
          message: result.message,
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError({
        status: 500,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getCohort, isLoading, error, isError: error !== null };
};

/**
 * Hook for retrieving all cohorts
 */
export const useGetAllPersistedCohorts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CohortPersistenceError | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[] | null>(null);

  const getAllCohorts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const persistence = CohortPersistence.getInstance();
      const result = await persistence.getAllCohorts();

      if (result.isError) {
        setError({
          status: result.status,
          message: result.message,
        });
      } else if (result.cohorts) {
        setCohorts(result.cohorts);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError({
        status: 500,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getAllCohorts, cohorts, isLoading, error, isError: error !== null };
};

/**
 * Hook for updating a cohort
 */
export const useUpdatePersistedCohort = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CohortPersistenceError | null>(null);

  // @ts-ignore
  const updateCohort = useCallback(async (cohort: Cohort): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const persistence = CohortPersistence.getInstance();
      const result = await persistence.updateCohort(cohort);

      if (result.isError) {
        setError({
          status: result.status,
          message: result.message,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError({
        status: 500,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateCohort, isLoading, error, isError: error !== null };
};

/**
 * Hook for deleting a cohort
 */
export const useDeletePersistedCohort = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CohortPersistenceError | null>(null);

  const deleteCohort = useCallback(async (id: CohortId): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const persistence = CohortPersistence.getInstance();
      const result = await persistence.deleteCohort(id);

      if (result.isError) {
        setError({
          status: result.status,
          message: result.message,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError({
        status: 500,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteCohort, isLoading, error, isError: error !== null };
};

/**
 * Hook for clearing all cohorts
 */
export const useClearAllPersistedCohorts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CohortPersistenceError | null>(null);

  const clearCohorts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const persistence = CohortPersistence.getInstance();
      const result = await persistence.clearCohorts();

      if (result.isError) {
        setError({
          status: result.status,
          message: result.message,
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError({
        status: 500,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { clearCohorts, isLoading, error, isError: error !== null };
};

export const useGetAllCohortNames = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CohortPersistenceError | null>(null);
  const [cohortNames, setCohortNames] = useState<string[] | null>(null);

  const getAllCohortNames = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const persistence = CohortPersistence.getInstance();
      const result = await persistence.getAllCohortNames();

      if (result.isError) {
        setError({
          status: result.status,
          message: result.message,
        });
      } else if (result.names) {
        setCohortNames(result.names);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError({
        status: 500,
        message: errorMessage,
      });
    }
  }, []);

  return {
    getAllCohortNames,
    cohortNames,
    isLoading,
    error,
    isError: error !== null,
  };
};
