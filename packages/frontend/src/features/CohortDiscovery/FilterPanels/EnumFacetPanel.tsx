import React, { useRef, useState } from 'react';
import { Text } from '@mantine/core';
import { FacetCardProps } from '../../../components/facets';
import FacetEnumList from '../../../components/facets/FacetEnumList';
import { EnumFacetHooks } from '../../../components/facets/EnumFacet';
import { createChart } from '../../../components/charts/createChart';
import { AggregationsData, CoreState, useCoreSelector } from '@gen3/core';
import { EnumFacetToHistogramArray } from '../utils';
import { selectCountsForField } from '@gen3/core/dist/dts';

interface EnumFacetPanelProps extends FacetCardProps<EnumFacetHooks> {
  showTotals: boolean;
  chartType?: string;
  index: string;
}

const EnumFacetPanel: React.FC<EnumFacetPanelProps> = ({
  field,
  facetName,
  hooks,
  index,
  valueLabel,
  showTotals = false,
  chartType = 'bar',
}) => {
  const { data } = hooks.useGetFacetData(field);
  const counts = useCoreSelector((state: CoreState) =>
    selectCountsForField(state, index, field),
  );

  return (
    <div className="flex flex-col bg-base-max relative border-base-light border-1 rounded-b-md transition">
      <div className="flex justify-between px-8 py-4 bg-base-light border-b-1 border-base">
        <Text>{facetName}</Text>
        {showTotals ? <Text>Todo</Text> : null}
      </div>
      <div>
        {createChart(chartType, {
          data: EnumFacetToHistogramArray(data),
          total: counts ?? 1,
          valueType: 'count',
        })}
      </div>
    </div>
  );
};

export default EnumFacetPanel;
