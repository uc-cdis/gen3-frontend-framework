import React, { ReactElement } from 'react';
import { FacetDefinition } from '../../../components/facets/types';
import EnumFacetPanel, { EnumFacetPanelDataHooks } from './EnumFacetPanel';

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
