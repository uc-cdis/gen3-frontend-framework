import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActionIcon, Group, Loader, Menu, Radio, Tooltip } from '@mantine/core';
import OffscreenWrapper from '../../../components/OffscreenWrapper';
import {
  handleDownloadPNG,
  handleDownloadSVG,
} from '../../../components/charts/downloads';
import { getFormattedTimestamp } from '../../../utils/date';
import {
  DashboardDownloadContext,
  DownloadProgressContext,
} from '../../Analysis/context';
import VictoryBarChart from '../../../components/charts/VictoryBarChart';
import { toDisplayName } from '../utils';
import { DisplayData } from '../types';
import { useDeepCompareMemo } from 'use-deep-compare';
import { DownloadIcon } from '../icons';

const formatBarChartData = (
  data: DisplayData,
  yTotal: number,
  displayPercent: boolean,
) => {
  const mappedData = data.map(({ displayName, key, count }) => ({
    x: key,
    fullName: displayName,
    key,
    y: displayPercent ? (count / yTotal) * 100 : count,
    yCount: count,
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
  color: string;
}

const CDaveHistogram: React.FC<Readonly<HistogramProps>> = ({
  data,
  yTotal,
  isFetching,
  field,
  noData,
  hideYTicks = false,
  color,
}: HistogramProps) => {
  const [displayPercent, setDisplayPercent] = useState(true);
  const downloadChartRef = useRef<HTMLElement>(null!);
  const { downloadInProgress, setDownloadInProgress } = useContext(
    DownloadProgressContext,
  );

  const barChartData = useDeepCompareMemo(
    () => formatBarChartData(data, yTotal, displayPercent),
    [data, yTotal, displayPercent],
  );

  const fieldType = field.split('.').at(-2);

  const hideXTicks = barChartData.length > 20;
  const fieldName = toDisplayName(field);
  const downloadFileName = `${field
    .split('.')
    .at(-1)}-bar-chart.${getFormattedTimestamp()}`;
  const jsonData = barChartData.map((b) => ({ label: b.fullName, value: b.y }));

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
            <Radio.Group
              size="sm"
              onChange={(value) => setDisplayPercent(value === 'percent')}
              defaultValue="percent"
            >
              <Group className="px-2 flex  items-center gap-2">
                <Radio
                  data-testid="radio-number-of-cases"
                  classNames={{ label: 'font-heading pl-1', icon: 'hidden' }}
                  value="counts"
                  label="# of Cases"
                  color="primary.4"
                />
                <Radio
                  data-testid="radio-percent-of-cases"
                  classNames={{ label: 'font-heading pl-1', icon: 'hidden' }}
                  value="percent"
                  label="% of Cases"
                  color="primary.4"
                />
              </Group>
            </Radio.Group>
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
                <Menu.Item
                  onClick={async () => {
                    setDownloadInProgress(true);
                    await handleDownloadSVG(
                      downloadChartRef,
                      `${downloadFileName}.svg`,
                    );
                    setDownloadInProgress(false);
                  }}
                >
                  SVG
                </Menu.Item>
                <Menu.Item
                  onClick={async () => {
                    setDownloadInProgress(true);
                    await handleDownloadPNG(
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
          <div className="h-64">
            <VictoryBarChart
              data={barChartData}
              title={`${fieldName} histogram`}
              color={color}
              yLabel={displayPercent ? '% of Cases' : '# of Cases'}
              width={900}
              height={400}
              hideXTicks={hideXTicks}
              hideYTicks={hideYTicks}
              xLabel={
                hideXTicks
                  ? 'Mouse over the histogram to see x-axis labels'
                  : undefined
              }
              truncateLabels
              yAxisFormatAsInteger
              includeDomainPadding={true}
              isPercent={displayPercent}
            />
          </div>
          <OffscreenWrapper>
            <VictoryBarChart
              data={barChartData.map((d) => ({ ...d, x: d.fullName }))}
              color={color}
              yLabel={displayPercent ? '% of Cases' : '# of Cases'}
              chartLabel={fieldName}
              width={1200}
              height={900}
              chartPadding={{ left: 150, right: 300, bottom: 400, top: 50 }}
              hideXTicks={hideXTicks}
              hideYTicks={hideYTicks}
              xLabel={
                hideXTicks
                  ? 'For histogram details, download the associated TSV or JSON file'
                  : undefined
              }
              chartRef={downloadChartRef}
              yAxisFormatAsInteger
              includeDomainPadding={!displayPercent}
              isPercent={displayPercent}
            />
          </OffscreenWrapper>
        </>
      )}
    </>
  );
};

export default CDaveHistogram;
