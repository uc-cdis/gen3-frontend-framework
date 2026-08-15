import React from 'react';
import { Accordion, Box, ScrollArea, Table } from '@mantine/core';
import isNumber from 'lodash/isNumber';

interface BarChartTextVersionProps {
  readonly data: { [key: string]: number | string }[];
  readonly className?: string;
  readonly horizontalScrollWidth?: number;
}

const BarChartTextVersion: React.FC<BarChartTextVersionProps> = ({
  data,
  className,
  horizontalScrollWidth,
}: BarChartTextVersionProps) => {
  const maxHeightOfScrollArea = 300;
  const numberOfDecimalsPlacesToShow = 2;

  if (!data || data.length === 0)
    return <div className={`pt-2 ${className}`}>No data to display</div>;

  const formatNumber = (num: number) =>
    num
      .toFixed(numberOfDecimalsPlacesToShow)
      .replace(/\.00$/, '')
      .replace(/\.0$/, '');

  if (!data || data.length === 0) return <></>;
  const headerTitles = Object.keys(data[0]);

  const rows = data.map((rowData, i) => {
    const rowDataArr = Object.values(rowData);
    return (
      <Table.Tr key={i}>
        {rowDataArr.map((value, i) => (
          <Table.Td key={i}>
            {isNumber(value) ? formatNumber(value) : (value as string)}
          </Table.Td>
        ))}
      </Table.Tr>
    );
  });

  const ChartTextVersionTable = (
    <div data-testid="chart-text-version">
      <ScrollArea h={maxHeightOfScrollArea}>
        <Box
          w={horizontalScrollWidth ? horizontalScrollWidth : undefined}
          tabIndex={0}
        >
          <Table>
            <Table.Thead>
              <Table.Tr>
                {headerTitles.map((title, i) => (
                  <Table.Th key={i} className="capitalize text-xs md:text-sm">
                    {title}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Box>
      </ScrollArea>
    </div>
  );

  return (
    <div className={`pt-2 ${className}`}>
      <Accordion>
        <Accordion.Item value="textVersion">
          <Accordion.Control>Text Version</Accordion.Control>
          <Accordion.Panel>{ChartTextVersionTable}</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default BarChartTextVersion;
