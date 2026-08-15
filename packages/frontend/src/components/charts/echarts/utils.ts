import { registerTheme } from 'echarts';

export const filterMissing = (facetData: any) =>
  facetData.filter((d: any) => d.key !== '_missing');

export const chartColors = [
  '#0173B2',
  '#DE8F05',
  '#029E73',
  '#CC78BC',
  '#CA9161',
  '#949494',
  '#ECE133',
  '#56B4E9',
  '#D55E00',
  '#F0E442',
];

export const registerEchartsTheme = () => {
  const defaultTheme = {
    color: chartColors,
    backgroundColor: '#ffffff',
    textStyle: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 12,
    },
  };

  // 2) Register it once at app startup
  registerTheme('gen3', defaultTheme);
};
