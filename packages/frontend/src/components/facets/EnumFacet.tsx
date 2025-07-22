import React, { useState } from 'react';
import FacetControlsHeader from './FacetControlsHeader';
import FacetEnumList from './FacetEnumList';

import { controlsIconStyle, FacetHeader, FacetText } from './components';

import {
  EnumFacetDataChangedFunction,
  FacetCardProps,
  FacetDataHooks,
  GetEnumFacetDataFunction,
} from './types';

export interface EnumFacetHooks extends FacetDataHooks {
  useGetFacetData: GetEnumFacetDataFunction;
  updateVisibleValues?: EnumFacetDataChangedFunction;
}

const EnumFacet = ({
  field,
  hooks,
  valueLabel,
  description,
  facetName,
  showPercent = true,
  hideIfEmpty = true,
  showSearch = true,
  showFlip = false,
  showSettings = false, // TODO: change to true with support for combine ops is completed
  startShowingData = true,
  dismissCallback = undefined,
  width = undefined,
  sharedWithIndices = undefined,
  moveValuesToBottom = [],
  excludeValues = [],
  header = {
    Panel: FacetHeader,
    Label: FacetText,
    iconStyle: controlsIconStyle,
  },
}: FacetCardProps<EnumFacetHooks>) => {
  const [isSettings, setIsSessings] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFacetView, setIsFacetView] = useState(startShowingData);
  const isFilterExpanded =
    hooks.useFilterExpanded && hooks.useFilterExpanded(field);
  const showFilters = isFilterExpanded === undefined || isFilterExpanded;
  const toggleSearch = () => {
    setIsSearching((isSearching) => !isSearching);
  };

  const toggleSettings = () => {
    setIsSessings((isSettings) => !isSettings);
  };

  const toggleFlip = () => {
    setIsFacetView((isFacetView) => !isFacetView);
  };

  return (
    <div
      className={`flex flex-col ${
        width ? width : 'mx-1'
      } bg-base-max relative border-base-light border-1 rounded-md text-xs transition`}
      id={field}
    >
      <FacetControlsHeader
        field={field}
        description={description}
        hooks={hooks}
        facetName={facetName}
        showSearch={showSearch}
        showFlip={showFlip}
        showSettings={showSettings}
        isFacetView={isFacetView}
        toggleFlip={toggleFlip}
        toggleSearch={toggleSearch}
        toggleSettings={toggleSettings}
        dismissCallback={dismissCallback}
        sharedWithIndices={sharedWithIndices}
        header={header}
      />

      <div
        className={showFilters ? 'h-full' : 'h-0 invisible'}
        aria-hidden={!showFilters}
      >
        <FacetEnumList
          field={field}
          facetName={facetName}
          valueLabel={valueLabel}
          hooks={hooks}
          isSettings={isSettings}
          isFacetView={isFacetView}
          isSearching={isSearching}
          hideIfEmpty={hideIfEmpty}
          showPercent={showPercent}
          moveValuesToBottom={moveValuesToBottom}
          excludeValues={excludeValues}
        />
      </div>
    </div>
  );
};

export default EnumFacet;
