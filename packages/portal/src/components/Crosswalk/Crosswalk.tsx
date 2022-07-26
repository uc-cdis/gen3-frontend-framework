import React, {useState, useEffect } from 'react';
import { Group, Stack, Button, Textarea, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { useGetCrosswalkDataQuery, CrosswalkInfo } from '@gen3/core';

const MIN_ROWS = 18;

const downloadData = (data:string) => {
  const json = JSON.stringify(data);
  const blob = new Blob([json],{type:'application/text'});
  const href = URL.createObjectURL(blob); // Create a downloadable link
  const link = document.createElement('a');
  link.href = href;
  link.download = 'crosswalk_data.csv';
  document.body.appendChild(link);   // This can any part of your website
  link.click();
  document.body.removeChild(link);
};


export const Crosswalk = (): JSX.Element => {
  const [ query, setQuery ]  = useState<string>('');
  const [ midrcIds, setMidrcIds ]  = useState<string>('');
  const { data, isSuccess} = useGetCrosswalkDataQuery(query, { skip: query === '' } );
  const [ crosswalkIds, setCrosswalkIds ]  = useState<string>('');
  const clipboard = useClipboard({ timeout: 500 });

  const updateIdQuery = (values:string) => {
    setMidrcIds(values);
  };

  useEffect(() => {
    if (isSuccess) {
      setCrosswalkIds(data.mapping.map((cw:CrosswalkInfo) => cw.to ).join('\n'));
    }
  }, [data, isSuccess]);

  const clear = () => {
    setMidrcIds('');
    setCrosswalkIds('');
    setQuery('');
  };

  const onSubmit = () => {
    const ids = midrcIds.split(/,|\r?\n|\r|\n/g).map((x) => `ids.midrc_id=${x}`).join('&');
    setQuery(`_guid_type=petal_crosswalk&data=True&${ids}`);
  };

  return (
    <Group grow className='w-100 h-100 p-4 mt-4'>
      <Stack >
        <Group>
          <Text>Enter your MIDRC IDs</Text>
          <Button variant='outline' size='xs' disabled={midrcIds.length == 0} onClick={() => onSubmit() }>Submit</Button>
          <Button variant='outline' size='xs' disabled={midrcIds.length == 0} onClick={() => clear()}>Clear</Button>
        </Group>
        <Textarea
          placeholder='IDs...'
          radius='md'
          size='md'
          required
          value={midrcIds}
          minRows={MIN_ROWS}
          onChange={(event) => updateIdQuery(event.currentTarget.value)}
        />
      </Stack>

      <Stack  >
        <Group>
          <Text>Matching N3C IDs</Text>
          <Group position='right'>
            <Button variant='outline' size='xs'
              color={clipboard.copied ? 'teal' : 'blue'}
              onClick={() => { if (data) clipboard.copy(data.mapping.map((x) => x.to));}}
              disabled={crosswalkIds.length == 0} >Copy</Button>
            <Button variant='outline' size='xs'
              onClick={() => { if (data)  downloadData(data.mapping.map((x) => x.to).join(','));}}
              disabled={crosswalkIds.length == 0}

            >Download</Button>
          </Group>
        </Group>
        <Textarea
          placeholder='Results...'
          radius='md'
          size='md' value={crosswalkIds} readOnly={true}
          minRows={MIN_ROWS}
        />
      </Stack>
    </Group>
  );
};
