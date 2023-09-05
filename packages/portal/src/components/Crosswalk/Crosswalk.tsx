import React, { useState, useEffect } from 'react';
import { Group, Stack, Button, Textarea, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { useGetCrosswalkDataQuery, CrosswalkInfo, usePrevious } from '@gen3/core';

const MIN_ROWS = 18;

const downloadData = (data: string) => {
  const csvData = encodeURI(`data:text/csv;charset=utf-8,${data}`);
  const link = document.createElement('a');
  link.href = csvData;
  link.download = 'crosswalk_data.csv';
  document.body.appendChild(link); // This can any part of your website
  link.click();
  document.body.removeChild(link);
};

export interface CrosswalkProps {
  readonly fromTitle: string;
  readonly toTitle: string;
  readonly fromPath: string[];
  readonly toPath: string[];
}

export const Crosswalk: React.FC<CrosswalkProps> = ({
  fromTitle,
  toTitle,
  fromPath, toPath
}: CrosswalkProps): JSX.Element => {
  const [query, setQuery] = useState<string[]>([]);
  const [sourceIds, setSourceIds] = useState<string>('');
  const { data, isSuccess } = useGetCrosswalkDataQuery(
    { ids: query, fromPath, toPath}
  );
  const [crosswalkIds, setCrosswalkIds] = useState<string>('');
  const clipboard = useClipboard({ timeout: 500 });

  const previousPath= usePrevious(fromPath.join(','));

  const updateIdQuery = (values: string) => {
    setSourceIds(values);
  };

  useEffect(() => {
    if (isSuccess) {
      setCrosswalkIds(
        data.mapping.map((cw: CrosswalkInfo) => cw.to).join('\n'),
      );
    }
  }, [data, isSuccess]);

  const clear = () => {
    setSourceIds('');
    setCrosswalkIds('');
    setQuery([]);
  };

  useEffect(() => {
    if (previousPath != fromPath)
      clear();
  }, [previousPath,fromPath]);

  const onSubmit = () => {
    setQuery(sourceIds.split(/,|\r?\n|\r|\n/g));
  };

  return (
    <Group grow className='w-100 h-100 p-4 mt-4'>
      <Stack>
        <Group>
          <Text>{fromTitle}</Text>
          <Button
            variant='outline'
            size='xs'
            disabled={sourceIds.length == 0}
            onClick={() => onSubmit()}
          >
            Submit
          </Button>
          <Button
            variant='outline'
            size='xs'
            disabled={sourceIds.length == 0}
            onClick={() => clear()}
          >
            Clear
          </Button>
        </Group>
        <Textarea
          placeholder='IDs...'
          radius='md'
          size='md'
          required
          value={sourceIds}
          minRows={MIN_ROWS}
          onChange={(event) => updateIdQuery(event.currentTarget.value)}
        />
      </Stack>

      <Stack>
        <Group>
          <Text>{toTitle}</Text>
          <Group position='right'>
            <Button
              variant='outline'
              size='xs'
              color={clipboard.copied ? 'teal' : 'blue'}
              onClick={() => {
                if (data) clipboard.copy(data.mapping.map((x) => x.to));
              }}
              disabled={crosswalkIds.length == 0}
            >
              Copy
            </Button>
            <Button
              variant='outline'
              size='xs'
              onClick={() => {
                if (data)
                  downloadData(
                    data.mapping.map((x) => `${x.from},${x.to}`).join('\n'),
                  );
              }}
              disabled={crosswalkIds.length == 0}
            >
              Download
            </Button>
          </Group>
        </Group>
        <Textarea
          placeholder='Results...'
          radius='md'
          size='md'
          value={crosswalkIds}
          readOnly={true}
          minRows={MIN_ROWS}
        />
      </Stack>
    </Group>
  );
};
