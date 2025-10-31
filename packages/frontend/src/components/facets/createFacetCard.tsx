import React from 'react';
import {
  EnumChartProps,
  EnumFacetDataHooks,
  FacetHooks,
  QueryOptions,
  ToggleFacetDataHooks,
  UploadFacetDataHooks,
} from './types';
import EnumFacet from './EnumFacet';
import RangeFacet from './RangeFacet';
import ToggleFacet from './ToggleFacet';
import MultiSelectValueFacet from './MultiSelectValueFacet';
import ExactValueFacet from './ExactValueFacet';
import { FacetDefinition } from '@gen3/core';
import UploadFacet from './UploadFacet';
import NumericRangeFacet from './NumericRangeFacet';

export interface CreateFacetCardProps {
  facetDefinition: FacetDefinition;
  hooks: FacetHooks;
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
              hooks={dataFunctions as EnumFacetDataHooks}
              showPercent={showPercent}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
              moveValuesToBottom={facetDefinition?.moveValuesToBottom ?? []}
              excludeValues={facetDefinition?.excludeValues ?? []}
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
          age: (
            <NumericRangeFacet
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
              rangeDatatype="age"
            />
          ),
          age_in_years: (
            <NumericRangeFacet
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
              rangeDatatype="age_in_years"
            />
          ),
          years: (
            <NumericRangeFacet
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
              rangeDatatype="years"
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
              key={`${idPrefix}-multiselect-${field}`}
              field={field}
              facetName={facetLabel}
              description={description}
              hideIfEmpty={hideIfEmpty}
              width={width}
              hooks={dataFunctions}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
            />
          ),
          upload: (
            <UploadFacet
              key={`${idPrefix}-upload-${field}`}
              field={field}
              valueLabel={valueTypeLabel}
              hooks={dataFunctions as UploadFacetDataHooks}
            />
          ),
          toggle: (
            <ToggleFacet
              key={`${idPrefix}-toggle-${field}`}
              field={field}
              valueLabel={valueTypeLabel}
              hideIfEmpty={hideIfEmpty}
              showPercent={showPercent}
              hooks={{
                ...(dataFunctions as ToggleFacetDataHooks),
              }}
              facetName={facetLabel}
              description={description}
            />
          ),
        }[type as string]
      }
    </div>
  );
};
