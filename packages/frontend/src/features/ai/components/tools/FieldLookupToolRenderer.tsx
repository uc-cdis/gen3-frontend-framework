import React from 'react';
import { Badge, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import type { ToolRendererProps } from '../../types';

interface FieldLookupInput {
  search_term: string;
}

interface FieldLookupOutput {
  search_term: string;
  matches_found: number;
  fields: {
    field: string;
    description: string;
    sample_values: string;
  }[];
}

const FieldLookupToolRenderer = ({ part }: ToolRendererProps) => {
  const input = part.input as FieldLookupInput | undefined;
  const output = part.output as FieldLookupOutput | undefined;
  const isLoading = part.state === 'input-available';

  return (
    <Paper withBorder radius="md" px="sm" py="xs" my={4} className="max-w-sm">
      <Stack gap="xs">
        <Group>
          <Text size="xs" fw={600}>
            Field Lookup:
          </Text>
          {input?.search_term && (
            <Badge size="xs" variant="light">
              {input.search_term}
            </Badge>
          )}
        </Group>

        {isLoading && <Skeleton height={36} radius="sm" />}

        {output && (
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              Found: {output.matches_found.toLocaleString()}
            </Text>
            {output.fields && (
              <div className="flex flex-wrap gap-1">
                {output.fields.map((x) => (
                  <Badge key={x.field} size="xs" variant="outline">
                    {x.field}
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
