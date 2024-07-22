import React, { useState, useEffect } from 'react';
import { Group, Stack, Button, Textarea, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { useLazyGetCrosswalkDataQuery, CrosswalkInfo } from '@gen3/core';

const MIN_ROWS = 18;

import { type CrosswalkConfig } from './types';
import CrosswalkTable from './CrosswalkTable';
import { useDeepCompareMemo } from 'use-deep-compare';

const downloadData = (data: string) => {
  const csvData = encodeURI(`data:text/csv;charset=utf-8,${data}`);
  const link = document.createElement('a');
  link.href = csvData;
  link.download = 'crosswalk_data.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const CrosswalkPanel = ({ mapping }: CrosswalkConfig) => {
  const [query, setQuery] = useState<string[]>([]);
  const [sourceIds, setSourceIds] = useState<string>('');
  const [crosswalkIds, setCrosswalkIds] = useState<string>('');
  const clipboard = useClipboard({ timeout: 500 });

  const [tableMessage, setTableMessage] = useState<string>('');

  const [getMapping, { data, isFetching, isError, isSuccess }] =
    useLazyGetCrosswalkDataQuery();

  const clear = () => {
    setSourceIds('');
    setCrosswalkIds('');
    setQuery([]);
    getMapping({
      ids: [],
      toPaths: mapping.external.map((x) => ({
        id: x.id,
        dataPath: x.dataPath,
      })),
    });
  };

  useEffect(() => {
    if (query.length == 0) {
      setTableMessage('No crosswalk ids submitted');
      return;
    }
    if (isError) {
      setTableMessage('Error returned from crosswalk service');
    }
  }, [query, isError]);

  const onSubmit = () => {
    getMapping({
      ids: sourceIds.split(/,|\r?\n|\r|\n/g),
      toPaths: mapping.external.map((x) => ({
        id: x.id,
        dataPath: x.dataPath,
      })),
    });
  };

  const updateIdQuery = (values: string) => {
    setSourceIds(values);
  };

  return (
    <Group
      noWrap
      className="w-full items-start justify-start bg-base-lightest"
      align="stretch"
    >
      <Stack align="stretch" justify="flex-start" className="p-2">
        <Group noWrap>
          <Button
            size="md"
            color="secondary.4"
            disabled={sourceIds.length == 0}
            onClick={() => onSubmit()}
          >
            Submit
          </Button>
          <Button
            size="md"
            color="secondary.4"
            disabled={sourceIds.length == 0}
            onClick={() => clear()}
          >
            Clear
          </Button>
        </Group>
        <Textarea
          placeholder="IDs..."
          radius="md"
          size="md"
          required
          value={sourceIds}
          minRows={MIN_ROWS}
          onChange={(event) => updateIdQuery(event.currentTarget.value)}
          classNames={{
            root: 'h-full',
            wrapper: 'h-full',
          }}
          styles={{
            input: { height: '100%' },
          }}
        />
      </Stack>
      <Stack
        align="stretch"
        justify="flex-start"
        className="w-full p-2 border-0"
      >
        <Group position="right">
          <Button
            variant="outline"
            size="md"
            color={clipboard.copied ? 'accent.4' : 'accent-warm.4'}
            onClick={() => {
              if (data) clipboard.copy(data.map((x: CrosswalkInfo) => x.to));
            }}
            disabled={!data || data.length == 0}
          >
            Copy
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              if (data)
                downloadData(
                  data
                    .map((x: CrosswalkInfo) => `${x.from},${x.to}`)
                    .join('\n'),
                );
            }}
            disabled={!data || data.length == 0}
          >
            Download
          </Button>
        </Group>
        <CrosswalkTable
          mapping={mapping}
          data={data ?? []}
          isFetching={isFetching}
          isSuccess={isSuccess}
          isError={isError}
          tableMessage={tableMessage}
        />
      </Stack>
    </Group>
  );
};

export default CrosswalkPanel;
