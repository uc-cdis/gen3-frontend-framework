import React, { useState, useEffect } from 'react';
import { Group, Stack, Button, Textarea, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import {
  useGetCrosswalkDataQuery,
  CrosswalkInfo,
  usePrevious,
} from '@gen3/core';

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
  readonly guidField: string;
  readonly fromField: string;
  readonly toField: string;
}

export const Crosswalk: React.FC<CrosswalkProps> = ({
  fromTitle,
  toTitle,
  guidField,
  fromField,
  toField,
}: CrosswalkProps): JSX.Element => {
  const [query, setQuery] = useState<string>('');
  const [sourceIds, setSourceIds] = useState<string>('');
  const { data, isSuccess } = useGetCrosswalkDataQuery(
    { ids: query, fields: { from: fromField, to: toField } },
    { skip: query === '' },
  );
  const [crosswalkIds, setCrosswalkIds] = useState<string>('');
  const clipboard = useClipboard({ timeout: 500 });

  const previousField = usePrevious(fromField);

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
    setQuery('');
  };

  useEffect(() => {
    if (previousField != fromField) clear();
  }, [previousField, fromField]);

  const onSubmit = () => {
    const ids = sourceIds
      .split(/,|\r?\n|\r|\n/g)
      .map((x) => `ids.${fromField}=${x}`)
      .join('&');
    setQuery(`_guid_type=${guidField}&data=True&${ids}`);
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
                if (data)
                  clipboard.copy(
                    data.mapping.map((x: Record<string, unknown>) => x.to),
                  );
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
                    data.mapping
                      .map((x: Record<string, unknown>) => `${x.from},${x.to}`)
                      .join('\n'),
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
