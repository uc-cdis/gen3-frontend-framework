import React, { useMemo, useState } from 'react';
import { GuppyActionButtonProps } from '../types';
import {
  Accessibility,
  DatasetOrCohort,
  EmptyFilterSet,
  FilterSet,
  JSONObject,
  selectCurrentCohortFilters,
  useCoreSelector,
  useGetRawDataAndTotalCountsQuery,
} from '@gen3/core';
import { ExportCohortDataToDataLibraryParams } from './actions/addCohortToDataLibrary';
import AddToDataLibraryComboButton from '../../Discovery/ActionBar/AddToDataLibraryComboButton';
import {
  extractDataSelectionFromCohort,
  extractDataSelectionFromCohortQuery,
} from './actions/extractDataSelectionFromCohort';
import { useDeepCompareEffect } from 'use-deep-compare';

// oxlint-disable-next-line no-unused-vars
const useGetDatasetFromCohort = (
  filters: FilterSet,
  index: string,
  cohortIndex: string,
  datasetIdField: string,
  fileIdField: string,
  fileFields: string[],
  accessibility: Accessibility = Accessibility.ALL,
  libraryDataItemMapping: Record<string, string> = {},
  dataPath: string = '*',
) => {
  const { data, isFetching, isSuccess, isError } =
    useGetRawDataAndTotalCountsQuery({
      filters,
      type: cohortIndex,
      fields: fileFields,
      accessibility,
      size: 10000,
    });

  const files = useMemo(() => {
    if (!isSuccess) return {};
    const fileData = (Array.isArray(data) ? data : []) as JSONObject[];

    const result = extractDataSelectionFromCohortQuery(
      fileData,
      libraryDataItemMapping,
      datasetIdField,
      dataPath,
    );

    return result.ok ? result.datasets : {};
  }, [isSuccess, data, libraryDataItemMapping, datasetIdField, dataPath]);

  return { loading: isFetching, files, isError };
};

const CohortDataLibraryListButton = ({
  activeText,
  disabled,
  tooltipText,
  actionArgs,
}: GuppyActionButtonProps) => {
  const cohortFilters = useCoreSelector((state) =>
    selectCurrentCohortFilters(state),
  );
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

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

      setSelectedDatasets(results.ok ? results.datasets : {});
      setLoading(false);
    };

    extractDataFunction();
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
        label: activeText || 'Add',
        disabled,
        tooltip: tooltipText,
      }}
      items={selectedDatasets}
      isItemsLoading={loading}
    />
  );
};

export default CohortDataLibraryListButton;
