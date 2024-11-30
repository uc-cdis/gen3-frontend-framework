import {
  Group,
  Text,
  Stack,
  Badge,
  Paper,
  LoadingOverlay,
} from '@mantine/core';
import {
  useCoreSelector,
  selectSowerJobIds,
  useGetSowerJobsStatusQuery,
} from '@gen3/core';
import { ErrorCard } from '../MessageCards';

interface JobsListProps {
  size?: string;
}

const JobsList: React.FC<JobsListProps> = ({ size = 'sm' }) => {
  const jobIds = useCoreSelector(selectSowerJobIds);
  const idsArray = Array.from(jobIds);
  const {
    data: jobStatuses,
    isLoading,
    isError,
  } = useGetSowerJobsStatusQuery(idsArray, {
    skip: idsArray.length === 0,
  });

  if (idsArray.length === 0) {
    return (
      <Paper p="md">
        <Text>No Active Jobs</Text>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper p="md">
        <ErrorCard message="Error retrieving jobs" />
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <LoadingOverlay visible={isLoading} />
        {idsArray.map((id) => {
          const job = jobStatuses?.[id];
          return (
            <Group key={id} justify="space-between">
              <Stack gap={0}>
                <Text size={size} fw={500}>
                  {job?.name || 'Unknown Job'}
                </Text>
                <Text size="xs" c="dimmed">
                  {id}
                </Text>
              </Stack>
              <Badge
                size={size}
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
