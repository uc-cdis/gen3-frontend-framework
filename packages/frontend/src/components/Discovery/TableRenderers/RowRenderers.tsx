import { MRT_Row } from 'mantine-react-table';
import { StudyPreviewField } from '../types';
import React, { ReactElement } from 'react';
import { Box, Text } from '@mantine/core';
import { JSONPath } from 'jsonpath-plus';
import { DiscoveryRowRendererFactory } from './RowRendererFactory';

export interface RowRenderFunctionProps {
  row: MRT_Row;
}

const StringRowRenderer = (
  { row }: RowRenderFunctionProps,
  studyPreviewConfig?: StudyPreviewField,
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
      sx={{
        display: 'flex',
        width: '100%',
      }}
    >
      <Text size="xs" lineClamp={2}>{value}</Text>
    </Box>
  );
};

export const Gen3DiscoveryStandardRowPreviewRenderers = {
  string: {
    default: StringRowRenderer,
  },
};

export const registerDiscoveryDefaultStudyPreviewRenderers = () => {
  DiscoveryRowRendererFactory.registerRowRendererCatalog(
    Gen3DiscoveryStandardRowPreviewRenderers,
  );
};

export const defaultRowRenderer = StringRowRenderer;
