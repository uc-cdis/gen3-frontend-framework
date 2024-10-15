import { AggregationsData, FacetDefinition } from '@gen3/core';
import EnumFacetPanel, { EnumFacetPanelDataHooks } from './EnumFacetPanel';
import { ReactElement } from 'react';

export const createFacetPanel = (
  facet: FacetDefinition,
  chartType: string,
  valueLabel: string,
  hooks: EnumFacetPanelDataHooks,
): ReactElement | null => {
  switch (facet.type) {
    case 'enum':
      return (
        <EnumFacetPanel
          facet={facet}
          chartType={chartType}
          valueLabel={valueLabel}
          hooks={hooks}
        />
      );
  }
  return null;
};
