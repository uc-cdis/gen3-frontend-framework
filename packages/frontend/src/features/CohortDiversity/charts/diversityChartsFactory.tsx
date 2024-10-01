import { RenderFactoryTypedInstance } from '../../../utils/RendererFactory';
import BarComparison from './BarComparison';
import { ComparisonChartProps } from './types';

let instance: RenderFactoryTypedInstance<ComparisonChartProps> | undefined =
  undefined;

const DefaultComparisonChart = () => {
  return <div>Chart not configured</div>;
};

const DefaultRendererCatalog = {
  comparison: {
    default: DefaultComparisonChart,
    barComparison: BarComparison,
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
