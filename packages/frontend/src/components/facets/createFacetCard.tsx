import React from 'react';
import {
  EnumChartProps,
  EnumFacetDataHooks,
  FacetHooks,
  FacetValueLabel,
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

const getValueTypeLabel = (
  valueLabel: FacetValueLabel,
  facetDefinition: FacetDefinition,
  queryOptions?: QueryOptions,
): string => {
  // Facet definition's valueLabel takes precedence if defined
  if (facetDefinition?.valueLabel) {
    return facetDefinition.valueLabel;
  }

  // Handle undefined or string values directly
  if (valueLabel === undefined || typeof valueLabel === 'string') {
    return valueLabel;
  }

  // valueLabel is a function
  return valueLabel(facetDefinition, queryOptions);
};
export interface CreateFacetCardProps {
  facetDefinition: FacetDefinition;
  hooks: FacetHooks;
  idPrefix: string;
  valueLabel: FacetValueLabel;
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
  const valueTypeLabel = getValueTypeLabel(
    valueLabel,
    facetDefinition,
    queryOptions,
  );

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
              showSettings={facetDefinition?.showMatchModeSelector}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
              defaultSort={facetDefinition?.defaultSort}
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
              step={facetDefinition.range?.step}
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
              step={facetDefinition.range?.step}
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
              step={facetDefinition.range?.step}
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
              step={facetDefinition.range?.step}
              showSettings={showPercent}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
              rangeDatatype="years"
            />
          ),
          year: (
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
              step={facetDefinition.range?.step}
              showSettings={showPercent}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
              rangeDatatype="year"
            />
          ),
          days: (
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
              step={facetDefinition.range?.step}
              showSettings={showPercent}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
              rangeDatatype="days"
            />
          ),
          percent: (
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
              step={facetDefinition.range?.step}
              showSettings={showPercent}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
              rangeDatatype="percent"
            />
          ),
          numeric_range: (
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
              step={facetDefinition.range?.step}
              showSettings={showPercent}
              sharedWithIndices={facetDefinition?.sharedWithIndices}
              rangeDatatype="range"
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
