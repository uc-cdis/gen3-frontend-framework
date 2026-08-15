import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
  Loader,
  Menu,
  SegmentedControl,
  Tooltip,
} from '@mantine/core';
import { handleEChartsDownload } from '../../../components/charts/echarts/downloads';
import { getFormattedTimestamp } from '../../../utils/date';
import {
  DashboardDownloadContext,
  DownloadProgressContext,
} from '../../Analysis/context';
import { toDisplayName } from '../utils';
import { DisplayData } from '../types';
import { useDeepCompareMemo } from 'use-deep-compare';
import { DownloadIcon } from '../icons';
import BarChart from '../../../components/charts/echarts/BarChart';

const formatBarChartData = (
  data: DisplayData,
  yTotal: number,
  displayPercent: boolean,
) => {
  const mappedData = data.map(({ key, count }) => ({
    key,
    count: displayPercent ? (count / yTotal) * 100 : count,
    yTotal,
  }));

  return mappedData;
};

interface HistogramProps {
  data: DisplayData;
  yTotal: number;
  isFetching: boolean;
  noData: boolean;
  field: string;
  hideYTicks?: boolean;
  initiallyDisplayPercent?: boolean;
  color: string;
  unitLabel: string;
}

const CDaveHistogram: React.FC<Readonly<HistogramProps>> = ({
  data,
  yTotal,
  isFetching,
  field,
  noData,
  hideYTicks = false,
  initiallyDisplayPercent = false,
  color,
  unitLabel,
}: HistogramProps) => {
  const downloadChartRef = useRef<HTMLDivElement>(null!);
  const { downloadInProgress, setDownloadInProgress } = useContext(
    DownloadProgressContext,
  );
  const [displayType, setDisplayType] = useState<'counts' | 'percent'>(
    initiallyDisplayPercent ? 'percent' : 'counts',
  );

  const barChartData = useDeepCompareMemo(
    () => formatBarChartData(data, yTotal, displayType === 'percent'),
    [data, yTotal, displayType],
  );

  const hideXTicks = barChartData.length > 20;
  const fieldName = toDisplayName(field);
  const downloadFileName = `${field
    .split('.')
    .at(-1)}-bar-chart.${getFormattedTimestamp()}`;
  const jsonData = barChartData.map((b) => ({ label: b.key, value: b.count }));

  const { dispatch } = useContext(DashboardDownloadContext);
  useEffect(() => {
    const charts = [{ filename: downloadFileName, chartRef: downloadChartRef }];

    dispatch({ type: 'add', payload: charts });
    return () => dispatch({ type: 'remove', payload: charts });
  }, [dispatch, downloadFileName]);

  return (
    <>
      {isFetching ? (
        <Loader />
      ) : noData ? (
        <div className="h-full w-full flex">
          <p className="m-auto">No data for this property</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between pl-2 pr-0">
            <SegmentedControl
              size="sm"
              value={displayType}
              onChange={(value) =>
                setDisplayType(value as 'counts' | 'percent')
              }
              data={[
                { label: 'Count', value: 'counts' },
                { label: 'Percent', value: 'percent' },
              ]}
            />

            <Menu>
              <Menu.Target>
                <Tooltip
                  label="Download image or data"
                  withArrow
                  withinPortal
                  position="left"
                >
                  <ActionIcon
                    data-testid="button-histogram-download"
                    variant="outline"
                    className="bg-base-max border-primary"
                    aria-label="Download image or data"
                  >
                    {downloadInProgress ? (
                      <Loader size={16} />
                    ) : (
                      <DownloadIcon className="text-primary" aria-hidden />
                    )}
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>

              <Menu.Dropdown data-testid="dropdown-menu-options">
                {/*--- TODO: enable SVG
                <Menu.Item
                  onClick={async () => {
                    setDownloadInProgress(true);
                    await handleEChartsDownloadSVG(
                      downloadChartRef,
                      `${downloadFileName}.svg`,
                    );
                    setDownloadInProgress(false);
                  }}
                >
                  SVG
                </Menu.Item>
                */}
                <Menu.Item
                  onClick={async () => {
                    setDownloadInProgress(true);
                    handleEChartsDownload(
                      downloadChartRef,
                      `${downloadFileName}.png`,
                    );
                    setDownloadInProgress(false);
                  }}
                >
                  PNG
                </Menu.Item>
                <Menu.Item
                  component="a"
                  href={`data:text/json;charset=utf-8, ${encodeURIComponent(
                    JSON.stringify(jsonData, null, 2),
                  )}`}
                  download={`${downloadFileName}.json`}
                >
                  JSON
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
          <div className="h-64" ref={downloadChartRef}>
            <BarChart
              data={barChartData}
              total={yTotal}
              color={color}
              maxBins={1000}
              yLabel={
                displayType === 'percent'
                  ? `% of ${unitLabel}`
                  : `# of ${unitLabel}`
              }
              xLabel={
                hideXTicks
                  ? 'Mouse over the histogram to see x-axis labels'
                  : undefined
              }
              xLabelRotation={data.length > 10 ? -45 : 0}
              showXTicks={!hideXTicks}
              showLegendInChart={!hideYTicks}
            />
          </div>
        </>
      )}
    </>
  );
};

export default CDaveHistogram;
