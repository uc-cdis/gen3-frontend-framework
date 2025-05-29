import React from 'react';
import { Card, Text, Stack, Badge, LoadingOverlay } from '@mantine/core';
import { useCoreSelector, selectSowerJobList } from '@gen3/core';

export default function JobList() {
  const { jobs } = useCoreSelector(selectSowerJobList);

  return (
    <Stack>
      {Object.values(jobs).map((job) => (
        <Card key={job.jobId} shadow="sm" padding="lg">
          <Text size="lg" fw={500}>
            Job {job.jobId}
          </Text>
          <Badge
            color={
              job.status === 'Completed'
                ? 'green'
                : job.status === 'Failed'
                  ? 'red'
                  : 'blue'
            }
          >
            {job.status}
          </Badge>
        </Card>
      ))}
    </Stack>
  );
}
