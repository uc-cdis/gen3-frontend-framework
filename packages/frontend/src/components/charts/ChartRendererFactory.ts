import { RenderFactoryTypedInstance } from '../../utils/RendererFactory';
import { ChartProps, MultitrackChartProps } from './types';
import BarChart from './echarts/BarChart';
import PieChart from './echarts/PieChart';
import DonutChart from './echarts/DonutChart';
import HorizontalBarChart from './echarts/HorizontalBarChart';
import VerticalBarChart from './echarts/VerticalBarChart';
import MultiTrackHorizontalBarChart from './echarts/MultiTrackHorizontalBarChart';
import { registerEchartsTheme } from './echarts/utils';

const DefaultChartCatalog = {
  chart: {
    bar: BarChart,
    horizontalStacked: HorizontalBarChart,
    fullPie: PieChart,
    donut: DonutChart,
    verticalBarChart: VerticalBarChart,
  },
};

const DefaultMultitrackChartCatalog = {
  chart: {
    multiTrackHorizontalBar: MultiTrackHorizontalBarChart,
  },
};

let instance: RenderFactoryTypedInstance<ChartProps> | undefined = undefined;
let multitrackInstance:
  | RenderFactoryTypedInstance<MultitrackChartProps>
  | undefined = undefined;

const ChartRendererFactory = (): RenderFactoryTypedInstance<ChartProps> => {
  if (!instance) {
    instance = new RenderFactoryTypedInstance<ChartProps>();
    instance.registerRendererCatalog(DefaultChartCatalog);
    registerEchartsTheme();
  }
  return instance;
};

export const MultitrackChartRendererFactory =
  (): RenderFactoryTypedInstance<MultitrackChartProps> => {
    if (!multitrackInstance) {
      multitrackInstance =
        new RenderFactoryTypedInstance<MultitrackChartProps>();
      multitrackInstance.registerRendererCatalog(DefaultMultitrackChartCatalog);
    }
    return multitrackInstance;
  };

export default ChartRendererFactory;
