import { CellRenderFunctionProps, ReactECharts, ReactEChartsProps } from '@gen3/frontend';
import { Button, Popover, Text } from '@mantine/core';
import { isArray } from 'lodash';
import { useDeepCompareMemo } from 'use-deep-compare';
import { useDisclosure } from '@mantine/hooks';

interface ManifestItem {
  md5sum: string;
  file_name: string;
  file_size?: number;
  object_id: string;
  commons_name?: string;
}

interface BarChartData {
  value: number;
  name: string;
}


const countTypes = (data: Array<ManifestItem>) : BarChartData[] => {
  const counts : Record<string, number> = {};
  data.forEach((item: ManifestItem) => {
    const filetype = item.file_name.split('.').pop();
    if (!filetype) return;
    counts[filetype] = counts[filetype] ? counts[filetype] + 1 : 1;
  });
  const total = Object.values(counts).reduce((acc, val) => acc + val, 0);
  return Object.entries(counts).map(([name, value]) => ({ name, value: Number(((value/total) * 100).toFixed(2)) }));
}

export const Filemap = (
  { value }: CellRenderFunctionProps ) => {
  const [opened, { close, open }] = useDisclosure(false);
  const chartDefinition = useDeepCompareMemo(() : ReactEChartsProps['option'] | undefined => {

    if (value === undefined || value === null ||!isArray(value) || value.length === 0) {
      return undefined;
    }

    const data = countTypes(value[0]);

    return {
      grid: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      },
      xAxis: {
        type: 'value',
        show: false
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        show: false
      },
      series: data.map((d, index) => ({
        type: 'bar',
        stack: 'total',
        barWidth: 40,
        name: d.name,
        data: [d.value],
        label: {
          show: true,
          position: 'top',
          minMargin: 8,
          formatter: '{a} - {c}%'
        },
        labelLine: {
          show: true,
        },
        labelLayout: (params) =>{
          return {
            y: "35%",
            moveOverlap: 'shiftX'
          };
        },
      }))
    }; }, [value]);

  if (!chartDefinition) {
    return (<Text>n/a</Text>);
  }
  return (<Popover  position="left-start" withArrow shadow="md" opened={opened}>
    <Popover.Target>
      <Text onMouseEnter={open} onMouseLeave={close}>
        {value[0].length} files
      </Text>
    </Popover.Target>
    <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
      <div style={{ width: 380}}>
      <ReactECharts option={chartDefinition} />
      </div>
    </Popover.Dropdown>
  </Popover>);
  /*
  return (
    <div>

      <ReactECharts option={chartDefinition} />
    </div>

    );
*/
  };
