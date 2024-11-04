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

  const chart = createChart(chartType, {
    data: EnumFacetToHistogramArray(data),
    total: 1,
    valueType: 'count',
  });

  return (
    <div className="flex flex-col bg-base-max relative border-base border-1 rounded-b-md transition">
      <div className="flex justify-between px-4 py-2 bg-base-lightest border-b-1 border-base">
        <Text size="sm" fw={600}>
          {facetName}
        </Text>
        {showTotals ? <Text>Todo</Text> : null}
      </div>
      <div className="px-4 pb-4 pt-8">{chart}</div>
      <FacetPanelDataHeader label={facetName} valueLabel={valueLabel} />
      <div className="p-4 pt-2 pb-2">
        <FacetEnumList
          field={field}
          valueLabel={valueLabel}
          hooks={hooks}
          showSorting={false}
        />
      </div>
    </div>
  );
};

export default EnumFacetPanel;
