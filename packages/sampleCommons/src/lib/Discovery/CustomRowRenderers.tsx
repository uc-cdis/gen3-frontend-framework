'use client';
import React, { ReactElement } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { Box, Text } from '@mantine/core';
import {
  StudyPreviewField,
  RowRenderFunctionProps,
  DiscoveryRowRendererFactory,
  useDiscoveryContext,
} from '@gen3/frontend';

const HEALRowRenderer = (
  { row }: RowRenderFunctionProps,
  studyPreviewConfig?: StudyPreviewField,
): ReactElement => {
  const { discoveryConfig: config, setStudyDetails } = useDiscoveryContext();

  if (!studyPreviewConfig) {
    return <React.Fragment></React.Fragment>;
  }
  const value =
    JSONPath({
      json: row.original,
      path: studyPreviewConfig.field,
    }) ??
    config?.studyPreviewField?.valueIfNotAvailable ??
    '';

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
      }}
      onClick={() => {
        setStudyDetails(() => {
          return { ...row.original };
      });}}
    >
      <Text size="sm" lineClamp={2}>
        {value}
      </Text>
    </Box>
  );
};

export const registerDiscoveryStudyPreviewRenderers = () => {
  DiscoveryRowRendererFactory.registerRowRendererCatalog({
    string: {
      default: HEALRowRenderer,
    },
  });
};
