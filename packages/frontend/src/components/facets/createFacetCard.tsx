import React from 'react';
import { FacetDefinition } from '@gen3/core';
import { FacetDataHooks } from './types';
import EnumFacet from './EnumFacet';
import RangeFacet from './RangeFacet';
import MultiSelectValueFacet from './MultiSelectValueFacet';
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
              key={`${idPrefix}-range-${field}`}
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
              key={`${idPrefix}-exact-${field}`}
              field={field}
              facetName={facetName}
              description={description}
              hideIfEmpty={hideIfEmpty}
              width={width}
              dataHooks={dataFunctions}
            />
          ),
          multiselect: (
            <MultiSelectValueFacet
              key={`${idPrefix}-exact-${field}`}
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
