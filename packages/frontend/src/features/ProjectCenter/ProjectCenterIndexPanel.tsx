import type { ReactNode } from 'react';
import React, { useMemo, useRef, useState } from 'react';
import ProjectCenterDisplay from './ProjectCenterDisplay/ProjectCenterDisplay';
import { Button, Grid, Title } from '@mantine/core';
import type {
  MRT_PaginationState,
  MRT_SortingState,
} from 'mantine-react-table-open';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import SummaryStatisticPanel from '../Discovery/Statistics/SummaryStatisticPanel';
import { useLoadAllMDSData } from '../Discovery/DataLoaders/MDSAllLocal/DataLoader';
import type { AdvancedSearchTerms } from '../Discovery/Search/types';
import { SearchCombination } from '../Discovery/Search/types';
import SearchInputWithSuggestions from '../Discovery/Search/SearchInputWithSuggestions';
import { getDiscoveryDataLoader } from '../Discovery/DataLoaders/registeredDataLoaders';
import StudyProvider from '../Study/StudyProvider';
import { useDeepCompareMemo } from 'use-deep-compare';
import SearchInputSelectableFields from '../Discovery/Search/SearchInputSelectableFields';
import { DEBOUNCE_DELAY_TIME, SearchMode } from '../Discovery/constants';
import DiscoveryDropdownTagViewer from '../Discovery/DiscoveryDropdownTagViewer';
import { IoIosArrowDown, IoIosArrowUp, IoIosRefresh } from 'react-icons/io';
import { useStudyIdFromWindow } from '../Discovery/utils/useStudyIdFromWindow';
import type { AccessLevel } from '../../utils';
import { processSupportedAccessLevels } from '../Discovery/utils';
import DiscoveryProvider from '../Discovery/DiscoveryProvider';
import type { DiscoveryIndexConfig } from '../Discovery/types';

export interface ProjectCenterIndexPanelProps {
  indexSelector: ReactNode | null;
  configuration: DiscoveryIndexConfig;
}

/**
 * ProjectCenterIndexPanel renders the Project Center interface: summary statistics,
 * keyword/tag/advanced search, optional charts, AI search and export actions, and the
 * list of projects with their details (ProjectCenterDisplay).
 * Configuration is read from the Discovery context (see the ProjectCenter configuration guide).
 *
 * @param {Object} props - The properties object passed to the component.
 * @param {ReactNode | null} props.indexSelector - optional element for selecting an index, shown before the statistics.
 *
 * @return {JSX.Element} the Project Center panel.
 */
const ProjectCenterIndexPanel = ({
  indexSelector,
  configuration,
}: ProjectCenterIndexPanelProps) => {
  const dataHook = useMemo(
    () =>
      getDiscoveryDataLoader(
        configuration?.features?.dataLoader?.dataFetchFunction,
      ) ?? useLoadAllMDSData,
    [configuration?.features?.dataLoader?.dataFetchFunction],
  );
  const [pagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [selectedTags, setSelectedTags] = useState<{ [key: string]: boolean }>(
    {},
  );

  const enabledAccessLevels = useMemo(
    () => new Set<AccessLevel>(processSupportedAccessLevels(configuration)),
    [configuration],
  );

  const [selectedAccessLevels, setSelectedAccessLevels] = useState<number[]>(
    () => [...enabledAccessLevels],
  );

  const parentDivRef = useRef<HTMLDivElement>(null);
  const studyIdFromWindow = useStudyIdFromWindow();
  const [searchBarTerms, setSearchBarTerms] = useState<string[]>(
    studyIdFromWindow ? [studyIdFromWindow] : [],
  );
  const [debouncedSearchBarTerms] = useDebouncedValue(
    searchBarTerms,
    DEBOUNCE_DELAY_TIME,
  );
  const [selections, setSelections] = useState<string[]>([]); // ids of the selected studies, used by the export actions
  const [sorting] = useState<MRT_SortingState>([]);

  const [advancedSearchTerms, setAdvancedSearchTerms] =
    useState<AdvancedSearchTerms>({
      operation: SearchCombination.and,
      filters: {},
    });

  const searchParam = useDeepCompareMemo(() => {
    return {
      keyword: {
        operator: SearchCombination.and,
        keywords: debouncedSearchBarTerms,
      },
      advancedSearchTerms: advancedSearchTerms,
      selectedTags: selectedTags,
    };
  }, [debouncedSearchBarTerms, advancedSearchTerms, selectedTags]);

  const [selectedFieldsForSearchIndexing, setSelectedFieldsForSearchIndexing] =
    useState([] as string[]);
  const [searchMode, setSearchMode] = useState<SearchMode>(
    SearchMode.FULL_TEXT,
  );

  // Get all required data from the data hook. This includes the metadata, search suggestions, and results, pagination, etc.
  const {
    data,
    dataRequestStatus,
    advancedSearchFilterValues,
    suggestions,
    summaryStatistics,
    charts: chartData,
    tagCategoryData,
  } = dataHook({
    pagination: {
      offset: pagination.pageIndex * pagination.pageSize,
      pageSize: pagination.pageSize,
    },
    searchTerms: searchParam,
    discoveryConfig: configuration,
    sorting,
    selectedFieldsForSearchIndexing: selectedFieldsForSearchIndexing,
    searchMode: searchMode,
    selectedTags: selectedTags,
    selectedAccessLevels: selectedAccessLevels,
  });
  const selectedRecords = useMemo(() => {
    const uidField = configuration?.minimalFieldMapping?.uid ?? 'guid';
    const filterSelectedMembers = (data: Array<Record<string, any>>) =>
      data?.filter(
        (member) => uidField in member && selections.includes(member[uidField]),
      );
    return filterSelectedMembers(data);
  }, [data, configuration?.minimalFieldMapping?.uid, selections]);

  const [showAdvancedSearch, { toggle: toggleAdvancedSearch }] =
    useDisclosure(false);

  const [isDropdownTagViewerOpen, setIsDropdownTagViewerOpen] = useState(false);
  const tagViewerContentRef = useRef<HTMLDivElement | null>(null);
  const enableSearchBar = configuration?.features?.search?.searchBar?.enabled;
  const enableSearchableTags =
    configuration?.features?.search?.tagSearchDropdown?.enabled;
  const enableSearchInputSelectableFields =
    configuration?.features?.search?.searchBar?.searchableTextFields ||
    configuration?.features?.search?.searchBar
      ?.searchableAndSelectableTextFields;

  return (
    <DiscoveryProvider
      discoveryConfig={configuration}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      selectedAccessLevels={selectedAccessLevels}
      setSelectedAccessLevels={setSelectedAccessLevels}
      enabledAccessLevels={enabledAccessLevels}
    >
      <div className="flex flex-col items-center p-4 pb-0 w-full bg-base-lightest">
        <StudyProvider>
          <div className="w-full">
            {configuration.features?.pageTitle &&
            configuration?.features?.pageTitle.enabled ? (
              <Title size="xl">{configuration?.features?.pageTitle.text}</Title>
            ) : null}
            <div className="flex items-center p-2 mb-4 bg-base-max rounded-lg">
              {indexSelector}
              <SummaryStatisticPanel summaries={summaryStatistics} />
              {enableSearchBar && (
                <div className="w-3/4 flex flex-col ml-2">
                  <Grid align="center" gap="sm">
                    <Grid.Col
                      span={{ md: enableSearchableTags ? 7 : 10, sm: 12 }}
                    >
                      <SearchInputWithSuggestions
                        searchBarTerms={searchBarTerms}
                        setSearchBarTerms={setSearchBarTerms}
                        suggestions={suggestions}
                        clearSearch={() => {
                          setSearchBarTerms([]);
                        }}
                        searchChanged={(v) => setSearchBarTerms(v.split(' '))}
                        placeholder={
                          configuration?.features?.search?.searchBar
                            ?.placeholder ?? 'Search...'
                        }
                        label={
                          configuration?.features?.search?.searchBar
                            ?.inputSubtitle
                        }
                      />
                    </Grid.Col>
                    {enableSearchableTags && (
                      <Grid.Col span={{ sm: 12, md: 5 }} align="center">
                        <Button
                          onClick={() => setSelectedTags({})}
                          variant="outline"
                          leftSection={<IoIosRefresh />}
                          className={
                            Object.keys(selectedTags).length === 0
                              ? 'border-gray-400 mr-2'
                              : 'mr-2'
                          }
                          data-disabled={Object.keys(selectedTags).length === 0}
                        >
                          Reset
                        </Button>
                        <Button
                          className="mt-1"
                          onClick={() =>
                            setIsDropdownTagViewerOpen((prev) => !prev)
                          }
                          disabled={data.length === 0}
                          variant="outline"
                          leftSection={
                            isDropdownTagViewerOpen ? (
                              <IoIosArrowUp />
                            ) : (
                              <IoIosArrowDown />
                            )
                          }
                        >
                          {`${
                            configuration?.features?.search?.tagSearchDropdown
                              ?.collapsibleButtonText || 'Tag Panel'
                          }`}
                        </Button>
                      </Grid.Col>
                    )}
                  </Grid>
                  {enableSearchInputSelectableFields && (
                    <SearchInputSelectableFields
                      searchMode={searchMode}
                      setSearchMode={setSearchMode}
                      searchableTextFields={
                        configuration?.features?.search?.searchBar
                          ?.searchableTextFields
                      }
                      searchableAndSelectableTextFields={
                        configuration?.features?.search?.searchBar
                          ?.searchableAndSelectableTextFields
                      }
                      setSelectedFieldsForSearchIndexing={
                        setSelectedFieldsForSearchIndexing
                      }
                    />
                  )}
                  {tagCategoryData && tagCategoryData.length > 0 && (
                    <div
                      ref={tagViewerContentRef}
                      className={`transition-all duration-300 ease-in-out mt-2 ${
                        isDropdownTagViewerOpen
                          ? 'max-h-screen opacity-100'
                          : 'max-h-0 opacity-0'
                      } overflow-hidden`}
                      style={{
                        height:
                          isDropdownTagViewerOpen && tagViewerContentRef.current
                            ? `${tagViewerContentRef.current.scrollHeight}px`
                            : '0px',
                      }}
                    >
                      <DiscoveryDropdownTagViewer
                        tagCategoryData={tagCategoryData}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-start">
              <div className="w-full" ref={parentDivRef}>
                <ProjectCenterDisplay
                  data={data}
                  studyIdFromWindow={studyIdFromWindow as string}
                  dataRequestStatus={dataRequestStatus}
                  setSelection={setSelections}
                />
              </div>
            </div>
          </div>
        </StudyProvider>
      </div>
    </DiscoveryProvider>
  );
};

export default ProjectCenterIndexPanel;
