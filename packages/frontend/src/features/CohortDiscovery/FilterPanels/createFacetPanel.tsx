import React, { ReactElement } from 'react';
import { EnumFacetDataHooks } from '../../../components/facets';
import EnumFacetPanel from './EnumFacetPanel';
import { FacetDefinition } from '@gen3/core';

export const createFacetPanel = (
  facet: FacetDefinition,
  chartType: string,
  valueLabel: string,
  hooks: EnumFacetDataHooks,
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
