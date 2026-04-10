import React from 'react';
import { Box, Code, Text } from '@mantine/core';
import { type ToolRendererProps } from '../types';

const ToolRenderer = ({ part }: ToolRendererProps) => {
  const isLoading = part.state === 'input-available';
  const isError = part.state === 'output-error';

  return (
    <Box className="my-2 rounded-lg border border-[var(--mantine-color-gray-3)] bg-[var(--mantine-color-gray-0)] px-3.5 py-2.5 font-mono text-[13px] text-[var(--mantine-color-gray-7)]">
      <Text fw={600} mb={4} size="sm">
        🔧 {part.type.replace('tool-', '')}
        {isLoading && ' …'}
        {isError && ' ⚠️'}
      </Text>

      {part.input && (
        <Code block className="m-0 overflow-auto">
          {JSON.stringify(part.input, null, 2)}
        </Code>
      )}

      {part.state === 'output-available' && part.output ? (
        <Code
          block
          className="mt-1 overflow-auto text-[var(--mantine-color-green-7)]"
        >
          {JSON.stringify(part?.output ?? {}, null, 2)}
        </Code>
      ) : null}
    </Box>
  );
};

export default ToolRenderer;
