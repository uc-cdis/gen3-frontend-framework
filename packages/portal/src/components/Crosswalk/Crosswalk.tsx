import React, {useState, useEffect } from 'react';
import { Group, Stack, Button, Textarea, Text } from '@mantine/core';
import { useGetCrosswalkDataQuery, CrosswalkInfo } from "@gen3/core";

export const Crosswalk = (): JSX.Element => {
  const [ query, setQuery ]  = useState<string>('');
  const [ midrcIds, setMidrcIds ]  = useState<string>('');
  const { data, isSuccess} = useGetCrosswalkDataQuery(query, { skip: query === '' } );
  const [ crosswalkIds, setCrosswalkIds ]  = useState<string>('');

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
  }

  const onSubmit = () => {
    const ids = midrcIds.split(/\r?\n|\r|\n/g).map((x) => `ids.midrc_id=${x}`).join("&");
    setQuery(`_guid_type=petal_crosswalk&data=True&${ids}`);
    console.log(ids);

  };

  return (
    <Group className='w-100 h-100 p-4 mt-4'>
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
          minRows={25}
          onChange={(event) => updateIdQuery(event.currentTarget.value)}
        />
      </Stack>

      <Stack >
        <Group>
          <Text>Matching N3C IDs</Text>
          <Group position='right'>
            <Button variant='outline' size='xs' disabled={crosswalkIds.length == 0} >Copy</Button>
            <Button variant='outline' size='xs'disabled={crosswalkIds.length == 0} >Download</Button>
          </Group>
        </Group>
        <Textarea
          placeholder='Results...'
          radius='md'
          size='md' value={crosswalkIds}
          minRows={25}
        />
      </Stack>
    </Group>
  );
};
