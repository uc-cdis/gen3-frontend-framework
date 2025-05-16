import React, { useState } from 'react';
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
    <div className="flex items-center bg-primary px-10 h-10 w-full text-primary-contrast font-semibold">
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

  console.log(
    'ExpandingSubtable: ',
    config,
    ' data: ',
    tableData,
    'cols',
    compressedTableColumns,
  );
  return (
    <div className="flex flex-col">
      <Header label={config.label} />
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
  );
};

export default ExpandingSubtable;
