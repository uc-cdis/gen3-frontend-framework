import React, { useEffect, useRef, useState } from 'react';
import { Text, Switch, ActionIcon, TextInput } from '@mantine/core';
import { SortType, FacetCardProps, FacetCommonHooks } from './types';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import FacetControlsHeader from './FacetControlsHeader';
import { controlsIconStyle, FacetHeader, FacetText } from './components';
import { toDisplayName } from '../../utils';
import { FacetDefinition, fieldNameToTitle } from '@gen3/core';
import FacetExpander from './FacetExpander';
import { BAD_DATA_MESSAGE, DEFAULT_VISIBLE_ITEMS } from './constants';
import { MdClose as CloseIcon } from 'react-icons/md';

interface SelectedFields {
  category: string;
  fields: Array<FacetDefinition>;
  selectedFields: Array<string>;
  updateSelectedField: (facet: string) => void;
}

type FacetSelectorCardProps = Omit<
  FacetCardProps<FacetCommonHooks>,
  'field' | 'valueLabel'
> &
  SelectedFields;

const FacetSelector: React.FC<FacetSelectorCardProps> = ({
  category,
  facetName,
  hooks,
  width = 'w-full',
  description,
  fields,
  selectedFields,
  updateSelectedField,
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

  const remainingValues = filteredFields.length - DEFAULT_VISIBLE_ITEMS;

  return (
    <div
      className={`flex flex-col ${
        width ? width : 'mx-1'
      } bg-base-max relative border-base-light border-1 rounded-b-md transition`}
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
            <div className="card-face bg-base-max rounded-b-xs flex flex-col gap-y-1 justify-between">
              <div>
                {filteredFields.length == 0 ? (
                  <div className="mx-4 font-content text-sm">
                    {BAD_DATA_MESSAGE}
                  </div>
                ) : (
                  filteredFields.map((facet) => {
                    const label = fieldNameToTitle(facet.field);
                    return (
                      <div
                        key={facet.field}
                        className="flex justify-between items-center px-2 my-1"
                      >
                        <Text size="sm" fw={400}>
                          {label}
                        </Text>

                        <Switch
                          data-testid={`switch-${label}`}
                          aria-label={`select ${facet.field}`}
                          color="accent"
                          checked={
                            selectedFields &&
                            selectedFields.includes(facet.field)
                          }
                          onChange={() => updateSelectedField(facet.field)}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            {remainingValues > 0 ? (
              <FacetExpander
                remainingValues={remainingValues}
                isGroupExpanded={isGroupExpanded}
                onShowChanged={setIsGroupExpanded}
              />
            ) : null}
          </div>
        </>
      </div>
    </div>
  );
};

export default FacetSelector;
