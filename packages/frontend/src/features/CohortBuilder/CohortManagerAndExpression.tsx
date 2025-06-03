import React from 'react';
import QueryExpression from './QueryExpression';
import {
  useSavePersistedCohort,
  useReplaceExistingPersistedCohort,
  useAddUnsavedCohort,
  useSetActiveCohort,
  useDiscardChanges,
  useDeletePersistedCohort,
} from '@gen3/core';

import {
  useSelectCurrentCohort,
  useSelectAvailableCohorts,
} from './CohortManager/cohortActionHooks';

import { CohortManager, type CohortHooks } from './CohortManager';

interface CohortManagerProps {
  index: string;
}

const CohortManagerAndExpression = ({ index }: CohortManagerProps) => {
  const cohortActionsHooks: CohortHooks = {
    useSelectCurrentCohort,
    useSelectAvailableCohorts,
    useDeleteCohort: useDeletePersistedCohort,
    useDiscardChanges,
    useSetActiveCohort,
    useAddUnsavedCohort,
    useSaveCohort: useSavePersistedCohort,
    useReplaceCohort: useReplaceExistingPersistedCohort,
  };

  return (
    <div className="flex flex-col mb-2">
      <CohortManager
        hooks={cohortActionsHooks}
        defaultCohortName={'New Unsaved Cohort'}
      />
      <QueryExpression index={index} />
    </div>
  );
};

export default CohortManagerAndExpression;
