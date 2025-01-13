import React from 'react';
import { FacetDefinition, FacetType } from '@gen3/core';
import { createFacetCard } from '../../components/facets/createFacetCard';
import { FacetDataHooks } from '../../components/facets/types';

interface FiltersPanelProps {
  dataFunctions: Record<FacetType, FacetDataHooks>;
  fields: ReadonlyArray<FacetDefinition>;
  valueLabel: string;
  collapse: boolean;
}

export const FiltersPanel = ({
  fields,
  dataFunctions,
  valueLabel,
  collapse
}: FiltersPanelProps): JSX.Element => {
  return (
    <div
      data-testid="filters-facets"
      className="flex flex-col gap-y-4 h-full overflow-y-scroll px-4 w-full"
    >
      {fields.map((facetDefinition) => {
        return createFacetCard(
          facetDefinition,
          valueLabel,
          dataFunctions[facetDefinition.type],
          'filters-panel',
          undefined,
          false,
          collapse,
          facetDefinition.label,
          'w-64',
        );
      })}
    </div>
  );
};
