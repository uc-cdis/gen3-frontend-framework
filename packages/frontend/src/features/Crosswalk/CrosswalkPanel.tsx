import React, { useState, useEffect } from 'react';
import { Group, Stack, Button, Textarea, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import {
  useGetCrosswalkDataQuery,
  CrosswalkInfo,
  usePrevious,
} from '@gen3/core';

const MIN_ROWS = 18;

import { type CrosswalkConfig } from './types';
import CrosswalkTable from './CrosswalkTable';

const downloadData = (data: string) => {
  const csvData = encodeURI(`data:text/csv;charset=utf-8,${data}`);
  const link = document.createElement('a');
  link.href = csvData;
  link.download = 'crosswalk_data.csv';
  document.body.appendChild(link); // This can any part of your website
  link.click();
  document.body.removeChild(link);
};

const CrosswalkPanel = ({ mapping }: CrosswalkConfig) => {
  const [query, setQuery] = useState<string[]>([]);
  const [sourceIds, setSourceIds] = useState<string>('');
  const [crosswalkIds, setCrosswalkIds] = useState<string>('');
  const clipboard = useClipboard({ timeout: 500 });
  const previousPath = usePrevious<string>(mapping.source.dataPath);
  const { data, isSuccess, isError, isFetching } = {
    data: [],
    isSuccess: true,
    isError: false,
    isFetching: false,
  };

  const clear = () => {
    setSourceIds('');
    setCrosswalkIds('');
    setQuery([]);
  };

  useEffect(() => {
    if (previousPath != mapping.source.dataPath) clear();
  }, [previousPath, mapping.source.dataPath]);

  const onSubmit = () => {
    setQuery(sourceIds.split(/,|\r?\n|\r|\n/g));
  };

  const updateIdQuery = (values: string) => {
    setSourceIds(values);
  };

  return (
    <Group grow className="w-100 h-100 p-4 mt-4">
      <Stack>
        <Group>
          <Text>{mapping.source.name}</Text>
          <Button
            variant="outline"
            size="xs"
            disabled={sourceIds.length == 0}
            onClick={() => onSubmit()}
          >
            Submit
          </Button>
          <Button
            variant="outline"
            size="xs"
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
        />

        <Stack>
          <Group position="right">
            <Button
              variant="outline"
              size="xs"
              color={clipboard.copied ? 'teal' : 'blue'}
              onClick={() => {
                if (data) clipboard.copy(data.map((x: CrosswalkInfo) => x.to));
              }}
              disabled={crosswalkIds.length == 0}
            >
              Copy
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                if (data)
                  downloadData(
                    data
                      .map((x: CrosswalkInfo) => `${x.from},${x.to}`)
                      .join('\n'),
                  );
              }}
              disabled={crosswalkIds.length == 0}
            >
              Download
            </Button>
          </Group>
          <CrosswalkTable
            mapping={mapping}
            data={data}
            isFetching={isFetching}
            isSuccess={isSuccess}
            isError={isError}
          />
        </Stack>
      </Stack>
    </Group>
  );
};

export default CrosswalkPanel;
