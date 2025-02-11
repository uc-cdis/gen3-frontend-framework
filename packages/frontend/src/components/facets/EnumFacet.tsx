import React, { useState } from 'react';
import FacetControlsHeader from './FacetControlsHeader';
import FacetEnumList from './FacetEnumList';

import { FacetHeader, FacetText, controlsIconStyle } from './components';

import {
  FacetCardProps,
  FacetDataHooks,
  GetEnumFacetDataFunction,
} from './types';

export interface EnumFacetHooks extends FacetDataHooks {
  useGetFacetData: GetEnumFacetDataFunction;
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
  showSettings = true,
  startShowingData = true,
  dismissCallback = undefined,
  width = undefined,
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
      } bg-base-max relative border-base-light border-1 rounded-b-md text-xs transition`}
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
        />
      </div>
    </div>
  );
};

export default EnumFacet;
