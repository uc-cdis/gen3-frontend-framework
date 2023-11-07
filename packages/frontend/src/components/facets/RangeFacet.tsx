import React, { useCallback } from 'react';
import { MdClose as CloseIcon } from 'react-icons/md';
import { FromToRangeValues } from './types';
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
  FacetHooks,
  GetRangeFacetDataFunction,
  GetTotalCountsFunction,
  UpdateFacetFilterHook,
} from './types';

import { fieldNameToTitle, Intersection } from '@gen3/core';

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




export interface RangeFacetHooks extends FacetHooks {
  useUpdateFacetFilters: UpdateFacetFilterHook;
  useGetFacetData: GetRangeFacetDataFunction;
  useTotalCounts: GetTotalCountsFunction;
}

export interface RangeFacetCardProps extends FacetCardProps<RangeFacetHooks> {
  minimum?: number;
  maximum?: number;
}

const RangeFacet: React.FC<RangeFacetCardProps> = ({
  field,
  dataHooks,
  valueLabel,
  description,
  facetName,
  minimum = DEFAULT_MINIMUM,
  maximum = DEFAULT_MAXIMUM,
  showPercent = true,
  hideIfEmpty = true,
  showSearch = true,
  showFlip = true,
  startShowingData = true,
  dismissCallback = undefined,
  width = undefined,
  header = {
    Panel: FacetHeader,
    Label: FacetText,
    iconStyle: controlsIconStyle,
  },
}) => {
  const { data, rangeFilters, isSuccess } = dataHooks.useGetFacetData(field);
  const [minMaxValue, setMinMaxValue] = React.useState<
    FromToRangeValues<number>
  >({
    from: minimum,
    to: maximum,
  });

  const clearRangeFilterFromCohort = dataHooks.useClearFilter();
  const clearFilters = useCallback(() => {
    setMinMaxValue({
      from: minimum,
      to: maximum,
    });
    clearRangeFilterFromCohort(field);
  }, [clearRangeFilterFromCohort, field, maximum, minimum]);

  const updateRangeFilter = dataHooks.useUpdateFacetFilters();
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

  return (
    <div
      className={`flex flex-col ${
        width ? width : 'mx-1'
      } bg-base-max relative shadow-lg border-base-lighter border-1 rounded-b-md text-xs transition`}
      id={field}
    >
      <div>
        <header.Panel>
          <Tooltip
            label={description}
            position="bottom-start"
            multiline
            width={220}
            withArrow
            disabled={!description}
          >
            <header.Label>
              {facetName ? facetName : fieldNameToTitle(field)}
            </header.Label>
          </Tooltip>
          <div className="flex flex-row">
            <FacetIconButton
              onClick={() => clearFilters()}
              aria-label="clear selection"
            >
              <UndoIcon size="1.25em" className={header.iconStyle} />
            </FacetIconButton>
            {dismissCallback ? (
              <FacetIconButton
                onClick={() => {
                  clearFilters();
                  dismissCallback(field);
                }}
                aria-label="Remove the facet"
              >
                <CloseIcon size="1.25em" className={header.iconStyle} />
              </FacetIconButton>
            ) : null}
          </div>
        </header.Panel>
      </div>
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
                onChange={(value : number | '') => {
                  updateFilters(
                    value === '' ? minimum : value,
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
                type="number"
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
                {isSuccess && data && Object.values(data).length > 0 ?  Object.values(data)[0] : '...'}
              </div>
            </div>

            <RangeSlider
              mt="md"
              color="blue"
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
  );
};

export default RangeFacet;
