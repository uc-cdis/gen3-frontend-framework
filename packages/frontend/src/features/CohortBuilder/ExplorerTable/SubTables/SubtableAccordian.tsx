import React, { ReactElement, useMemo } from 'react';
import { Accordion } from '@mantine/core';
import type { FieldSubtable } from '../types';
import ExplorerTableSubtable from './ExplorerTableSubtable';
import { JSONObject } from '@gen3/core';
import { createTableColumns } from '../utils';

interface SubtableAccordianProps {
  subTables: ReadonlyArray<FieldSubtable>;
  data: JSONObject;
}

const SubtableAccordion = ({ subTables, data }: SubtableAccordianProps) => {
  const items = useMemo(
    () =>
      subTables.reduce((acc: ReactElement[], config: FieldSubtable) => {
        if (!(config.root in data)) return acc;

        const { tableColumns: expandedTableColumns } =
          createTableColumns(config);

        acc.push(
          <Accordion.Item value={config.root} key={config.root}>
            <Accordion.Control>{config.label}</Accordion.Control>
            <Accordion.Panel>
              <div className="w-100 inline-block overflow-x-scroll">
                <ExplorerTableSubtable
                  columns={expandedTableColumns}
                  data={data[config.root] as JSONObject[]}
                />
              </div>
            </Accordion.Panel>
          </Accordion.Item>,
        );
        return acc;
      }, []),
    [data, subTables],
  );

  return (
    <Accordion
      chevronPosition="left"
      classNames={{
        panel: 'w-100',
      }}
    >
      {items}
    </Accordion>
  );
};

export default SubtableAccordion;
