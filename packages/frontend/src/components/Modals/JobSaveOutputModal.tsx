import type { ContextModalProps } from '@mantine/modals';
import { Button, Text } from '@mantine/core';
import React, { useEffect } from 'react';
import { useLazyGetSowerOutputQuery } from '@gen3/core';

const DEFAULT_MESSAGE =
  "Your download has been prepared. If your download doesn't start automatically, please click this link";

export interface JobFileSaveModelProps {
  jobId: string;
  message?: string;
}

export const JobSaveOutputModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<JobFileSaveModelProps>) => {
  const [getOutput, outputResponse] = useLazyGetSowerOutputQuery();

  useEffect(() => {
    if (outputResponse.isSuccess && !outputResponse.isFetching) {
      window.open(outputResponse.data.output, '_blank');
    }
  }, [outputResponse]);

  const { message = DEFAULT_MESSAGE, jobId } = innerProps;

  // state the download
  void getOutput(jobId);
  return (
    <div className="flex flex-col items-center justify-center">
      <Text size="md"> {message}</Text>
      <Button onClick={() => getOutput(jobId)}>Download</Button>
    </div>
  );
};
