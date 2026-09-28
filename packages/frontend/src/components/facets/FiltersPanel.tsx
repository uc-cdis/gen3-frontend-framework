import React, { useMemo, JSX } from 'react';
import { FacetDefinition, FacetType, fieldNameToLabel } from '@gen3/core';
import { createFacetCard } from './createFacetCard';
import { FacetHooks, FacetValueLabel } from './types';
import { useResizeObserver } from '@mantine/hooks';

interface FiltersPanelProps<T extends FacetType = FacetType> {
  dataFunctions: Record<T, FacetHooks>;
  fields: ReadonlyArray<FacetDefinition>;
  valueLabel: FacetValueLabel;
}

const FiltersPanel = <T extends FacetType = FacetType>({
  fields,
  dataFunctions,
  valueLabel,
}: FiltersPanelProps<T>): JSX.Element => {
  const [ref, rect] = useResizeObserver();
  const maxHeight = useMemo(() => {
    const calcHeight = rect.height;
    return !calcHeight || isNaN(calcHeight) ? undefined : calcHeight;
  }, [ref]);

  return (
    <div
      data-testid="filters-facets"
      className="flex flex-col max-h-screen overflow-y-auto gap-y-4
       border-t-1 border-b-1 rounded-md"
      ref={ref}
      style={{ maxHeight: maxHeight }}
    >
      {fields.map((facetDefinition) => {
        if (facetDefinition?.type === undefined) {
          console.warn('Facet definition missing type', facetDefinition);
          return null;
        }
        if (!(facetDefinition.type in dataFunctions)) {
          return null;
        }

        return createFacetCard({
          facetDefinition,
          valueLabel,
          hooks: dataFunctions[facetDefinition.type as T],
          facetNameFormatter: fieldNameToLabel,
          idPrefix: 'filters-panel',
          showPercent: false,
        });
      })}
    </div>
  );
};

export default FiltersPanel;
