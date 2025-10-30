import React, { useMemo } from 'react';
import { FacetDefinition, FacetType, fieldNameToTitle } from '@gen3/core';
import { createFacetCard } from './createFacetCard';
import { FacetHooks } from './types';
import { useResizeObserver } from '@mantine/hooks';

interface FiltersPanelProps<T extends FacetType = FacetType> {
  dataFunctions: Record<T, FacetHooks>;
  fields: ReadonlyArray<FacetDefinition>;
  valueLabel: string;
}

const FiltersPanel = <T extends FacetType = FacetType>({
  fields,
  dataFunctions,
  valueLabel,
}: FiltersPanelProps<T>): JSX.Element => {
  const [ref, rect] = useResizeObserver();
  const maxHeight = useMemo(() => {
    const calcHeight = ref?.current?.getBoundingClientRect().top;
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
          facetNameFormatter: fieldNameToTitle,
          idPrefix: 'filters-panel',
          showPercent: false,
        });
      })}
    </div>
  );
};

export default FiltersPanel;
