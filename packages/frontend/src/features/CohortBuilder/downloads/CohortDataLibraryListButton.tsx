import React from 'react';
import { GuppyActionButtonProps } from '../types';
import {
  DatasetOrCohort,
  EmptyFilterSet,
  selectCurrentCohortFilters,
  useCoreSelector,
} from '@gen3/core';
import { ExportCohortDataToDataLibraryParams } from './actions/addCohortToDataLibrary';
import AddToDataLibraryComboButton from '../../Discovery/ActionBar/AddToDataLibraryComboButton';
import { extractDataSelectionFromCohort } from './actions/extractDataSelectionFromCohort';
import { useDeepCompareEffect } from 'use-deep-compare';

const CohortDataLibraryListButton = ({
  activeText,
  disabled,
  tooltipText,
  actionArgs,
}: GuppyActionButtonProps) => {
  const cohortFilters = useCoreSelector((state) =>
    selectCurrentCohortFilters(state),
  );

  const [selectedDatasets, setSelectedDatasets] =
    React.useState<DatasetOrCohort>({});

  const {
    cohortIndex,
    accessibility,
    fileFields,
    datasetIdField,
    libraryDataItemMapping,
    dataPath = '*',
  } = actionArgs as ExportCohortDataToDataLibraryParams;

  const filters = cohortFilters?.[cohortIndex] ?? EmptyFilterSet;

  useDeepCompareEffect(() => {
    let cancelled = false;

    const extractDataFunction = async () => {
      const results = await extractDataSelectionFromCohort({
        cohortFilters: filters,
        index: cohortIndex,
        accessibility,
        fileFields,
        datasetIdField,
        libraryDataItemMapping,
        dataPath,
      });

      if (cancelled) return;

      setSelectedDatasets(results.ok ? results.datasets : {});
    };

    extractDataFunction();

    return () => {
      cancelled = true;
    };
  }, [
    filters,
    cohortIndex,
    accessibility,
    fileFields,
    datasetIdField,
    libraryDataItemMapping,
    dataPath,
  ]);

  // build library items

  return (
    <AddToDataLibraryComboButton
      buttonConfig={{
        label: activeText || 'Add to Data Library',
        disabled,
        tooltip: tooltipText,
      }}
      items={selectedDatasets}
    />
  );
};

export default CohortDataLibraryListButton;
