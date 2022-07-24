import React from 'react';
import { Container, Stack, Button, Textarea } from '@mantine/core';


export const Crosswalk = () : JSX.Element => {
  return (
    <Stack className='w-100 bg-amber-400'>
      <Textarea
        placeholder='IDs...'
        label='Enter your MIDRC IDs'
        radius='md'
        size='md'
        required
      />

      <Textarea
        placeholder='Results...'
        label='Matching N3C IDs'
        radius='md'
        size='md'
      />
      <div className='flex w-100 flex-row justify-end'>
        <Button>Copy</Button>
        <Button>Download</Button>
      </div>
    </Stack>
  );
};
