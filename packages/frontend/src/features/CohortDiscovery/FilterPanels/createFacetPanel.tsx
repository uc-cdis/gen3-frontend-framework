import { AggregationsData, FacetDefinition } from '@gen3/core';
import EnumFacetPanel, { EnumFacetPanelDataHook } from './EnumFacetPanel';
import { ReactElement } from 'react';

export const createFacetPanel = (
  facet: FacetDefinition,
  chartType: string,
  valueLabel: string,
  hooks: EnumFacetPanelDataHook,
): ReactElement | null => {
  switch (facet.type) {
    case 'enum':
      return (
        <EnumFacetPanel
          facet={facet}
          chartType={chartType}
          valueLabel={chartType}
          hooks={hooks}
        />
      );
  }
  return null;
};
