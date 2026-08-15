import React from 'react';
import { Badge, Group, Text } from '@mantine/core';

type FieldLinkCountBadgeProps = {
  fieldsCount: number;
  linksCount?: number;
};

const FieldLinkCountBadge = ({
  fieldsCount,
  linksCount,
}: FieldLinkCountBadgeProps) => {
  return (
    <Group gap="xs">
      <Badge color="accent.1" variant="light" radius="sm">
        <Text span size="xs" fw={400}>
          {fieldsCount} {fieldsCount === 1 ? 'field' : 'fields'}
        </Text>
      </Badge>

      {linksCount && (
        <Badge color="accent.1" variant="light" radius="sm">
          <Text span size="xs" fw={400}>
            {linksCount} {linksCount === 1 ? 'link' : 'links'}
          </Text>
        </Badge>
      )}
    </Group>
  );
};

export default FieldLinkCountBadge;
