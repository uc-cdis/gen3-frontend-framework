import React from 'react';
import { Pagination, Table } from '@mantine/core';
import { createLabelFromHistogramData } from '../utils';
import { ChartProps } from '../types';
import ReactECharts, { ReactEChartsProps } from './ReactECharts';
import { HistogramData, HistogramDataArray } from '@gen3/core';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { isArray } from 'lodash';
import { useDeepCompareMemo } from 'use-deep-compare';
import { filterMissing } from './utils';

// Colors aligned to facet bins by index (dataIndex).
const BIN_COLORS: string[] = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

type BarItem = {
  name: string;
  value: number;
  itemStyle: { color: string };
};

interface VerticalBarChartData {
  items: BarItem[];
  categories: string[];
}

const ExtractDataCount = (
  d: HistogramData,
  _: number | undefined = undefined,
): number => d.count;

const ExtractDataPercent = (d: HistogramData, total?: number): number =>
  total
    ? Math.round(((d.count / total) * 100.0 + Number.EPSILON) * 100) / 100
    : 0;

const processChartData = (
  facetData: HistogramDataArray,
  valueType = 'count',
  total?: number,
  colors: string[] = BIN_COLORS,
): VerticalBarChartData => {
  if (!facetData) {
    return {
      items: [],
      categories: [],
    };
  }

  const data = filterMissing(facetData);
  const dataExtractor =
    valueType === 'count' ? ExtractDataCount : ExtractDataPercent;

  const categories = data.map((d: HistogramData) =>
    createLabelFromHistogramData(d),
  );

  const items: BarItem[] = data.map((d: HistogramData, idx: number) => {
    const name = createLabelFromHistogramData(d);
    const value = dataExtractor(d, total);
    const color = colors[idx % Math.max(colors.length, 1)] ?? '#999999';

    return {
      name,
      value,
      itemStyle: { color },
    };
  });

  return { items, categories };
};

const VerticalBarChart = ({
  data,
  valueType,
  total,
  showLegendInChart = true,
}: ChartProps) => {
  const chartData = useDeepCompareMemo(
    () => processChartData(data, valueType, total),
    [data, valueType, total],
  );

  const [hiddenItems, setHiddenItems] = React.useState<Set<string>>(
    () => new Set(),
  );

  const toggleLegendItem = (name: string) => {
    setHiddenItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const visibleItems = useDeepCompareMemo(() => {
    return chartData.items.map((item) =>
      hiddenItems.has(item.name) ? { ...item, value: null } : item,
    );
  }, [chartData.items, hiddenItems]);

  const [page, setPage] = React.useState(1);
  const pageSize = 6;

  const pageCount = Math.max(1, Math.ceil(chartData.items.length / pageSize));

  const pagedItems = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return chartData.items.slice(start, start + pageSize);
  }, [chartData.items, page, pageSize]);

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const chartDefinition =
    useDeepCompareMemo((): ReactEChartsProps['option'] => {
      return {
        tooltip: {
          trigger: 'item',
          confine: true,
          formatter: function (param) {
            const p: CallbackDataParams =
              isArray(param) && param.length > 0
                ? param[0]
                : (param as CallbackDataParams);

            const colorSquare = `<span style="display:inline-block; width:10px; height:10px; background-color:${p.color}; margin-right:5px;"></span>`;
            return `${colorSquare}${p.name}: <b>${p.value}</b>`;
          },
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        grid: {
          left: '0%',
          right: '3%',
          bottom: '25%',
          containLabel: true,
          height: '80%',
        },
        yAxis: [
          {
            type: 'value',
            max: 'dataMax',
            axisLine: {
              lineStyle: {
                color: '--mantine-color-base-9',
              },
            },
          },
        ],
        xAxis: [
          {
            type: 'category',
            data: chartData.categories,
            axisTick: { alignWithLabel: true },
          },
        ],
        dataZoom: [
          {
            xAxisIndex: [0],
            filterMode: 'filter',
            type: 'slider',
          },
          {
            show: false,
            yAxisIndex: 0,
            filterMode: 'filter',
          },
        ],
        series: [
          {
            type: 'bar',
            data: visibleItems,
            barMinWidth: 2,
            barCategoryGap: '10%',
            emphasis: { focus: 'series' },
            label: { show: false },
          },
        ],
      };
    }, [chartData.categories, visibleItems]);

  return (
    <div className="w-full h-64 flex gap-4">
      <div className="flex-1 min-w-0">
        <ReactECharts
          option={chartDefinition}
          settings={{
            notMerge: true,
            lazyUpdate: false,
          }}
        />
      </div>

      {showLegendInChart && (
        <div className="overflow-hidden flex flex-col">
          <div className="text-md font-bold mb-2">Legend</div>

          <div className="border overflow-hidden">
            <Table striped highlightOnHover withRowBorders={true}>
              <Table.Tbody>
                {pagedItems.map((item) => {
                  const isHidden = hiddenItems.has(item.name);
                  return (
                    <Table.Tr key={item.name}>
                      <Table.Td>
                        <button
                          type="button"
                          onClick={() => toggleLegendItem(item.name)}
                          title={isHidden ? 'Show bar' : 'Hide bar'}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="inline-block h-3 w-3 rounded-sm"
                            style={{
                              backgroundColor: item.itemStyle.color,
                              opacity: isHidden ? 0.3 : 1,
                            }}
                          />
                          <span className="sr-only">{item.name}</span>
                        </button>
                      </Table.Td>
                      <Table.Td>
                        <button
                          type="button"
                          onClick={() => toggleLegendItem(item.name)}
                          className={isHidden ? 'line-through opacity-60' : ''}
                        >
                          {item.name}
                        </button>
                      </Table.Td>
                      <Table.Td className="text-right">
                        {isHidden ? '—' : item.value}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <Pagination
              value={page}
              onChange={setPage}
              total={pageCount}
              size="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VerticalBarChart;
