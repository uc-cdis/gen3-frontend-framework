import { useEffect, useState } from "react";
import { JSONObject, MetadataPaginationParams, useGetMDSQuery } from "@gen3/core";
import * as JsSearch from "js-search";
import { AdvancedSearchFilters, DiscoveryDataLoaderProps, KeyValueSearchFilter, SearchTerms, StudyColumn } from "../types";
import filterByAdvSearch from "./filterByAdvSearch";
import { getFilterValuesByKey, hasSearchTerms } from "../Search/utils";
import { processAllSummaries } from "./utils";
import { SummaryStatisticsConfig } from "../Statistics";
import { SummaryStatistics } from "../Statistics/types";
import searchFilterSort from "./searchFilterSort";

// TODO remove after debugging
// import { reactWhatChanged as RWC } from 'react-what-changed';


const formatSearchIndex = (index: string) => {
  // Removes [*] wild cards used by JSON Path and converts to array
  const wildCardStringRegex = new RegExp(/\[\*\]/, 'g');
  const indexWithoutWildcards = index.replace(wildCardStringRegex, '');
  return indexWithoutWildcards.split('.');
};



const processAdvancedSearchTerms = (
  advSearchFilters: AdvancedSearchFilters,
  data: JSONObject[],
  uidField: string,
): ReadonlyArray<KeyValueSearchFilter> => {
  return advSearchFilters.filters.map((filter) => {
    const { key, keyDisplayName } = filter;
    const values = getFilterValuesByKey(
      key,
      data,
      advSearchFilters.field,
      uidField,
    );
    return {
      key,
      keyDisplayName,
      valueDisplayNames: values.reduce((acc, cur) => {
        acc[cur] = cur;
        return acc;
      }, {} as Record<string, string>),
    };
  });
};

interface GetDataProps {
  guidType: string;
  maxStudies: number;
  studyField: string;
}

const useGetData = ({
  guidType = 'unregistered_discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: Partial<GetDataProps>) => {
  const [mdsData, setMDSData] = useState<Array<JSONObject>>([]);
  const [isError, setIsError] = useState(false);

  const { data, isUninitialized, isFetching, isLoading, isSuccess, isError: queryIsError } =
    useGetMDSQuery({
      url: 'https://healdata.org/mds',
      guidType: guidType,
      offset: 0,
      pageSize: maxStudies,
    });

  useEffect(() => {
    if (data && isSuccess) {
      const studyData = Object.values(data.data).reduce(
        (acc: JSONObject[], cur) => {
          return cur[studyField] ? [...acc, cur[studyField] as JSONObject] : acc;
        },
        [],
      );
      setMDSData(studyData);
    }
  }, [data, isSuccess, studyField]);

  useEffect(() => {
    if (queryIsError) {
      setIsError(true);
    }
  }, [queryIsError]);

  return {
    mdsData,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError,
  };
};

interface SearchMetadataProps {
  discoveryConfig: any;
  searchTerms: SearchTerms;
  mdsData: JSONObject[];
  isSuccess: boolean;
}

const useSearchMetadata = ({
  discoveryConfig,
  searchTerms,
  mdsData,
                             isSuccess,
}: SearchMetadataProps) => {

  const [jsSearch, setJsSearch] = useState<JsSearch.Search | undefined>(undefined);

  const [searchedData, setSearchedData] = useState<Array<JSONObject>>([]);


  const isSearching = hasSearchTerms(searchTerms);


  useEffect(() => {
    // we have the data, so set it and build the search index and get the advanced search filter values
    if (mdsData && isSuccess) {
      console.log("building search index...");
      const search = new JsSearch.Search(discoveryConfig.minimalFieldMapping.uid);
      search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();

      // Choose which fields in the data to make searchable.
      // If `searchableFields` are configured, enable search over only those fields.
      // Otherwise, default behavior: enable search over all non-numeric fields
      // in the table and the study description.
      // ---
      const searchableFields: string[] = discoveryConfig.features.search.searchBar.searchableTextFields;
      if (searchableFields) {
        searchableFields.forEach((field:string) => {
          const formattedFields = formatSearchIndex(field);
          search.addIndex(formattedFields);
        });
      } else {
        discoveryConfig.studyColumns.forEach((column:StudyColumn) => {
          if (!column.contentType || column.contentType === 'string') {
            const studyColumnFieldsArr = formatSearchIndex(column.field);
            search.addIndex(studyColumnFieldsArr);
          }
        });
        // Also enable search over preview field if present
        if (discoveryConfig.studyPreviewField) {
          const studyPreviewFieldArr = formatSearchIndex(discoveryConfig.studyPreviewField.field);
          search.addIndex(studyPreviewFieldArr);
        }
      }
      // ---

      search.addDocuments(mdsData);
      // expose the search function
      setJsSearch(search);
      console.log("done");
    }
  }, [discoveryConfig.features.search.searchBar.searchableTextFields, discoveryConfig.minimalFieldMapping.uid, discoveryConfig.studyColumns, discoveryConfig.studyPreviewField, isSuccess, mdsData]);


  useEffect(() => {
    setSearchedData(searchFilterSort(
      {
        studies: mdsData,
        jsSearch,
        searchTerms,
        config: discoveryConfig,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        filterState: searchTerms.advancedSearchTerms,
        accessFilters: {},
      }
    ));
  }, [discoveryConfig, jsSearch, mdsData, searchTerms, searchTerms.advancedSearchTerms]);

  return {
    searchedData: isSearching ? searchedData : mdsData,
  };
};

interface PaginationHookProps {
  data: JSONObject[];
  pagination: MetadataPaginationParams;
}

const usePagination = ({ data, pagination }: PaginationHookProps) => {
  const [paginatedData, setPaginatedData] = useState<JSONObject[]>([]);

  useEffect(() => {
    const updatePaginatedData = () => {
      setPaginatedData(
        data.slice(pagination.offset, pagination.offset + pagination.pageSize),
      );
    };

    updatePaginatedData();
  }, [data, pagination.offset, pagination.pageSize]);

  useEffect(() => {
    const updatePaginatedData = () => {
      setPaginatedData(
        data.slice(pagination.offset, pagination.offset + pagination.pageSize),
      );
    };

    updatePaginatedData();
  }, [data, pagination.offset, pagination.pageSize]);

  return {
    paginatedData,
  };
};

interface AdvancedSearchFilterValuesHookProps {
  data: JSONObject[];
  advancedSearchFilters: AdvancedSearchFilters;
  uidField: string;
}

const useGetAdvancedSearchFilterValues = ({
  data,
  advancedSearchFilters,
  uidField,
}: AdvancedSearchFilterValuesHookProps) => {
  const [advancedSearchFilterValues, setAdvancedSearchFilterValues] = useState<
    ReadonlyArray<KeyValueSearchFilter>
  >([]);

  useEffect(() => {
    if (data) {
      setAdvancedSearchFilterValues(
        processAdvancedSearchTerms(advancedSearchFilters, data, uidField),
      );
    }
  }, [advancedSearchFilters, data, uidField]);

  return {
    advancedSearchFilterValues,
  };
};

interface SummaryStatisticsHookProps {
  data: JSONObject[];
  aggregationConfig: SummaryStatisticsConfig[];
}

const useGetSummaryStatistics = ({
  data,
  aggregationConfig,
}: SummaryStatisticsHookProps) => {
  const [summaryStatistics, setSummaryStatistics] = useState<SummaryStatistics>(
    {},
  );

  useEffect(() => {
    setSummaryStatistics(processAllSummaries(data, aggregationConfig));
  }, [data, aggregationConfig]);

  return {
    summaryStatistics,
  };
};


export const useLoadAllData = ({
  pagination,
  searchTerms,
  advancedSearchTerms,
  discoveryConfig,
  guidType = 'unregistered_discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: DiscoveryDataLoaderProps) => {

  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';

  const {
    mdsData,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError,
  } = useGetData({
    guidType,
    maxStudies,
    studyField,
  });

  const { advancedSearchFilterValues } = useGetAdvancedSearchFilterValues({
    data: mdsData,
    advancedSearchFilters: discoveryConfig.features.advSearchFilters,
    uidField,
  });

  const { searchedData } = useSearchMetadata({
    discoveryConfig,
    searchTerms,
    mdsData,
    isSuccess,
  });

  const { paginatedData } = usePagination({
    data: searchedData,
    pagination,
  });

  const { summaryStatistics } = useGetSummaryStatistics({
    data: paginatedData,
    aggregationConfig: discoveryConfig?.aggregations,
  });

  return {
    data: paginatedData,
    hits: searchedData.length ?? -1,
    advancedSearchFilterValues,
    summaryStatistics,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError,
  };
};
