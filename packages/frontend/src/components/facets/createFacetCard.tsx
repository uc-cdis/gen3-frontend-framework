import React from 'react';
import { FacetDataHooks } from './types';
import EnumFacet from './EnumFacet';
import RangeFacet from './RangeFacet';
import { FacetDefinition } from '@gen3/core';
import ExactValueFacet from './ExactValueFacet';

export const createFacetCard = (
  facetDefinition: FacetDefinition,
  valueLabel: string,
  dataFunctions: FacetDataHooks,
  idPrefix: string,
  dismissCallback: (_arg0: string) => void = () => null,
  hideIfEmpty = false,
  facetName?: string,
  width?: string,
): React.ReactNode => {
  const { field, type, description } = facetDefinition;
  return (
    <div key={`${idPrefix}-enum-${field}`}>
      {
        {
          enum: (
            <EnumFacet
              key={`${idPrefix}-enum-${field}`}
              valueLabel={valueLabel}
              field={field}
              facetName={facetName}
              description={description}
              hideIfEmpty={hideIfEmpty}
              width={width}
              dataHooks={dataFunctions}
              showPercent={false}
            />
          ),
          range: (
            <RangeFacet
              key={`${idPrefix}-enum-${field}`}
              valueLabel={valueLabel}
              field={field}
              facetName={facetName}
              description={description}
              hideIfEmpty={hideIfEmpty}
              width={width}
              dataHooks={dataFunctions}
              minimum={facetDefinition.range?.minimum}
              maximum={facetDefinition.range?.maximum}
            />
          ),
          exact: (
            <ExactValueFacet
              key={`${idPrefix}-enum-${field}`}
              field={field}
              facetName={facetName}
              description={description}
              hideIfEmpty={hideIfEmpty}
              width={width}
              dataHooks={dataFunctions}
            />
          ),
        }[type as string]
      }
    </div>
  );
};
