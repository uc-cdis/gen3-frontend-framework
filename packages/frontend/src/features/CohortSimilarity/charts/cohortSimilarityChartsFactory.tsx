import React from 'react';
import { RenderFactoryTypedInstance } from '../../../utils/RendererFactory';
import BarComparison from './BarComparison';
import { ComparisonChartProps } from './types';
import RadarComparison from './RadarComparison';

let instance: RenderFactoryTypedInstance<ComparisonChartProps> | undefined =
  undefined;

export const DefaultComparisonChart = () => {
  return <div>Chart not configured</div>;
};

const DefaultRendererCatalog = {
  comparison: {
    default: DefaultComparisonChart,
    barComparison: BarComparison,
    radarComparison: RadarComparison,
  },
};

const CohortSimilarityChartsFactory =
  (): RenderFactoryTypedInstance<ComparisonChartProps> => {
    if (!instance) {
      instance = new RenderFactoryTypedInstance<ComparisonChartProps>();
      instance.registerRendererCatalog(DefaultRendererCatalog);
    }
    return instance;
  };

export default CohortSimilarityChartsFactory;
