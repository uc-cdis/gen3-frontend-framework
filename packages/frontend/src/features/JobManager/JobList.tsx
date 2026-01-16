import React from 'react';
import { Badge, Card, Stack, Text } from '@mantine/core';
import {
  CoreState,
  JobWithActions,
  selectSowerJobs,
  useCoreSelector,
} from '@gen3/core';

const JobList = () => {
  const jobs = useCoreSelector((state: CoreState) => selectSowerJobs(state));

  return (
    <Stack>
      {Object.values(jobs).map((job: JobWithActions) => (
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
};

export default JobList;
