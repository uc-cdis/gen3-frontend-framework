import { createFacetCard } from '../../components/facets/createFacetCard';
import React from 'react';
import { FacetRequiredHooks } from '../../components/facets/types';
import { FacetDefinition, FacetType } from '@gen3/core';

interface FiltersPanelProps {
  dataFunctions: Record<FacetType, FacetRequiredHooks>;
  fields: ReadonlyArray<FacetDefinition>;
  valueLabel: string;
}

export const FiltersPanel = ({
  fields,
  dataFunctions,
    valueLabel,
}: FiltersPanelProps): JSX.Element => {
  return (
    <div
      data-testid="filters-facets"
      className="flex flex-col gap-y-4 h-screen overflow-y-scroll px-4 w-full"
    >
      {fields.map((facetDefinition) => {
        return createFacetCard(
          facetDefinition,
            valueLabel,
          dataFunctions[facetDefinition.type as string],
          'filters-panel',
          undefined,
          false,
            undefined,
            'w-64'
        );
      })}
    </div>
  );
};
