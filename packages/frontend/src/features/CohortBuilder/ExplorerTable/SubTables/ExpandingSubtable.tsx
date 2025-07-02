import React, { useState } from 'react';
import { ActionIcon, useMantineTheme } from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import { ExpandingSubTableProps } from './types';
import ExplorerTableSubtable from './ExplorerTableSubtable';
import { JSONObject, JSONValue } from '@gen3/core';
import { useDeepCompareMemo } from 'use-deep-compare';
import { createArrayTableColumns, createTableColumns } from '../utils';

interface HeaderProps {
  label: string;
  className?: string;
}

const Header = ({ label, className }: HeaderProps) => {
  return (
    <div className="flex items-center bg-primary px-4 h-10 w-full text-primary-contrast font-semibold">
      {label}
    </div>
  );
};

const ExpandingSubtable = ({ config, data }: ExpandingSubTableProps) => {
  const [expanded, setExpanded] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const theme = useMantineTheme();

  const expandedTableColumns = useDeepCompareMemo(() => {
    return createTableColumns(config);
  }, [config]);

  const compressedTableColumns = useDeepCompareMemo(() => {
    return createArrayTableColumns(config.root, config);
  }, [config]);

  const expand = () => {
    setExpanded((prevState) => !prevState);
  };

  let tableData = data;
  if (!expanded) {
    // convert data from Array<Record<string, JSONValue>> to Record<string, Array<JSONValue>>
    tableData = [
      data
        ? data.reduce(
            (acc: Record<string, Array<JSONValue>>, row) => {
              config.fields.forEach((field) => {
                acc[field].push(row[field]);
              });
              return acc;
            },
            config.fields.reduce(
              (rec, f) => {
                rec[f] = [];
                return rec;
              },
              {} as Record<string, Array<JSONObject>>,
            ),
          )
        : {},
    ];
  }

  return (
    <div className="flex flex-col">
      <Header label={config.label} />
      <div className="flex flex-nowrap w-full">
        <div className="flex flex-col border border-table-light">
          <div
            className="bg-secondary-lightest border-bottom border-table-light"
            style={{
              height: `${headerHeight}px`,
            }}
          ></div>
          <ActionIcon
            variant="transparent"
            aria-label="Settings"
            onClick={expand}
            className="my-auto"
          >
            <Icon
              icon={expanded ? 'gen3:changeFrom' : 'gen3:changeTo'}
              color={theme.colors.accent[4]}
            />
          </ActionIcon>
        </div>
        <div className="w-full overflow-x-auto">
          {expanded ? (
            <ExplorerTableSubtable
              columns={expandedTableColumns}
              data={tableData}
              setHeaderHeight={setHeaderHeight}
            />
          ) : (
            <ExplorerTableSubtable
              columns={compressedTableColumns}
              data={tableData}
              setHeaderHeight={setHeaderHeight}
            />
          )}
        </div>
        /
      </div>
    </div>
  );
};

export default ExpandingSubtable;
