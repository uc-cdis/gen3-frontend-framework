import { Paper, LoadingOverlay, Text, Loader } from '@mantine/core';

interface CountsValueProps {
  readonly label: string;
  readonly counts?: number;
  readonly isSuccess: boolean;
}

const CountsValue = ({ label, isSuccess, counts }: CountsValueProps) => {
  const adjustedLabel = counts !== 1 ? label : label.slice(0, -1);
  return (
    <div className="mr-4">
      <Paper
        shadow="xs"
        p="xs"
        withBorder
        className="flex items-center nowrap bg-primary text-primary-contrast font-heading text-md font-semibold overflow-ellipsis"
      >
        {counts === undefined ? (
          <>
            <Loader
              data-testid="loading-spinner-cohort-case-count"
              color="gray"
              size="xs"
              className="mr-2"
            />
            {adjustedLabel}
          </>
        ) : (
          <Text>
            {counts.toLocaleString()} {adjustedLabel}
          </Text>
        )}
      </Paper>
    </div>
  );
};

export default CountsValue;
