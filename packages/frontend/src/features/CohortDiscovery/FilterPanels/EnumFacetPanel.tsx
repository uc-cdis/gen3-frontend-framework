import React, { useCallback, useMemo, useState } from 'react';
import { Text } from '@mantine/core';
import {
  EnumFacetDataChangedFunction,
  FacetDataHooks,
  GetEnumFacetDataFunction,
} from '../../../components/facets';
import { createChart } from '../../../components/charts/createChart';
import { FacetDefinition, fieldNameToTitle, HistogramData } from '@gen3/core';
import FacetEnumList from '../../../components/facets/FacetEnumList';

export interface EnumFacetPanelDataHooks extends FacetDataHooks {
  useGetFacetData: GetEnumFacetDataFunction;
  updateVisibleValues?: EnumFacetDataChangedFunction;
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

  const [visibleData, setVisibleData] = useState<HistogramData[]>([]);

  const updateVisibleItems = useCallback(
    (data: Array<[string | number, number]>) => {
      setVisibleData(
        data.reduce((acc, elm) => {
          acc.push({ key: String(elm[0]), count: elm[1] });
          return acc;
        }, [] as HistogramData[]),
      );
    },
    [],
  );

  const facetName = useMemo(
    () => label ?? fieldNameToTitle(field),
    [label, field],
  );
  //const { data } = hooks.useGetFacetData(field);

  const chart = createChart(chartType, {
    data: visibleData,
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
      <div className="p-4 pt-2 pb-2">
        <FacetEnumList
          field={field}
          valueLabel={valueLabel}
          hooks={{ ...hooks, updateVisibleValues: updateVisibleItems }}
          showSorting={true}
        />
      </div>
    </div>
  );
};

export default EnumFacetPanel;
