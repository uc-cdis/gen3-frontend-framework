import { useCoreDispatch, useCoreSelector } from '../../hooks';
import {
  removeCohort,
  selectCurrentCohort,
  setActiveCohort,
  discardCohortChanges,
  addNewDefaultUnsavedCohort,
  selectCurrentCohortFilters,
} from './cohortSlice';
import { IndexedFilterSet } from '../filters';
import { useDeepCompareCallback } from 'use-deep-compare';
import { CohortPersistence } from './cohortPersistence';

export const useCohortFacetFilters = (): IndexedFilterSet => {
  return useCoreSelector((state) => selectCurrentCohortFilters(state));
};

export const useSetActiveCohort = () => {
  const coreDispatch = useCoreDispatch();

  const handleCohortChange = useDeepCompareCallback(
    (id: string) => {
      coreDispatch(setActiveCohort(id));
    },
    [coreDispatch],
  );

  return handleCohortChange;
};

export const useDeleteCohort = () => {
  const coreDispatch = useCoreDispatch();
  const currentCohort = useCoreSelector(selectCurrentCohort);
  const persistence = CohortPersistence.getInstance();

  const deleteCohort = useDeepCompareCallback(() => {
    coreDispatch(
      removeCohort({
        id: currentCohort.id,
      }),
    );
    // fetch case counts is now handled in listener
  }, [coreDispatch]);

  const handleDelete = useDeepCompareCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      // only delete cohort from BE if it's been saved before
      if (currentCohort.saved) {
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
  }, [currentCohort, persistence, deleteCohort]);

  return handleDelete;
};

export const useAddUnsavedCohort = () => {
  const coreDispatch = useCoreDispatch();

  const handleAdd = () => {
    coreDispatch(addNewDefaultUnsavedCohort());
  };

  return handleAdd;
};

export const useDiscardChanges = () => {
  const coreDispatch = useCoreDispatch();
  const currentCohort = useCoreSelector(selectCurrentCohort);

  const handleDiscard = useDeepCompareCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (currentCohort.saved) {
        const persistence = CohortPersistence.getInstance();
        persistence
          .getCohort(currentCohort.id)
          .then((results) => {
            const { cohort: savedCohort } = results;
            if (savedCohort) {
              coreDispatch(
                discardCohortChanges({
                  id: savedCohort.id,
                  filters: savedCohort.filters,
                  modifiedDatetime: savedCohort.modified_datetime,
                }),
              );
              resolve();
            }
          })
          .catch(reject);
      } else {
        coreDispatch(
          discardCohortChanges({
            id: currentCohort.id,
            filters: {},
            modifiedDatetime: currentCohort.modified_datetime,
          }),
        );
        resolve();
      }
    });
  }, [currentCohort, coreDispatch]);

  return handleDiscard;
};
