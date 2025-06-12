import { useState, useCallback } from 'react';
import { useDeepCompareCallback } from 'use-deep-compare';
import { CohortPersistence } from './cohortPersistence';
import {
  Cohort,
  CohortId,
  CohortPersistenceSaveReplaceParameters,
} from './types';
import { useCoreDispatch, useCoreSelector } from '../../hooks';
import {
  addUnsavedCohort,
  createNewCohort,
  removeCohort,
  selectCurrentCohort,
  //  updateSavedState,
  selectCohortById,
} from './cohortSlice';

export interface CohortPersistenceError {
  status: number;
  message: string;
}

export interface ReplacePersistedCohortResults {
  newCohortId?: string;
}

export interface SavePersistedCohortResult
  extends ReplacePersistedCohortResults {
  cohortAlreadyExists?: boolean;
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

export const useSavePersistedCohort = () => {
  const dispatch = useCoreDispatch();
  const saveCohort = useDeepCompareCallback(
    async ({
      newName,
      cohortId,
      // filters,
    }: CohortPersistenceSaveReplaceParameters): Promise<SavePersistedCohortResult> => {
      let result: SavePersistedCohortResult = {
        cohortAlreadyExists: false,
        newCohortId: undefined,
      };
      const persistence = CohortPersistence.getInstance();
      const cohortExists = await persistence.checkIfCohortNameExists(newName);
      const currentCohort = useCoreSelector((state) =>
        selectCohortById(state, cohortId),
      );
      if (
        cohortExists?.cohortByNameExists !== undefined &&
        cohortExists.cohortByNameExists
      ) {
        result = {
          cohortAlreadyExists: true,
          newCohortId: undefined,
        };
      } else {
        // const newCohort = createNewCohort({
        //   filters,
        //   customName: newName,
        //   id: cohortId,
        // });

        const saveResult = await persistence.saveCohort(currentCohort);
        // dispatch(updateSavedState(newCohort));
        result = {
          cohortAlreadyExists: false,
          newCohortId: saveResult?.cohort?.id,
        };
      }

      return result;
    },
    [dispatch],
  );

  return saveCohort;
};

export const useReplaceExistingPersistedCohort = () => {
  const dispatch = useCoreDispatch();

  const replaceCohort = useCallback(
    async ({
      newName,
      cohortId,
      filters,
    }: CohortPersistenceSaveReplaceParameters): Promise<ReplacePersistedCohortResults> => {
      let result: ReplacePersistedCohortResults = {
        newCohortId: undefined,
      };
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
        result = {
          newCohortId: saveResult?.cohort?.id,
        };
      }

      return result;
    },
    [],
  );

  return replaceCohort;
};

/**
 * Hook for retrieving a cohort by id
 */
export const useGetPersistedCohortById = () => {
  const getCohort = useCallback(
    async (id: CohortId): Promise<Cohort | null> => {
      const persistence = CohortPersistence.getInstance();
      const result = await persistence.getCohort(id);
      return result?.cohort ?? null;
    },
    [],
  );

  return getCohort;
};

/**
 * Hook for retrieving all cohorts
 */
export const useGetAllPersistedCohorts = () => {
  const getAllCohorts = useCallback(async (): Promise<Array<Cohort>> => {
    const persistence = CohortPersistence.getInstance();
    const result = await persistence.getAllCohorts();
    return result?.cohorts ?? [];
  }, []);

  return getAllCohorts;
};

/**
 * Hook for updating a cohort
 */
export const useUpdatePersistedCohort = () => {
  // @ts-ignore
  const updateCohort = useCallback(async (cohort: Cohort): Promise<void> => {
    const persistence = CohortPersistence.getInstance();
    await persistence.updateCohort(cohort);
  }, []);

  return updateCohort;
};

/**
 * Hook for deleting a cohort
 */
export const useDeletePersistedCohort = () => {
  const coreDispatch = useCoreDispatch();
  const currentCohort = useCoreSelector(selectCurrentCohort);

  const deleteCohort = useDeepCompareCallback(() => {
    coreDispatch(removeCohort({ id: currentCohort.id }));
    // fetch case counts is now handled in listener
  }, [coreDispatch]);

  const handleDelete = useDeepCompareCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (currentCohort.saved) {
        const persistence = CohortPersistence.getInstance();
        // don't delete it from the local adapter if not able to delete from the BE
        persistence
          .deleteCohort(currentCohort.id)
          .then(() => {
            deleteCohort();
            resolve();
          })
          .catch(reject);
      } else {
        deleteCohort();
        resolve();
      }
    });
  }, []);

  return handleDelete;
};

/**
 * Hook for clearing all cohorts
 */
export const useClearAllPersistedCohorts = () => {
  const clearCohorts = useCallback(async (): Promise<void> => {
    const persistence = CohortPersistence.getInstance();
    await persistence.clearCohorts();
  }, []);

  return clearCohorts;
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
