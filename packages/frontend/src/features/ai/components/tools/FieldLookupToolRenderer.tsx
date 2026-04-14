import React from 'react';
import { Badge, Paper, Skeleton, Stack, Text } from '@mantine/core';
import type { ToolRendererProps } from '../../types';

interface FieldLookupInput {
  search_term: string;
}

interface FieldLookupOutput {
  search_term: string;
  matches_found: number;
  fields: string[];
}

const FieldLookupToolRenderer = ({ part }: ToolRendererProps) => {
  const input = part.input as FieldLookupInput | undefined;
  const output = part.output as FieldLookupOutput | undefined;
  const isLoading = part.state === 'input-available';

  return (
    <Paper withBorder radius="md" px="sm" py="xs" my={4} className="max-w-sm">
      <Stack gap="xs">
        <div className="flex items-center gap-2">
          <Text size="xs" fw={600}>
            Field Lookup:
          </Text>
          {input?.search_term && (
            <Badge size="xs" variant="light">
              {input.search_term}
            </Badge>
          )}
        </div>

        {isLoading && <Skeleton height={36} radius="sm" />}

        {output && (
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              Fields: {output.matches_found.toLocaleString()}
            </Text>
            {output.fields && (
              <div className="flex flex-wrap gap-1">
                {output.fields.map((v) => (
                  <Badge key={v} size="xs" variant="outline">
                    {v}
                  </Badge>
                ))}
              </div>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default FieldLookupToolRenderer;
