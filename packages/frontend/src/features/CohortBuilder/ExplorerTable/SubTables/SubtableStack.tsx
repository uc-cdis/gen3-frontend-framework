import React, { useMemo, ReactElement } from 'react';
import { Stack, Accordion } from '@mantine/core';
import type { FieldSubtable } from '../types';
import ExpandingSubtable from './ExpandingSubtable';
import { JSONObject } from '@gen3/core';

interface SubtableStackProps {
  subTables: ReadonlyArray<FieldSubtable>;
  data: JSONObject;
}

const SubtableStack = ({ subTables, data }: SubtableStackProps) => {
  console.log('SubtableStack: ', subTables, ' data: ', data);
  const items = useMemo(
    () =>
      subTables.reduce((acc: ReactElement[], config: FieldSubtable) => {
        if (!(config.root in data)) return acc;
        acc.push(
          <ExpandingSubtable
            config={config}
            data={data[config.root] as JSONObject[]}
          />,
        );
        return acc;
      }, []),
    [data, subTables],
  );

  return (
    <Stack
      classNames={{
        root: 'w-100',
      }}
    >
      {items}
    </Stack>
  );
};

export default SubtableStack;
