import { Group, Text, Stack, Badge, Paper } from '@mantine/core';
import {
  useCoreSelector,
  selectSowerJobIds,
  useGetSowerJobsStatusQuery,
} from '@gen3/core';

const JobsList = () => {
  const jobIds = useCoreSelector(selectSowerJobIds);
  const idsArray = Array.from(jobIds);
  const { data: jobStatuses } = useGetSowerJobsStatusQuery(idsArray, {
    skip: idsArray.length === 0,
  });

  if (idsArray.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text>No Active Jobs</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        {idsArray.map((id) => {
          const job = jobStatuses?.[id];
          return (
            <Group key={id} justify="space-between">
              <Stack gap={0}>
                <Text size="sm" fw={500}>
                  {job?.name || 'Unknown Job'}
                </Text>
                <Text size="xs" c="dimmed">
                  {id}
                </Text>
              </Stack>
              <Badge
                color={
                  job?.status === 'Running'
                    ? 'blue'
                    : job?.status === 'Completed'
                      ? 'green'
                      : job?.status === 'Failed'
                        ? 'red'
                        : 'gray'
                }
              >
                {job?.status || 'Unknown'}
              </Badge>
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default JobsList;
