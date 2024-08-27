import React, { useState, useMemo } from 'react';
import { EnumFacetResponse, FacetCardProps, FacetDataHooks } from './types';
import { ActionIcon, Group, MultiSelect, Tooltip } from '@mantine/core';
import {
  controlsIconStyle,
  FacetIconButton,
  FacetText,
  FacetHeader,
} from './components';
import { MdClose as CloseIcon } from 'react-icons/md';
import { FaUndo as UndoIcon, FaPlus as PlusIcon } from 'react-icons/fa';
import {
  Operation,
  Excludes,
  Includes,
  trimFirstFieldNameToTitle,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';

type ExactValueProps = Omit<
  FacetCardProps<FacetDataHooks>,
  'showSearch' | 'showFlip' | 'showPercent' | 'valueLabel'
>;

const instanceOfIncludesExcludes = (op: Operation): op is Includes | Excludes =>
  ['in'].includes(op.operator); // TODO: Guppy does not support excludes

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
 * @category Facets
 */
const MultiSelectValueFacet: React.FC<ExactValueProps> = ({
  field,
  description,
  facetName = undefined,
  dismissCallback = undefined,
  width = undefined,
  dataHooks,
}: ExactValueProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]); // Handle the state of the TextInput
  const clearFilters = dataHooks.useClearFilter();
  const updateFacetFilters = dataHooks.useUpdateFacetFilters();
  const facetTitle = facetName
    ? facetName
    : trimFirstFieldNameToTitle(field, true);
  const facetValue = dataHooks.useGetFacetFilters(field);
  const facetDataValues = dataHooks.useGetFacetData(field) as EnumFacetResponse;

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
    if (!facetValue) {
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
      if (values.length > 0) {
        if (facetValue && instanceOfIncludesExcludes(facetValue)) {
          // updating facet value
          updateFacetFilters(field, {
            ...facetValue,
            operands: values,
          });
        }
        if (facetValue === undefined) {
          // TODO: Assuming Includes by default but this might change to Include|Excludes
          updateFacetFilters(field, {
            operator: 'in',
            field: field,
            operands: values,
          });
        }
      }
      // no values remove the filter
      else {
        clearFilters(field);
      }
    };

    setValues(selectedValues);
  }, [selectedValues]);

  return (
    <div
      className={`flex flex-col ${
        width ? width : 'mx-0'
      } bg-base-max relative border-base-lighter border-1 rounded-b-md text-xs transition`}
    >
      <FacetHeader>
        <Tooltip
          disabled={!description}
          label={description}
          position="bottom-start"
          multiline
          w={220}
          withArrow
          transitionProps={{ duration: 200, transition: 'fade' }}
        >
          <FacetText>{facetTitle}</FacetText>
        </Tooltip>
        <div className="flex flex-row">
          <Tooltip label="Clear selection">
            <FacetIconButton
              onClick={() => setSelectedValues([])}
              aria-label="clear selection"
            >
              <UndoIcon size="1.15em" className={controlsIconStyle} />
            </FacetIconButton>
          </Tooltip>
          {dismissCallback && (
            <Tooltip label="Remove the facet">
              <FacetIconButton
                onClick={() => {
                  dismissCallback(field);
                }}
                aria-label="Remove the facet"
              >
                <CloseIcon size="1.25em" className={controlsIconStyle} />
              </FacetIconButton>
            </Tooltip>
          )}
        </div>
      </FacetHeader>
      <div className="flex flex-nowrap items-center p-2">
        <MultiSelect
          data-testid="multiselect-add-filter-value"
          size="sm"
          placeholder={`Enter ${facetTitle}`}
          classNames={{ root: 'grow', input: 'border-r-0 rounded-r-none py-1' }}
          aria-label="enter value to add filter"
          value={selectedValues}
          onChange={setSelectedValues}
          data={dataValues}
          searchable
          maxDropdownHeight={200}
        />
      </div>
    </div>
  );
};

export default MultiSelectValueFacet;
