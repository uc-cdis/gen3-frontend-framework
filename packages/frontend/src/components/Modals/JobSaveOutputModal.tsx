import type { ContextModalProps } from '@mantine/modals';
import { Button, Text } from '@mantine/core';
import React, { useCallback } from 'react';
import { isValidUrl } from '../../utils/isUrl';

const DEFAULT_MESSAGE =
  "Your download has been prepared. If your download doesn't start automatically, please click this link";

export interface JobFileSaveModelProps {
  output?: string;
  message?: string;
  guid?: string;
}

export const JobSaveOutputModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<JobFileSaveModelProps>) => {
  const { message = DEFAULT_MESSAGE, output } = innerProps;

  const outputIsUrl = output !== undefined && isValidUrl(output);
  // a non-URL output is a message to show the user
  const currentMessage =
    output !== undefined && !outputIsUrl ? output : message;

  // open the download link when it arrives
  const handleDownloadFile = useCallback(() => {
    if (output !== undefined && outputIsUrl)
      window.open(output, '_blank', 'noopener,noreferrer');
  }, [output, outputIsUrl]);

  return (
    <div className="flex flex-col items-center justify-center">
      <Text size="md"> {currentMessage}</Text>
      <Button onClick={() => handleDownloadFile()}>Download</Button>
    </div>
  );
};
