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
  startShowingData = true,
  dismissCallback = undefined,
  collapse = false,
  width = undefined,
  header = {
    Panel: FacetHeader,
    Label: FacetText,
    iconStyle: controlsIconStyle,
  },
}: FacetCardProps<EnumFacetHooks>) => {
  const [isSearching, setIsSearching] = useState(false);
  const [isFacetView, setIsFacetView] = useState(startShowingData);

  const toggleSearch = () => {
    setIsSearching(!isSearching);
  };

  const toggleFlip = () => {
    setIsFacetView(!isFacetView);
  };

  return (
    <div
      className={`flex flex-col ${
        width ? width : 'mx-1'
      } bg-base-max relative shadow-lg border-base-lighter border-1 rounded-b-md text-xs transition`}
      id={field}
    >
      <div>
        <FacetControlsHeader
          field={field}
          description={description}
          hooks={hooks}
          facetName={facetName}
          showSearch={showSearch}
          showFlip={showFlip}
          isFacetView={isFacetView}
          toggleFlip={toggleFlip}
          toggleSearch={toggleSearch}
          dismissCallback={dismissCallback}
          header={header}
        />
      </div>
      <FacetEnumList
        field={field}
        facetName={facetName}
        valueLabel={valueLabel}
        hooks={hooks}
        isFacetView={isFacetView}
        isSearching={isSearching}
        hideIfEmpty={hideIfEmpty}
        showPercent={showPercent}
      />
    </div>
  );
};

export default EnumFacet;
