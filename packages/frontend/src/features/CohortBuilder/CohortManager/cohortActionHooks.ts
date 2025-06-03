import { useDeepCompareCallback } from 'use-deep-compare';
import {
  addNewDefaultUnsavedCohort,
  selectAvailableCohorts,
  selectCurrentCohort,
  useCoreDispatch,
  useCoreSelector,
  setActiveCohort,
  removeCohort,
} from '@gen3/core';

export const useSelectAvailableCohorts = () => {
  return useCoreSelector((state) => selectAvailableCohorts(state));
};

export const useSelectCurrentCohort = () => {
  return useCoreSelector((state) => selectCurrentCohort(state));
};

export const useAddUnsavedCohort = () => {
  const coreDispatch = useCoreDispatch();

  return () => {
    coreDispatch(addNewDefaultUnsavedCohort());
  };
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

  const deleteCohort = useDeepCompareCallback(() => {
    coreDispatch(removeCohort({}));
  }, [coreDispatch]);

  const handleDelete = useDeepCompareCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      // only delete cohort from BE if it's been saved before
      deleteCohort();
      resolve();
    });
  }, [currentCohort, deleteCohort]);

  return handleDelete;
};

export const useImportCohort = () => {
  const coreDispatch = useCoreDispatch();

  const handleImport = useDeepCompareCallback(() => {}, [coreDispatch]);

  return handleImport;
};
