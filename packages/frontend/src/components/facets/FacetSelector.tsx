import React, { useEffect, useRef, useState } from 'react';
import { Text, Switch, ActionIcon, TextInput } from '@mantine/core';
import { SortType, FacetCardProps, FacetCommonHooks } from './types';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import FacetControlsHeader from './FacetControlsHeader';
import { controlsIconStyle, FacetHeader, FacetText } from './components';
import { toDisplayName } from '../../utils';
import { FacetDefinition } from '@gen3/core';
import FacetExpander from './FacetExpander';
import { BAD_DATA_MESSAGE, DEFAULT_VISIBLE_ITEMS } from './constants';
import { MdClose as CloseIcon } from 'react-icons/md';

export interface SelectFacetHooks extends FacetCommonHooks {
  updateSelectedField: (facet: string) => void;
  useGetFields: () => Array<FacetDefinition>;
  useGetSelected: () => Array<string>;
}

interface FacetSelectorCardProps
  extends Omit<FacetCardProps<SelectFacetHooks>, 'field' | 'valueLabel'> {
  category: string;
}

const FacetSelector: React.FC<FacetSelectorCardProps> = ({
  category,
  facetName,
  hooks,
  width,
  description,
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

  const cardRef = useRef<HTMLDivElement>(null);
  const isFilterExpanded =
    hooks.useFilterExpanded && hooks.useFilterExpanded(category);
  const showFilters = isFilterExpanded === undefined || isFilterExpanded;
  const fields = hooks.useGetFields();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedFields = hooks.useGetSelected();

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

  const remainingValues = filteredFields.length - DEFAULT_VISIBLE_ITEMS;

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
          facetName={facetName}
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
              aria-label={`category ${facetName}`}
              className={'p-2'}
              placeholder="Search"
              ref={searchInputRef}
              rightSection={
                searchTerm.length > 0 && (
                  <ActionIcon
                    onClick={() => {
                      setSearchTerm('');
                      searchInputRef?.current?.focus();
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
          <div className="flip-card" ref={cardRef}>
            <div className="card-face bg-base-max rounded-b-md flex flex-col justify-between">
              <div>
                {filteredFields.length == 0 ? (
                  <div className="mx-4 font-content text-sm">
                    {BAD_DATA_MESSAGE}
                  </div>
                ) : (
                  filteredFields.map((facet) => {
                    return (
                      <div
                        key={facet.field}
                        className="flex items-center gap-x-1 px-2"
                      >
                        <Text>{facet.label}</Text>

                        <Switch
                          data-testid={`checkbox-${facet}`}
                          aria-label={`${facet}`}
                          size="xs"
                          color="accent"
                          checked={
                            selectedFields &&
                            selectedFields.includes(facet.field)
                          }
                        />
                      </div>
                    );
                  })
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
        </>
      </div>
    </div>
  );
};

export default FacetSelector;
