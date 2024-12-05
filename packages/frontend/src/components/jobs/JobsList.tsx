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
  selectSowerJobs,
  useGetSowerJobsStatusQuery,
} from '@gen3/core';
import { ErrorCard } from '../MessageCards';

interface JobsListProps {
  size?: string;
}

const JobsList: React.FC<JobsListProps> = ({ size = 'sm' }) => {
  const jobIds = useCoreSelector(selectSowerJobs);
  // const idsArray = Object.keys(jobIds);
  // const {
  //   data: jobStatuses,
  //   isLoading,
  //   isError,
  // } = useGetSowerJobsStatusQuery(idsArray, {
  //   skip: idsArray.length === 0,
  // });

  console.log('jobIds', jobIds);

  if (Object.keys(jobIds).length === 0) {
    return (
      <Paper p="md">
        <Text>No Active Jobs</Text>
      </Paper>
    );
  }

  // if (isError) {
  //   return (
  //     <Paper p="md">
  //       <ErrorCard message="Error retrieving jobs" />
  //     </Paper>
  //   );
  // }

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        {Object.values(jobIds).map((jobStatus) => {
          const { jobId, name, status } = jobStatus;
          return (
            <Group key={jobId} justify="space-between">
              <Stack gap={0}>
                <Text size={size} fw={500}>
                  {name || 'Unknown Job'}
                </Text>
                <Text size="xs" c="dimmed">
                  {jobId}
                </Text>
              </Stack>
              <Badge
                size={size}
                color={
                  status === 'Running'
                    ? 'blue'
                    : status === 'Completed'
                      ? 'green'
                      : status === 'Failed'
                        ? 'red'
                        : 'gray'
                }
              >
                {status || 'Unknown'}
              </Badge>
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default JobsList;
