import React from 'react';
import { Group, Select, Tooltip } from '@mantine/core';
import { Icon } from '@iconify/react';
import JSONObjectDownloadButton from '../../../components/Buttons/DownloadButtons/JSONObjectDownloadButton';
import {
  type Cohort,
  type FilterSet,
  useCoreDispatch,
  setCohortFilter,
  useCoreSelector,
  selectAvailableCohorts,
  selectCurrentCohortModified,
  selectCurrentCohortSaved,
  setActiveCohort,
  selectCurrentCohortId,
} from '@gen3/core';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import UploadJSONButton from '../../../components/Buttons/UploadJSONButton';

export const UnsavedIcon = ({ label }: { label: string }): JSX.Element => (
  <Tooltip label={label} withArrow>
    <span className="leading-0 pointer-events-auto">
      <Icon icon="gen3:cohort-unsaved" aria-hidden="true" height="1.0rem" />
    </span>
  </Tooltip>
);

interface CohortSelectorProps {
  showSelectedCohorts?: boolean;
  readonly index: string;
  readonly filters: FilterSet;
}

const CohortSelector: React.FC<CohortSelectorProps> = ({ index, filters }) => {
  const coreDispatch = useCoreDispatch();
  const cohorts = useCoreSelector(selectAvailableCohorts);
  const currentCohortId = useCoreSelector(selectCurrentCohortId);
  const currentCohortModified = useCoreSelector(selectCurrentCohortModified);
  const currentCohortSaved = useCoreSelector(selectCurrentCohortSaved);
  const cohortStatusMessage = currentCohortSaved
    ? 'Changes not saved'
    : 'Cohort not saved';
  const isSavedUnchanged = currentCohortSaved && !currentCohortModified;

  const getData = useDeepCompareCallback(() => {
    return filters;
  }, [filters]);

  const handleCohortChange = useDeepCompareCallback(
    (id: string) => {
      coreDispatch(setActiveCohort(id));
    },
    [coreDispatch],
  );

  const cohortList = useDeepCompareMemo(
    () =>
      cohorts
        .sort((a: Cohort, b: Cohort) =>
          a.modified_datetime <= b.modified_datetime ? 1 : -1,
        )
        .map((x) => ({
          value: x.id,
          label: x.name,
          isSavedUnchanged: x.saved && !x.modified,
          cohortStatusMessage: x.saved
            ? 'Changes not saved'
            : 'Cohort not saved',
        })),
    [cohorts],
  );

  const setCohort = useDeepCompareCallback(
    (data: string) => {
      const jsonForm = JSON.parse(data);
      coreDispatch(setCohortFilter({ index, filters: jsonForm as FilterSet }));
    },
    [index, coreDispatch],
  );

  return (
    <div className="flex flex-col pt-5" data-testid="cohort-list-dropdown">
      <Select
        data={cohortList}
        searchable
        clearable={false}
        value={currentCohortId}
        onChange={(id) => {
          if (id !== null) {
            handleCohortChange(id);
          }
        }}
        classNames={{
          root: 'border-secondary-darkest w-56 md:w-80 z-[290]',
          input:
            'text-heading font-medium text-primary-darkest rounded-l-none h-[48px] border-primary border-l-2',
          option:
            'text-heading font-normal text-primary-darkest data-selected:bg-primary-lighter hover:bg-accent-lightest hover:text-accent-contrast-lightest my-0.5',
        }}
        aria-label="Select cohort"
        data-testid="switchButton"
        rightSection={
          <div className="flex gap-1 items-center">
            {!isSavedUnchanged && <UnsavedIcon label={cohortStatusMessage} />}
            <Icon
              icon="gen3:caret-down"
              height="1.0rem"
              className="text-primary"
            />
          </div>
        }
        rightSectionWidth={!isSavedUnchanged ? 45 : 30}
        styles={{ section: { pointerEvents: 'none' } }}
      />
      <div
        className={`ml-auto text-heading text-sm font-semibold mt-0.85 text-primary-contrast ${
          !isSavedUnchanged ? 'visible' : 'invisible'
        }`}
      >
        {cohortStatusMessage}
      </div>
    </div>
  );
};

export default CohortSelector;
