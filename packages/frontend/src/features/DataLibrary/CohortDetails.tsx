import React from 'react';
import { CohortItem } from '@gen3/core';
import { Group, Stack, Text } from '@mantine/core';
import ErrorCard from '../../components/ErrorCard';

const CohortDetails: React.FC<CohortItem> = ({
  name,
  schemaVersion,
  index,
  data,
  id,
}) => {
  if (!data) {
    return <ErrorCard message="No cohort query" />;
  }

  return (
    <Stack gap="xs">
      <Group>
        <Text>{name}</Text>
        <Group>
          <Text fw={500}>Index: </Text>
          <Text>{index}</Text>
        </Group>
        <Group>
          <Text fw={500}>Schema Version: </Text>
          <Text>{schemaVersion}</Text>
        </Group>
        <Group>
          <Text fw={500}>ID: </Text>
          <Text>{id}</Text>
        </Group>
      </Group>
    </Stack>
  );
};

export default CohortDetails;
