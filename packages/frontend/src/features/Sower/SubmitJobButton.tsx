import React, { useCallback, useMemo } from 'react';
import { Button } from '@mantine/core';
import useSowerJobEventBus from '../Sower/useSowerJobEventBus';
import {
  convertFilterSetToGqlFilter,
  selectCurrentCohortFilters,
  useCoreSelector,
  useSubmitSowerJobMutation,
} from '@gen3/core';
import { useIsAuthenticated } from '../../lib/session/session';

export class SowerJob {}

interface SowerJobButtonConfiguration<T extends Record<string, any>> {
  label: string;
  useBuildJob: (args?: T) => Record<string, unknown>; // hook to call to create the job
}

interface ExportCohortToPFBActionConfiguration {
  index: string;
}

const useExportCohortToPFBAction = (
  args: ExportCohortToPFBActionConfiguration,
) => {
  const { index } = args;
  const cohortFilters = useCoreSelector((state) =>
    selectCurrentCohortFilters(state),
  );

  const results = {
    action: 'export',
    input: {
      filter: convertFilterSetToGqlFilter(cohortFilters[index]),
    },
  };

  return results;
};

export interface SubmitJobButtonProps {
  action: string;
  requireLogin?: boolean;
}

const SubmitJobButton = ({
  action,
  requireLogin = false,
}: SubmitJobButtonProps) => {
  const [submitJob, result] = useSubmitSowerJobMutation();
  const { update } = useSowerJobEventBus();
  const { isAuthenticated } = useIsAuthenticated();

  const isDisabled = useMemo(() => {
    return requireLogin && !isAuthenticated;
  }, [isAuthenticated, requireLogin]);

  const handleSubmit = useCallback(() => {}, []);

  return <Button disabled={isDisabled} onClick={handleSubmit}></Button>;
};

export default SubmitJobButton;
