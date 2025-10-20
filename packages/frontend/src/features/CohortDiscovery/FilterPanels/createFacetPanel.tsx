import React, { ReactElement } from 'react';
import EnumFacetPanel, { EnumFacetPanelDataHooks } from './EnumFacetPanel';
import { FacetDefinition } from '@gen3/core';

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
