import React, { useState } from 'react';
import { ActionIcon } from '@mantine/core';
import { Icon } from '@iconify/react';
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
        <ActionIcon
          variant="filled"
          aria-label="Settings"
          onClick={expand}
          className="self-center"
        >
          <Icon icon={expanded ? 'gen3:changeFrom' : 'gen3:changeTo'} />
        </ActionIcon>
        <div className="w-full overflow-x-scroll">
          {expanded ? (
            <ExplorerTableSubtable
              columns={expandedTableColumns}
              data={tableData}
            />
          ) : (
            <ExplorerTableSubtable
              columns={compressedTableColumns}
              data={tableData}
            />
          )}
        </div>
        /
      </div>
    </div>
  );
};

export default ExpandingSubtable;
