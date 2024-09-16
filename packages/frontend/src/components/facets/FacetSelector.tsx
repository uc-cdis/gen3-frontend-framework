import React, { useEffect, useRef, useState } from 'react';
import { SortType, FacetCardProps, FacetCommonHooks } from './types';
import { useDeepCompareCallback } from 'use-deep-compare';
import FacetControlsHeader from './FacetControlsHeader';
import { controlsIconStyle, FacetHeader, FacetText } from './components';

interface FacetWithLabelSelection {
  facet: string;
  label: string;
  selected: boolean;
}

export interface SelectFacetHooks extends FacetCommonHooks {
  updateSelectedField: (facet: string) => void;
  useGetSelectedFields: () => string[];
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
  const [sortedData, setSortedData] = useState<Record<string | number, number>>(
    {},
  );
  const [sortType, setSortType] = useState<SortType>({
    type: 'alpha',
    direction: 'asc',
  });
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
    </div>
  );
};

export default FacetSelector;
