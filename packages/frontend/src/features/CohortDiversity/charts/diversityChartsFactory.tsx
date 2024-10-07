import { RenderFactoryTypedInstance } from '../../../utils/RendererFactory';
import BarComparison from './BarComparison';
import { ComparisonChartProps } from './types';
import HeatmapComparison from './HeatmapComparison';
import RadarComparison from './RadarComparison';

let instance: RenderFactoryTypedInstance<ComparisonChartProps> | undefined =
  undefined;

const DefaultComparisonChart = () => {
  return <div>Chart not configured</div>;
};

const DefaultRendererCatalog = {
  comparison: {
    default: DefaultComparisonChart,
    barComparison: BarComparison,
    heatmapComparison: HeatmapComparison,
    radarComparison: RadarComparison,
  },
};

const DiversityChartsFactory =
  (): RenderFactoryTypedInstance<ComparisonChartProps> => {
    if (!instance) {
      instance = new RenderFactoryTypedInstance<ComparisonChartProps>();
      instance.registerRendererCatalog(DefaultRendererCatalog);
    }
    return instance;
  };

export default DiversityChartsFactory;
