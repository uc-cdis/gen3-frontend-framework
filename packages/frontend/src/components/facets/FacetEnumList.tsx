import { BAD_DATA_MESSAGE, DEFAULT_VISIBLE_ITEMS } from './constants';
import { ActionIcon, Checkbox, LoadingOverlay, TextInput } from '@mantine/core';
import { MdClose as CloseIcon } from 'react-icons/md';
import FacetSortPanel from './FacetSortPanel';
import { fieldNameToTitle } from '@gen3/core';
import OverflowTooltippedLabel from '../OverflowTooltippedLabel';
import FacetExpander from './FacetExpander';
import { EnumFacetChart } from '../charts';
import React, { useEffect, useRef, useState } from 'react';
import { EnumFacetHooks } from './EnumFacet';
import { SortType } from './types';
import { updateFacetEnum } from './utils';
import { useDeepCompareCallback, useDeepCompareEffect } from 'use-deep-compare';

interface FacetEnumListProps {
  field: string;
  facetName?: string;
  valueLabel: string;
  hooks: EnumFacetHooks;
  isSearching?: boolean;
  isFacetView?: boolean;
  showPercent?: boolean;
  hideIfEmpty?: boolean;
  showSorting?: boolean;
}

const FacetEnumList: React.FC<FacetEnumListProps> = ({
  field,
  facetName,
  hooks,
  valueLabel,
  isFacetView = true,
  isSearching = false,
  showPercent = false,
  hideIfEmpty = false,
  showSorting = true,
}) => {
  const [isGroupExpanded, setIsGroupExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, enumFilters, isSuccess, error } = hooks.useGetFacetData(field);
  const [selectedEnums, setSelectedEnums] = useState(enumFilters ?? []);
  const totalCount = hooks?.useTotalCounts ? hooks.useTotalCounts() : 1;
  const clearFilters = hooks.useClearFilter();
  const updateFacetFilters = hooks.useUpdateFacetFilters();
  const isFilterExpanded =
    hooks?.useFilterExpanded && hooks.useFilterExpanded(field);
  const showFilters = isFilterExpanded === undefined || isFilterExpanded;
  const [sortedData, setSortedData] = useState<Record<string | number, number>>(
    {},
  );
  const [sortType, setSortType] = useState<SortType>({
    type: 'alpha',
    direction: 'asc',
  });

  useEffect(() => {
    if (isSearching) {
      searchInputRef?.current?.focus();
    } else if (searchTerm.length > 0) {
      setSearchTerm('');
    }
  }, [isSearching, searchTerm]);

  useDeepCompareEffect(() => {
    setSelectedEnums(enumFilters ?? []);
  }, [enumFilters]);

  const maxValuesToDisplay = DEFAULT_VISIBLE_ITEMS;

  // update filters when checkbox is selected
  const handleChange = (value: string, checked: boolean) => {
    setFacetChartData({
      ...facetChartData,
      isSuccess: false,
    });
    if (checked) {
      const updated = selectedEnums ? [...selectedEnums, value] : [value];
      updateFacetEnum(field, updated, updateFacetFilters, clearFilters);
    } else {
      const updated = selectedEnums?.filter((x) => x != value);
      updateFacetEnum(field, updated ?? [], updateFacetFilters, clearFilters);
    }
  };

  const [facetChartData, setFacetChartData] = useState<{
    filteredData: [string | number, number][];
    filteredDataObj: Record<string | number, number>;
    remainingValues: number;
    numberOfBarsToDisplay: number;
    isSuccess: boolean;
    height: number;
    cardStyle: string;
  }>({
    filteredData: [],
    filteredDataObj: {},
    remainingValues: 0,
    numberOfBarsToDisplay: maxValuesToDisplay,
    isSuccess: false,
    height: 150,
    cardStyle: 'overflow-hidden h-auto',
  });

  const calcCardStyle = useDeepCompareCallback(
    (remainingValues: number) => {
      if (isGroupExpanded) {
        const cardHeight =
          remainingValues > 16
            ? 96
            : remainingValues > 0
              ? Math.min(96, remainingValues * 5 + 40)
              : 24;
        return `flex-none  h-${cardHeight} overflow-y-scroll `;
      } else {
        return 'overflow-hidden h-auto';
      }
    },
    [isGroupExpanded],
  );

  const calcNumberOfBarsToDisplay = useDeepCompareCallback(
    (visibleItems: number) => {
      const totalNumberOfBars = enumFilters ? enumFilters.length : visibleItems;
      return isGroupExpanded
        ? Math.min(16, totalNumberOfBars)
        : Math.min(maxValuesToDisplay, totalNumberOfBars);
    },
    [isGroupExpanded, enumFilters, maxValuesToDisplay],
  );

  useDeepCompareEffect(() => {
    if (isSuccess && data) {
      // get all the data except the missing and empty values
      const tempFilteredData = Object.entries(data)
        .filter((entry) => entry[0] != '_missing' && entry[0] != '')
        .filter((entry) =>
          searchTerm === ''
            ? entry
            : entry[0].toLowerCase().includes(searchTerm.toLowerCase().trim()),
        );

      // it is possible that the selected enums are not in the data as their counts are 0
      // therefore we need to add them to the data
      const selectedEnumNotInData = selectedEnums
        ? selectedEnums.reduce(
            (acc, curr) => {
              if (!tempFilteredData.find((x) => x[0] === curr)) {
                acc.push([curr, 0]); // count will be 0
              }
              return acc;
            },
            [] as Array<[string | number, number]>,
          )
        : [];

      const remainingValues =
        tempFilteredData.length +
        selectedEnumNotInData.length -
        maxValuesToDisplay;
      const cardStyle = calcCardStyle(remainingValues);
      const numberOfBarsToDisplay = calcNumberOfBarsToDisplay(
        tempFilteredData.length + selectedEnumNotInData.length,
      );

      setFacetChartData((prevFacetChartData) => ({
        ...prevFacetChartData,
        filteredData: [...tempFilteredData, ...selectedEnumNotInData], // merge any selected enums that are not in the data
        filteredDataObj: Object.fromEntries([
          ...tempFilteredData,
          ...selectedEnumNotInData,
        ]),
        remainingValues,
        numberOfBarsToDisplay,
        isSuccess: true,
        height:
          numberOfBarsToDisplay == 1
            ? 150
            : numberOfBarsToDisplay == 2
              ? 220
              : numberOfBarsToDisplay == 3
                ? 240
                : numberOfBarsToDisplay * 65 + 10,
        cardStyle: cardStyle,
      }));
    } else {
      setFacetChartData((prevFacetChartData) => ({
        ...prevFacetChartData,
        filteredDataObj: {},
        isSuccess: false,
      }));
    }
  }, [
    data,
    isSuccess,
    maxValuesToDisplay,
    searchTerm,
    calcCardStyle,
    calcNumberOfBarsToDisplay,
    selectedEnums,
  ]);

  useDeepCompareEffect(() => {
    if (facetChartData.filteredData && facetChartData.filteredData.length > 0) {
      const compareValuesAscending = (
        [, a]: [string | number, number],
        [, b]: [string | number, number],
      ): number => a - b;
      const compareValuesDescending = (
        [, a]: [string | number, number],
        [, b]: [string | number, number],
      ): number => b - a;
      const compareKeysAscending = (
        [a]: [string | number, number],
        [b]: [string | number, number],
      ): number =>
        typeof a === 'string' && typeof b === 'string'
          ? a.localeCompare(b)
          : typeof a === 'number' && typeof b === 'number'
            ? a - b
            : 0;

      const compareKeysDescending = (
        [a]: [string | number, number],
        [b]: [string | number, number],
      ): number =>
        typeof a === 'string' && typeof b === 'string'
          ? b.localeCompare(a)
          : typeof a === 'number' && typeof b === 'number'
            ? b - a
            : 0;

      let comparisonFn;

      if (sortType.type === 'value') {
        comparisonFn =
          sortType.direction === 'dsc'
            ? compareValuesDescending
            : compareValuesAscending;
      } else {
        comparisonFn =
          sortType.direction === 'dsc'
            ? compareKeysDescending
            : compareKeysAscending;
      }

      const obj = [...facetChartData.filteredData]
        .sort(comparisonFn)
        .slice(0, !isGroupExpanded ? maxValuesToDisplay : undefined)
        .reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {} as Record<string | number, number>,
        );

      const val = Object.fromEntries(
        [...facetChartData.filteredData]
          .sort(comparisonFn)
          .slice(0, !isGroupExpanded ? maxValuesToDisplay : undefined),
      );

      setSortedData(obj);
    }
  }, [
    facetChartData.filteredData,
    sortType,
    isGroupExpanded,
    maxValuesToDisplay,
  ]);

  if (facetChartData.filteredData.length == 0 && hideIfEmpty) {
    return null; // nothing to render if visibleItems == 0
  }

  return (
    <div
      className={showFilters ? 'h-full' : 'h-0 invisible'}
      aria-hidden={!showFilters}
    >
      {' '}
      {isSuccess && error ? (
        <div className="m-4 font-content pb-2">{BAD_DATA_MESSAGE}</div>
      ) : (
        <>
          {isSearching && (
            <TextInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={'search values'}
              ref={searchInputRef}
              className="p-2"
              rightSection={
                searchTerm.length > 0 ? (
                  <ActionIcon
                    onClick={() => {
                      setSearchTerm('');
                      searchInputRef.current?.focus();
                    }}
                    aria-label={'clear search'}
                  >
                    <CloseIcon />
                  </ActionIcon>
                ) : undefined
              }
            />
          )}
          <div
            className={
              isFacetView
                ? 'flip-card h-full '
                : 'flip-card flip-card-flipped h-full'
            }
            ref={cardRef}
          >
            <div
              className={`card-face bg-base-max rounded-b-md flex flex-col justify-between ${
                !isFacetView ? 'invisible' : ''
              }`}
            >
              <div>
                {showSorting ? (
                  <FacetSortPanel
                    sortType={sortType}
                    valueLabel={valueLabel}
                    setSort={setSortType}
                    field={facetName ? facetName : fieldNameToTitle(field)}
                  />
                ) : (
                  false
                )}

                <div
                  className={facetChartData.cardStyle}
                  role="group"
                  aria-label="Filter values"
                >
                  <LoadingOverlay
                    visible={!isSuccess}
                    data-testid="loading-spinner"
                  />
                  {facetChartData.filteredData.length == 0 ? (
                    <div className="mx-4 font-content text-sm">
                      {BAD_DATA_MESSAGE}
                    </div>
                  ) : isSuccess ? (
                    !sortedData || Object.entries(sortedData).length === 0 ? (
                      <div className="mx-4">No results found</div>
                    ) : (
                      Object.entries(sortedData ?? {}).map(([value, count]) => {
                        return (
                          <div
                            key={`${field}-${value}`}
                            className="flex flex-row items-center gap-x-1 px-2 "
                          >
                            <div className="flex-none">
                              <Checkbox
                                data-testid={`checkbox-${value}`}
                                value={value}
                                size="xs"
                                color="accent"
                                onChange={(e) =>
                                  handleChange(
                                    e.currentTarget.value,
                                    e.currentTarget.checked,
                                  )
                                }
                                aria-label={`${value}`}
                                classNames={{
                                  input: 'bg-base hover:bg-accent-darker',
                                }}
                                checked={
                                  selectedEnums && selectedEnums.includes(value)
                                }
                              />
                            </div>
                            <OverflowTooltippedLabel label={value}>
                              <span className="font-content">{value}</span>
                            </OverflowTooltippedLabel>
                            <div className="flex-none text-right w-14 font-content">
                              {count.toLocaleString()}
                            </div>
                            {showPercent ? (
                              <div className="flex-none text-right w-18 font-content">
                                (
                                {(
                                  ((count as number) / totalCount) *
                                  100
                                ).toFixed(2)}
                                %)
                              </div>
                            ) : null}
                          </div>
                        );
                      })
                    )
                  ) : (
                    <div>
                      {
                        // uninitialized, loading, error animated bars
                        Array.from(Array(maxValuesToDisplay)).map(
                          (_, index) => {
                            return (
                              <div
                                key={`${field}-${index}`}
                                className="flex flex-row items-center px-2"
                              >
                                <div className="flex-none">
                                  <Checkbox
                                    size="xs"
                                    className="bg-base-lightest text-primary-contrast-lightest hover:bg-base-darkest hover:text-base-contrast-darkest"
                                  />
                                </div>
                                <div className="flex-grow h-3.5 align-center justify-center mt-1 ml-1 mr-8 bg-base-light rounded-b-sm animate-pulse" />
                                <div className="flex-none h-3.5 align-center justify-center mt-1 w-10 bg-base-light rounded-b-sm animate-pulse" />
                              </div>
                            );
                          },
                        )
                      }
                    </div>
                  )}
                </div>
              </div>
              {
                <FacetExpander
                  remainingValues={facetChartData.remainingValues}
                  isGroupExpanded={isGroupExpanded}
                  onShowChanged={setIsGroupExpanded}
                />
              }
            </div>
            <div
              className={`card-face card-back rounded-b-md bg-base-max h-full pb-1 ${
                isFacetView ? 'invisible' : ''
              }`}
            >
              {facetChartData.filteredData.length === 0 ? (
                <div className="mx-4">No results found</div>
              ) : (
                !isFacetView && (
                  <EnumFacetChart
                    field={field}
                    data={facetChartData.filteredDataObj}
                    selectedEnums={selectedEnums}
                    isSuccess={facetChartData.isSuccess}
                    showTitle={false}
                    valueLabel={valueLabel}
                    maxBins={facetChartData.numberOfBarsToDisplay}
                    height={facetChartData.height}
                  />
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FacetEnumList;
