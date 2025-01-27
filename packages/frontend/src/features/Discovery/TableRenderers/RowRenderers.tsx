import { MRT_Row } from 'mantine-react-table';
import { StudyDetailsField } from '../types';
import React, { ReactElement } from 'react';
import { Box, Text } from '@mantine/core';
import { JSONPath } from 'jsonpath-plus';

export interface RowRenderFunctionParams<TData extends Record<string, any> = Record<string, any>> {
  row: MRT_Row<TData>;
}

export interface RowRendererRegisteredFunctionParams extends RowRenderFunctionParams {
  studyPreviewConfig?: StudyDetailsField;
}

const StringRowRenderer = (
  { row }: RowRenderFunctionParams,
  studyPreviewConfig?: StudyDetailsField,
): ReactElement => {
  if (!studyPreviewConfig) {
    return <React.Fragment></React.Fragment>;
  }
  const value = JSONPath({
    json: row.original,
    path: studyPreviewConfig.field ?? '',
  });

  return (
    <Box
      display={'flex'}
      w={'100%'}
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
