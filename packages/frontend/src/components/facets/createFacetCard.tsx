import React from 'react';
import {
  EnumChartProps,
  FacetDataHooks,
  FacetDefinition,
  QueryOptions,
} from './types';
import EnumFacet from './EnumFacet';
import RangeFacet from './RangeFacet';
import MultiSelectValueFacet from './MultiSelectValueFacet';
import ExactValueFacet from './ExactValueFacet';

export interface CreateFacetCardProps {
  facetDefinition: FacetDefinition;
  hooks: FacetDataHooks;
  idPrefix: string;
  valueLabel: string | ((queryOptions?: QueryOptions) => string);
  dismissCallback?: (field: string) => void;
  hideIfEmpty?: boolean;
  width?: string;
  showPercent?: boolean;
  queryOptions?: QueryOptions;
  facetNameFormatter: (field: string) => string;
  cardScrollMargin?: number;
  Chart?: React.FC<EnumChartProps>;
}

export const createFacetCard = ({
  facetDefinition,
  valueLabel,
  hooks: dataFunctions,
  facetNameFormatter,
  idPrefix,
  hideIfEmpty = false,
  width,
  showPercent = false,
  queryOptions,
}: CreateFacetCardProps): React.ReactNode => {
  const { field, type, description, label } = facetDefinition;
  const facetLabel = label ?? facetNameFormatter(facetDefinition.field);
  const valueTypeLabel =
    valueLabel === undefined || typeof valueLabel === 'string'
      ? valueLabel
      : valueLabel(queryOptions);

  return (
    <div key={`${idPrefix}-facet-${field}`}>
      {
        {
          enum: (
            <EnumFacet
              key={`${idPrefix}-enum-${field}`}
              valueLabel={valueTypeLabel}
              field={field}
              facetName={facetLabel}
              description={description}
              hideIfEmpty={hideIfEmpty}
              width={width}
              hooks={dataFunctions}
              showPercent={showPercent}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
            />
          ),
          range: (
            <RangeFacet
              key={`${idPrefix}-range-${field}`}
              valueLabel={valueTypeLabel}
              field={field}
              facetName={facetLabel}
              description={description}
              hideIfEmpty={hideIfEmpty}
              width={width}
              hooks={dataFunctions}
              minimum={facetDefinition.range?.minimum}
              maximum={facetDefinition.range?.maximum}
              showSettings={showPercent}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
            />
          ),
          exact: (
            <ExactValueFacet
              key={`${idPrefix}-exact-${field}`}
              field={field}
              facetName={facetLabel}
              description={description}
              hideIfEmpty={hideIfEmpty}
              width={width}
              hooks={dataFunctions}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
            />
          ),
          multiselect: (
            <MultiSelectValueFacet
              key={`${idPrefix}-exact-${field}`}
              field={field}
              facetName={facetLabel}
              description={description}
              hideIfEmpty={hideIfEmpty}
              width={width}
              hooks={dataFunctions}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
            />
          ),
        }[type as string]
      }
    </div>
  );
};
