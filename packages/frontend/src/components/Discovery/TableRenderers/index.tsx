import { Box, Text } from '@mantine/core';
import React from 'react';

export const SimpleRowDetail = (row: Record<string, any>) => {
  return (
    <Box
      sx={{
        display: 'flex column',
        margin: 'auto',
        width: '100%',
      }}
    >
      <Text lineClamp={2} fz="xs">
        {(row.original?.study_description as string) ??
          'No description available'}
      </Text>
    </Box>
  );
};
