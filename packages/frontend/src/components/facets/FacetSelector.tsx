import React, { useEffect, useRef, useState } from 'react';
import { SortType, FacetCardProps, FacetCommonHooks } from './types';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import FacetControlsHeader from './FacetControlsHeader';
import { controlsIconStyle, FacetHeader, FacetText } from './components';
import { toDisplayName } from '../../utils';
import { FacetDefinition } from '@gen3/core';
import FacetSortPanel from './FacetSortPanel';
import FacetExpander from './FacetExpander';
import { SortType } from './types';
import OverflowTooltippedLabel from '../OverflowTooltippedLabel';

import { ActionIcon, Checkbox, LoadingOverlay, TextInput } from '@mantine/core';
import { MdClose as CloseIcon } from 'react-icons/md';

interface FacetWithLabelSelection {
  facet: string;
  label: string;
  selected: boolean;
}

export interface SelectFacetHooks extends FacetCommonHooks {
  updateSelectedField: (facet: string) => void;
  useGetFields: () => Array<FacetDefinition>;
}

interface FacetSelectorCardProps
  extends Omit<FacetCardProps<SelectFacetHooks>, 'field' | 'valueLabel'> {
  category: string;
}

const FacetSelector: React.FC<FacetSelectorCardProps> = ({
  category,
  facetTitle,
  hooks,
  width,
  description,

  hideIfEmpty = true,
  showSearch = true,
  header = {
    Panel: FacetHeader,
    Label: FacetText,
    iconStyle: controlsIconStyle,
  },
}) => {
  const [isGroupExpanded, setIsGroupExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<SortType>({
    type: 'alpha',
    direction: 'asc',
  });
  const isFilterExpanded =
    hooks.useFilterExpanded && hooks.useFilterExpanded(category);
  const showFilters = isFilterExpanded === undefined || isFilterExpanded;
  const fields = hooks.useGetFields();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    setSearchTerm('');
  };

  useEffect(() => {
    if (isSearching) {
      searchInputRef?.current?.focus();
    }
  }, [isSearching]);

  const filteredFields = useDeepCompareMemo(() => {
    if (!searchTerm) return fields;
    return fields.filter(
      (f) =>
        f.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toDisplayName(f?.label ?? f.field)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, fields]);

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

  return (
    <div
      className={`flex flex-col ${
        width ? width : 'mx-1'
      } bg-base-max relative shadow-lg border-base-lighter border-1 rounded-b-md text-xs transition`}
      id={category}
    >
      <div>
        <FacetControlsHeader
          field={category}
          description={description}
          hooks={hooks}
          facetName={facetTitle}
          showSearch={showSearch}
          toggleSearch={toggleSearch}
          header={header}
        />
      </div>
      <div
        className={showFilters ? 'h-full' : 'h-0 invisible'}
        aria-hidden={!showFilters}
      >
        <>
          {isSearching && (
            <TextInput
              data-testid="textbox-search-values"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={`${
                facetName ? facetName : fieldNameToTitle(field)
              } values`}
              className={'p-2'}
              placeholder="Search"
              ref={searchInputRef}
              rightSection={
                searchTerm.length > 0 && (
                  <ActionIcon
                    onClick={() => {
                      setSearchTerm('');
                      searchInputRef.current.focus();
                    }}
                    className="border-0"
                  >
                    <CloseIcon aria-label="clear search" />
                  </ActionIcon>
                )
              }
              role="search"
            />
          )}
          <div
            className={
              isFacetView ? `flip-card ` : `flip-card flip-card-flipped`
            }
            ref={cardRef}
          >
            <div
              className={`card-face bg-base-max rounded-b-md flex flex-col justify-between ${
                !isFacetView ? 'invisible' : ''
              }`}
            >
              <div>
                <FacetSortPanel
                  sortType={sortType}
                  valueLabel={valueLabel}
                  setSort={setSortType}
                  field={facetName ? facetName : fieldNameToTitle(field)}
                />
                <LoadingOverlay
                  data-testid="loading-spinner"
                  visible={!isSuccess}
                />
                {facetChartData.filteredData.length == 0 ? (
                  <div className="mx-4 font-content text-sm">
                    {BAD_DATA_MESSAGE}
                  </div>
                ) : isSuccess ? (
                  !sortedData ||
                  Object.entries(sortedData).map(([value, count]) => {
                    return (
                      <div
                        key={`${field}-${value}`}
                        className="flex flex-row items-center gap-x-1 px-2"
                      >
                        <div className="flex-none">
                          <Checkbox
                            data-testid={`checkbox-${value}`}
                            aria-label={`${value}`}
                            value={value}
                            size="xs"
                            color="accent"
                            onChange={(e) =>
                              handleChange(
                                e.currentTarget.value,
                                e.currentTarget.checked,
                              )
                            }
                            classNames={{
                              input: 'hover:bg-accent-darker',
                            }}
                            checked={
                              !!(selectedEnums && selectedEnums.includes(value))
                            }
                          />
                        </div>
                        <OverflowTooltippedLabel label={value}>
                          <span className="font-content">{value}</span>
                        </OverflowTooltippedLabel>
                        <div
                          data-testid={`text-${value}`}
                          className="flex-none text-right w-14 font-content text-sm"
                        >
                          {count.toLocaleString()}
                        </div>
                      </div>
                    );
                  })
                ) : null}
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
        </>
      </div>
    </div>
  );
};

export default FacetSelector;
