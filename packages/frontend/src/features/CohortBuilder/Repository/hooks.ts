import { FacetQueryParameters, FacetQueryResponse, FileCountsQueryParameters, FilesSizeData, } from './types';
import { Accessibility, convertFilterSetToGqlFilter, useGeneralGQLQuery, useGetAggsQuery, } from '@gen3/core';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';

export const useGetFacetValuesQuery = (
  args: FacetQueryParameters,
): FacetQueryResponse => {
  const { data, isSuccess, isFetching, isError } = useGetAggsQuery(args);

  return {
    data: data ?? {},
    isError,
    isFetching,
    isSuccess,
  };
};

const buildFileStatsdQuery = (
  type: string,
  fileSizeField: string,
  cohortItemIdField: string,
  fileItemIdField: string,
) => {
  const fileStatsQuery = `query repositoryTotals ($filter: JSON, $accessibility:Accessibility) {
    _aggregation {
        ${type} (accessibility: $accessibility, filter: $filter) {
            ${fileItemIdField} {
                _totalCount
            }
            ${fileSizeField} {
                histogram {
                    count
                }
            }
             ${cohortItemIdField} {
                _totalCount
            }
        }
    }
}`;
  return fileStatsQuery;
};
interface FileCountsQueryResponse {
  _aggregation: Record<string, any>;
}

export const useTotalFileSizeQuery = ({
  repositoryFilters,
  cohortFilters,
  repositoryIndex,
  cohortIndex,
  fileSizeField,
  cohortItemIdField,
  fileItemIdField,
  accessibility = Accessibility.ALL,
}: FileCountsQueryParameters) => {
  const [totals, setTotals] = useState<FilesSizeData>({
    totalFileSize: 0,
    totalCaseCount: 0,
    totalFileCount: 0,
  });
  const query = buildFileStatsdQuery(
    repositoryIndex,
    fileSizeField,
    cohortItemIdField,
    fileItemIdField,
  );

  const { data, isSuccess, isFetching, isError } = useGeneralGQLQuery({
    query,
    variables: {
      accessibility,
      filter: convertFilterSetToGqlFilter(repositoryFilters),
    },
  });

  useEffect(() => {
    if (isSuccess) {
      const response = data as unknown as FileCountsQueryResponse;
      const totalFileSize =
        response?._aggregation?.[repositoryIndex]?.[fileSizeField]
          ?.histogram?.[0]?.count || 0;
      const totalCaseCount =
        response?._aggregation?.[cohortIndex]?.[cohortItemIdField]
          ?._totalCount || 0;
      const totalFileCount =
        response?._aggregation?.[repositoryIndex]?.[fileItemIdField]
          ?._totalCount || 0;
      setTotals({
        totalFileSize,
        totalCaseCount,
        totalFileCount,
      });
    }
  });

  return {
    data: totals,
    isError,
    isFetching,
    isSuccess,
  };
};
