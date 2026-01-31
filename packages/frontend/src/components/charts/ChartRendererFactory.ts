import { RenderFactoryTypedInstance } from '../../utils/RendererFactory';
import { ChartProps } from './types';
import BarChart from './echarts/BarChart';
import PieChart from './echarts/PieChart';
import DonutChart from './echarts/DonutChart';
import HorizontalBarChart from './echarts/HorizontalBarChart';
import VerticalBarChart from './echarts/VerticalBarChart';
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

let instance: RenderFactoryTypedInstance<ChartProps> | undefined = undefined;

const ChartRendererFactory = (): RenderFactoryTypedInstance<ChartProps> => {
  if (!instance) {
    instance = new RenderFactoryTypedInstance<ChartProps>();
    instance.registerRendererCatalog(DefaultChartCatalog);
    registerEchartsTheme();
  }
  return instance;
};

export default ChartRendererFactory;
