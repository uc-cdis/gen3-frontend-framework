import { Card, Text, Stack, Badge } from '@mantine/core';
import { CoreState, selectAllJobs, useCoreSelector } from '@gen3/core';

export default function JobList() {
  const jobs = useCoreSelector((state: CoreState) => selectAllJobs(state));

  return (
    <Stack>
      {jobs.map((job) => (
        <Card key={job.uid} shadow="sm" padding="lg">
          <Text size="lg" fw={500}>
            Job {job.uid}
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
