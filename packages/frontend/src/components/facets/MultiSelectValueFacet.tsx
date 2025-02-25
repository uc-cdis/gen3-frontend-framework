import React, { useState, useMemo, useCallback } from 'react';
import { EnumFacetResponse, FacetCardProps, FacetDataHooks } from './types';
import { MultiSelect } from '@mantine/core';
import { controlsIconStyle, FacetText, FacetHeader } from './components';
import {
  Operation,
  Excludes,
  Includes,
  trimFirstFieldNameToTitle,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { updateFacetEnum } from './utils';
import FacetControlsHeader from './FacetControlsHeader';

type ExactValueProps = Omit<
  FacetCardProps<FacetDataHooks>,
  'showSearch' | 'showFlip' | 'showPercent' | 'valueLabel'
>;

const instanceOfIncludesExcludes = (op: Operation): op is Includes | Excludes =>
  ['in'].includes(op.operator); // TODO: Guppy does not support excludes

interface OperandsObject {
  operands: unknown[];
}

const isOperandsObject = (obj: unknown): obj is OperandsObject => {
  return (
    !!obj && // Ensure obj is not null or undefined
    typeof obj === 'object' &&
    'operands' in obj &&
    Array.isArray((obj as OperandsObject).operands)
  );
};

const isFacetEmpty = (op: object | null): boolean => {
  return isOperandsObject(op) && op.operands.length === 0;
};

/**
 * Extracts the operands if the operation isIncludes or Excludes. Returns an empty Array
 * if filter is not the correct type.
 * @param operation - filters to extract values from
 */
const extractValues = (
  operation?: Operation,
): ReadonlyArray<string | number> => {
  if (operation && instanceOfIncludesExcludes(operation)) {
    return operation.operands;
  }
  return [] as ReadonlyArray<string>;
};

/**
 * Exact value facet component
 * @param field - field to facet on
 * @param description - description of the facet
 * @param facetName - name of the facet
 * @param dismissCallback - callback function to dismiss the facet
 * @param width - width of the facet
 * @param hooks - hooks to use for the facet
 * @param header - header components
 * @category Facets
 */
const MultiSelectValueFacet: React.FC<ExactValueProps> = ({
  field,
  description,
  facetName = undefined,
  dismissCallback = undefined,
  width = undefined,
  hooks,
  header = {
    Panel: FacetHeader,
    Label: FacetText,
    iconStyle: controlsIconStyle,
  },
}: ExactValueProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]); // Handle the state of the TextInput
  const clearFilters = hooks.useClearFilter();
  const updateFacetFilters = hooks.useUpdateFacetFilters();
  const facetTitle = facetName
    ? facetName
    : trimFirstFieldNameToTitle(field, true);
  const facetValue = hooks.useGetFacetFilters(field);
  const facetDataValues = hooks.useGetFacetData(field) as EnumFacetResponse;
  const isFilterExpanded =
    hooks.useFilterExpanded && hooks.useFilterExpanded(field);
  const showFilters = isFilterExpanded === undefined || isFilterExpanded;

  const dataValues = useMemo(() => {
    if (facetDataValues?.data) {
      return Object.keys(facetDataValues.data).map((key) => {
        return {
          value: key,
          label: key,
        };
      });
    }
    return [];
  }, [facetDataValues?.data]);

  useDeepCompareEffect(() => {
    if (!facetValue || isFacetEmpty(facetValue)) {
      setSelectedValues([]);
    } else if (instanceOfIncludesExcludes(facetValue)) {
      const filters = facetValue.operands.map((x: number | string) =>
        x.toString(),
      );
      setSelectedValues(filters);
    }
  }, [facetValue]);

  useDeepCompareEffect(() => {
    const setValues = (values: string[]) => {
      updateFacetEnum(field, values, updateFacetFilters, clearFilters);
    };

    setValues(selectedValues);
  }, [selectedValues]);

  return (
    <div
      className={`flex flex-col ${
        width ? width : 'mx-0'
      } bg-base-max relative border-base-lighter border-1 rounded-b-md text-xs transition`}
    >
      <FacetControlsHeader
        field={field}
        description={description}
        hooks={hooks}
        facetName={facetName}
        dismissCallback={dismissCallback}
        header={header}
      />
      <div
        className={showFilters ? 'h-full' : 'h-0 invisible'}
        aria-hidden={!showFilters}
      >
        <div className="flex flex-nowrap items-center p-2">
          <MultiSelect
            data-testid="multiselect-add-filter-value"
            size="sm"
            placeholder={`Enter ${facetTitle}`}
            classNames={{
              root: 'grow',
              input: 'border-r-0 rounded-r-none py-1',
            }}
            comboboxProps={{ shadow: 'md' }}
            aria-label="enter value to add filter"
            value={selectedValues}
            onChange={updateFilters}
            searchable
            data={dataValues}
            limit={10}
            maxDropdownHeight={200}
            hidePickedOptions
            withScrollArea={false}
            mt="md"
          />
        </div>
      </div>
    </div>
  );
};

export default MultiSelectValueFacet;
