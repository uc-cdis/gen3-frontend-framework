import React, { useCallback } from 'react';
import { MdClose as CloseIcon } from 'react-icons/md';
import { FacetCommonHooks, FromToRangeValues } from './types';
import { FaUndo as UndoIcon } from 'react-icons/fa';
import { DEFAULT_MAXIMUM, DEFAULT_MINIMUM } from './constants';

import {
  NumberInput,
  Text,
  LoadingOverlay,
  RangeSlider,
  Tooltip,
} from '@mantine/core';
import {
  FacetHeader,
  FacetText,
  controlsIconStyle,
  FacetIconButton,
} from './components';

import {
  FacetCardProps,
  GetRangeFacetDataFunction,
  GetTotalCountsFunction,
  UpdateFacetFilterHook,
} from './types';

import { fieldNameToTitle, Intersection } from '@gen3/core';
import FacetControlsHeader from './FacetControlsHeader';

const createBucket = (
  field: string,
  lower: number,
  upper: number,
): Intersection => ({
  operator: 'and',
  operands: [
    {
      field,
      operator: '>=',
      operand: lower,
    },
    {
      field,
      operator: '<=',
      operand: upper,
    },
  ],
});

export interface RangeFacetHooks extends FacetCommonHooks {
  useUpdateFacetFilters: UpdateFacetFilterHook;
  useGetFacetData: GetRangeFacetDataFunction;
}

export interface RangeFacetCardProps extends FacetCardProps<RangeFacetHooks> {
  minimum?: number;
  maximum?: number;
}

const RangeFacet = ({
  field,
  hooks,
  valueLabel,
  description,
  facetName,
  minimum = DEFAULT_MINIMUM,
  maximum = DEFAULT_MAXIMUM,
  showSearch = true,
  showFlip = true,
  dismissCallback = undefined,
  width = undefined,
  header = {
    Panel: FacetHeader,
    Label: FacetText,
    iconStyle: controlsIconStyle,
  },
}: RangeFacetCardProps) => {
  const { data, rangeFilters, isSuccess } = hooks.useGetFacetData(field);
  const [minMaxValue, setMinMaxValue] = React.useState<
    FromToRangeValues<number>
  >({
    from: minimum,
    to: maximum,
  });

  const clearRangeFilterFromCohort = hooks.useClearFilter();
  const clearFilters = useCallback(() => {
    setMinMaxValue({
      from: minimum,
      to: maximum,
    });
    clearRangeFilterFromCohort(field);
  }, [clearRangeFilterFromCohort, field, maximum, minimum]);

  const updateRangeFilter = hooks.useUpdateFacetFilters();
  const updateFilters = useCallback(
    (from: number, to: number) => {
      updateRangeFilter(field, createBucket(field, from, to));
      setMinMaxValue({
        from: from,
        to: to,
      });
    },
    [field, updateRangeFilter],
  );

  const isFilterExpanded =
    hooks.useFilterExpanded && hooks.useFilterExpanded(field);
  const showFilters = isFilterExpanded === undefined || isFilterExpanded;

  return (
    <div
      className={`flex flex-col ${
        width ? width : 'mx-1'
      } bg-base-max relative shadow-lg border-base-lighter border-1 rounded-b-md text-xs transition`}
      id={field}
    >
      <FacetControlsHeader
        field={field}
        description={description}
        hooks={hooks}
        facetName={facetName}
        showSearch={showSearch}
        showFlip={showFlip}
        dismissCallback={dismissCallback}
        header={header}
      />
      <div className="card-face bg-base-max">
        <div className="overflow-hidden px-3.5 h-auto">
          <LoadingOverlay visible={!isSuccess} />
          <div className="flex flex-col gap-y-2 pb-2">
            <div className="flex gap-x-4 items-center">
              <NumberInput
                label="Min"
                placeholder="min"
                size="sm"
                value={rangeFilters ? rangeFilters.from : minMaxValue.from}
                onChange={(value: number | string) => {
                  updateFilters(
                    value === '' ? minimum : (value as any),
                    minMaxValue.to ?? DEFAULT_MAXIMUM,
                  );
                }}
              />
              <Text size="xl" className="mt-4">
                -
              </Text>
              <NumberInput
                label="Max"
                placeholder="max"
                size="sm"
                value={rangeFilters ? rangeFilters.to : minMaxValue.to}
                onChange={(value) => {
                  updateFilters(
                    minMaxValue.from ?? minimum,
                    value ? Number(value) : maximum,
                  );
                }}
              />
              <div className="bg-gray mt-4 border-1">
                {isSuccess && data && Object.values(data).length > 0
                  ? Object.values(data)[0]
                  : '...'}
              </div>
            </div>
            <div
              className={showFilters ? 'h-full' : 'h-0 invisible'}
              aria-hidden={!showFilters}
            >
              <RangeSlider
                mt="md"
                color="accent.5"
                thumbSize={20}
                value={[minMaxValue.from ?? minimum, minMaxValue.to ?? maximum]}
                min={minimum}
                max={maximum}
                onChange={(value) => {
                  updateFilters(value[0], value[1]);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RangeFacet;
