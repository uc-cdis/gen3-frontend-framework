import React, { useMemo, ReactElement } from 'react';
import { Accordion } from '@mantine/core';
import type { FieldSubtable } from '../types';
import ExplorerTableSubtable from './ExplorerTableSubtable';
import { JSONObject } from '@gen3/core';

interface SubtableAccordianProps {
  subTables: ReadonlyArray<FieldSubtable>;
  data: JSONObject;
}

const SubtableAccordion = ({ subTables, data }: SubtableAccordianProps) => {
  const items = useMemo(
    () =>
      subTables.reduce((acc: ReactElement[], config: FieldSubtable) => {
        if (!(config.root in data)) return acc;

        acc.push(
          <Accordion.Item value={config.root} key={config.root}>
            <Accordion.Control>{config.label}</Accordion.Control>
            <ExplorerTableSubtable
              config={config}
              data={data[config.root] as JSONObject[]}
            />
          </Accordion.Item>,
        );
        return acc;
      }, []),
    [data, subTables],
  );

  return <Accordion>{items}</Accordion>;
};

export default SubtableAccordion;
