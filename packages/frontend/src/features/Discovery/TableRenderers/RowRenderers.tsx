import { MRT_Row } from 'mantine-react-table';
import { StudyPreviewField } from '../types';
import React, { ReactElement } from 'react';
import { Box, Text } from '@mantine/core';
import { JSONPath } from 'jsonpath-plus';

export interface RowRenderFunctionParams<TData extends Record<string, any> = Record<string, any>> {
  row: MRT_Row<TData>;
}

export interface RowRendererRegisteredFunctionParams extends RowRenderFunctionParams {
  studyPreviewConfig?: StudyPreviewField;
}

const StringRowRenderer = (
  { row }: RowRenderFunctionParams,
  studyPreviewConfig?: StudyPreviewField,
): ReactElement => {
  if (!studyPreviewConfig) {
    return <></>;
  }
  const value = JSONPath({
    json: row.original,
    path: studyPreviewConfig.field ?? '',
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
