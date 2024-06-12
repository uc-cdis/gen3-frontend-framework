import React, { ReactElement } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { Box, Text } from '@mantine/core';
import { ExplorerDetailsConfig } from './types';
import { MRT_Row } from 'mantine-react-table';

export interface RowRenderFunctionParams<
  TData extends Record<string, any> = Record<string, any>,
> {
  row: MRT_Row<TData>;
}

const StringRowRenderer = (
  { row }: RowRenderFunctionParams,
  config?: ExplorerDetailsConfig,
): ReactElement => {
  if (!config) {
    return <React.Fragment></React.Fragment>;
  }
  const value = JSONPath({
    json: row.original,
    path: config.field ?? '',
  });

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
      }}
    >
      <Text size="xs" lineClamp={2}>
        {value}
      </Text>
    </Box>
  );
};

export const Gen3DiscoveryStandardRowPreviewRenderers = {
  string: {
    default: StringRowRenderer,
  },
};

export const defaultRowRenderer = StringRowRenderer;
