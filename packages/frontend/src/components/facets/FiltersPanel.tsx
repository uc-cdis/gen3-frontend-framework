import React from 'react';
import { fieldNameToTitle } from '@gen3/core';
import { createFacetCard } from './createFacetCard';
import { FacetDataHooks, FacetDefinition, FacetType } from './types';

interface FiltersPanelProps {
  dataFunctions: Record<FacetType, FacetDataHooks>;
  fields: ReadonlyArray<FacetDefinition>;
  valueLabel: string;
}

const FiltersPanel = ({
  fields,
  dataFunctions,
  valueLabel,
}: FiltersPanelProps): JSX.Element => {
  return (
    <div data-testid="filters-facets" className="flex flex-col gap-y-4 w-full">
      {fields.map((facetDefinition) => {
        if (facetDefinition?.type === undefined) {
          console.warn('Facet definition missing type', facetDefinition);
          return null;
        }
        if (!(facetDefinition.type in dataFunctions)) return null;

        return createFacetCard({
          facetDefinition,
          valueLabel,
          hooks: dataFunctions[facetDefinition.type],
          facetNameFormatter: fieldNameToTitle,
          idPrefix: 'filters-panel',
          showPercent: false,
        });
      })}
    </div>
  );
};

export default FiltersPanel;
