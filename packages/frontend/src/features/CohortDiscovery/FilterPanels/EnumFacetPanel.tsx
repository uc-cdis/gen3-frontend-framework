import React, { useMemo } from 'react';
import { Text } from '@mantine/core';
import {
  FacetDataHooks,
  GetEnumFacetDataFunction,
} from '../../../components/facets';
import { createChart } from '../../../components/charts/createChart';
import { EnumFacetToHistogramArray } from '../utils';
import FacetPanelDataHeader from './FacetPanelDataHeader';
import { FacetDefinition, fieldNameToTitle } from '@gen3/core';
import FacetEnumList from '../../../components/facets/FacetEnumList';

export interface EnumFacetPanelDataHooks extends FacetDataHooks {
  useGetFacetData: GetEnumFacetDataFunction;
}

interface EnumFacetPanelProps {
  facet: FacetDefinition;
  valueLabel: string;
  hooks: EnumFacetPanelDataHooks;
  showTotals?: boolean;
  chartType?: string;
}

const EnumFacetPanel: React.FC<EnumFacetPanelProps> = ({
  facet,
  hooks,
  valueLabel,
  showTotals = false,
  chartType = 'bar',
}) => {
  const { field, label } = facet;
  const facetName = useMemo(
    () => label ?? fieldNameToTitle(field),
    [label, field],
  );
  const { data } = hooks.useGetFacetData(field);

  return (
    <div className="flex flex-col bg-base-max relative border-base-light border-1 rounded-b-md transition">
      <div className="flex justify-between px-8 py-4 bg-base-light border-b-1 border-base">
        <Text>{facetName}</Text>
        {showTotals ? <Text>Todo</Text> : null}
      </div>
      <div>
        {createChart(chartType, {
          data: EnumFacetToHistogramArray(data),
          total: 1,
          valueType: 'count',
        })}
      </div>
      <FacetPanelDataHeader label={facetName} valueLabel={valueLabel} />
      <FacetEnumList
        field={field}
        valueLabel={valueLabel}
        hooks={hooks}
        showSorting={false}
      />
    </div>
  );
};

export default EnumFacetPanel;
