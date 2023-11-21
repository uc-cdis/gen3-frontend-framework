

import React, { useEffect, useState, useRef } from 'react';
import { usePrevious, fieldNameToTitle } from '@gen3/core';

import {
  MdFlip as FlipIcon,
  MdSearch as SearchIcon,
  MdClose as CloseIcon,
} from 'react-icons/md';
import { FaUndo as UndoIcon } from 'react-icons/fa';

import {
  ActionIcon,
  Checkbox,
  LoadingOverlay,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  FacetHeader,
  FacetText,
  controlsIconStyle,
  FacetIconButton,
} from './components';
import OverflowTooltippedLabel from '../OverflowTooltippedLabel';
import { updateFacetEnum } from './utils';
import { DEFAULT_VISIBLE_ITEMS } from './constants';
import {
  FacetHooks,
  UpdateFacetFilterHook,
  GetEnumFacetDataFunction,
  GetTotalCountsFunction,
  FacetCardProps,
} from './types';

import FacetSortPanel from './FacetSortPanel';
import FacetExpander from './FacetExpander';
import { isEqual } from 'lodash';

const MAX_VALUES_TO_DISPLAY = 2048;

export interface EnumFacetHooks extends FacetHooks {
  useUpdateFacetFilters: UpdateFacetFilterHook;
  useGetFacetData: GetEnumFacetDataFunction;
  useTotalCounts: GetTotalCountsFunction;
}

const EnumFacet= ({
  field,
  dataHooks,
  valueLabel,
  description,
  facetName,
  showPercent = true,
  hideIfEmpty = true,
  showSearch = true,
  showFlip = false,
  startShowingData = true,
  dismissCallback = undefined,
  width = undefined,
  header = {
    Panel: FacetHeader,
    Label: FacetText,
    iconStyle: controlsIconStyle,
  },
} : FacetCardProps<EnumFacetHooks>) => {
  const [isGroupExpanded, setIsGroupExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSortedByValue, setIsSortedByValue] = useState(false);
  const [isFacetView, setIsFacetView] = useState(startShowingData);
  const [visibleItems, setVisibleItems] = useState(DEFAULT_VISIBLE_ITEMS);
  const { data, enumFilters, isSuccess } = dataHooks.useGetFacetData(field);

  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedEnums, setSelectedEnums] = useState(enumFilters);
  const prevFilters = usePrevious(enumFilters);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const totalCount = 1000;
  // TODO Determine if total count is needed
  // const totalCount = dataHooks.useTotalCounts();
  const clearFilters = dataHooks.useClearFilter();
  const updateFacetFilters = dataHooks.useUpdateFacetFilters();

  useEffect(() => {
    if (isSearching) {
      searchInputRef?.current?.focus();
    }
  }, [isSearching]);

  useEffect(() => {
    if (isSearching) {
      searchInputRef?.current?.focus();
    }
  }, [isSearching]);

  // filter missing and "" strings and update checkboxes
  useEffect(() => {
    if (isSuccess) {
      setVisibleItems(
        Object.entries(data ?? {}).filter(
          (entry) => entry[0] != '_missing' && entry[0] != '',
        ).length,
      );
    }
  }, [data, field, isSuccess]);

  useEffect(() => {
    if (!isEqual(prevFilters, enumFilters)) {
      setSelectedEnums(enumFilters);
    }
  }, [enumFilters, isSuccess, prevFilters]);

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    setSearchTerm('');
  };

  const toggleFlip = () => {
    setIsFacetView(!isFacetView);
  };

  const filteredData = data
    ? Object.entries(data)
        .filter((entry) => entry[0] != '_missing' && entry[0] != '')
        .filter((entry) =>
          searchTerm === ''
            ? entry
            : entry[0].toLowerCase().includes(searchTerm.toLowerCase().trim()),
        )
    : [];

  // update filters when checkbox is selected
  const handleChange = (value: string, checked: boolean) => {
    if (checked) {
      const updated = selectedEnums ? [...selectedEnums, value] : [value];
      updateFacetEnum(field, updated, updateFacetFilters, clearFilters);
    } else {
      const updated = selectedEnums ? selectedEnums.filter((x) => x != value) : [];
      updateFacetEnum(field, updated, updateFacetFilters, clearFilters);
    }
  };

  const maxValuesToDisplay = DEFAULT_VISIBLE_ITEMS;
  const total = visibleItems;
  if (total == 0 && hideIfEmpty) {
    return null; // nothing to render if total == 0
  }

  const remainingValues = filteredData.length - maxValuesToDisplay;
  const cardHeight =
    remainingValues > 16
      ? 96
      : remainingValues > 0
      ? Math.min(96, remainingValues * 5 + 40)
      : 24;

  const cardStyle = isGroupExpanded
    ? `flex-none  h-${cardHeight} overflow-y-scroll `
    : 'overflow-hidden pr-3.5 h-auto';

  const numberOfLines =
    total - maxValuesToDisplay < 0
      ? total
      : isGroupExpanded
      ? 16
      : maxValuesToDisplay;

  const sortedData  = filteredData
    ? Object.fromEntries(
        filteredData
          .sort(
            isSortedByValue
              ? ([, a], [, b]) => b - a
              : ([a], [b]) => a.localeCompare(b),
          )
          .slice(0, !isGroupExpanded ? maxValuesToDisplay : MAX_VALUES_TO_DISPLAY),
      )
    : undefined;

  return (
    <div
      className={`flex flex-col ${
        width ? width : 'mx-1'
      } bg-base-max relative shadow-lg border-base-lighter border-1 rounded-b-md text-xs transition`}
      id={field}
    >
      <div>
        <header.Panel>
          <Tooltip
            label={description}
            position="bottom-start"
            multiline
            width={220}
            withArrow
            disabled={!description}
          >
            <header.Label>
              {facetName ? facetName : fieldNameToTitle(field)}
            </header.Label>
          </Tooltip>
          <div className="flex flex-row">
            {showSearch ? (
              <FacetIconButton onClick={toggleSearch} aria-label="Search">
                <SearchIcon size="1.45em" className={header.iconStyle} />
              </FacetIconButton>
            ) : null}
            {showFlip ? (
              <FacetIconButton
                onClick={toggleFlip}
                aria-label="Flip between form and chart"
              >
                <FlipIcon size="1.45em" className={header.iconStyle} />
              </FacetIconButton>
            ) : null}
            <FacetIconButton
              onClick={() => clearFilters(field)}
              aria-label="clear selection"
            >
              <UndoIcon size="1.25em" className={header.iconStyle} />
            </FacetIconButton>
            {dismissCallback ? (
              <FacetIconButton
                onClick={() => {
                  clearFilters(field);
                  dismissCallback(field);
                }}
                aria-label="Remove the facet"
              >
                <CloseIcon size="1.25em" className={header.iconStyle} />
              </FacetIconButton>
            ) : null}
          </div>
        </header.Panel>
      </div>
      <div className="h-full">
        {isSearching && (
          <TextInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={'search values'}
            ref={searchInputRef}
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
            className={`card-face bg-base-max ${
              !isFacetView ? 'invisible' : ''
            }`}
          >
            <div>
              <FacetSortPanel
                isSortedByValue={isSortedByValue}
                valueLabel={valueLabel}
                setIsSortedByValue={setIsSortedByValue}
              />

              <div className={cardStyle}>
                <LoadingOverlay visible={!isSuccess} />
                {total == 0 ? (
                  <div className="mx-4 font-content">
                    No data for this field
                  </div>
                ) : isSuccess ? (
                  Object.entries(sortedData ?? {}).length === 0 ? (
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
                              aria-label={`checkbox for ${field}`}
                              classNames={{
                                input: 'hover:bg-accent-darker',
                              }}
                              checked={
                                !!(
                                  selectedEnums && selectedEnums.includes(value)
                                )
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
                              {(((count as number) / totalCount) * 100).toFixed(
                                2,
                              )}
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
                      Array.from(Array(numberOfLines)).map((_, index) => {
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
                      })
                    }
                  </div>
                )}
              </div>
            </div>
            {
              <FacetExpander
                remainingValues={remainingValues}
                isGroupExpanded={isGroupExpanded}
                onShowChanged={setIsGroupExpanded}
              />
            }
          </div>
          <div
            className={`card-face card-back bg-base-max h-full overflow-y-auto pb-1 ${
              isFacetView ? 'invisible' : ''
            }`}
          >
            {filteredData.length === 0 ? (
              <div className="mx-4">No results found</div>
            ) : (
              !isFacetView && <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnumFacet;
