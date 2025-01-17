import React, { useState } from 'react';
import { Button, FileButton, Loader, Tooltip } from '@mantine/core';
import { Icon } from '@iconify/react';

interface UploadJSONButtonProps {
  handleFileChange: (data: string) => void;
  icon?: string;
  tooltip?: string;
}

const UploadJSONButton: React.FC<UploadJSONButtonProps> = ({
  handleFileChange,
  tooltip,
  icon = 'gen3:upload',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [processingFile, setProcessingFile] = useState(false);

  return (
    <FileButton
      onChange={async (file) => {
        if (file !== null) {
          setProcessingFile(true);
          setFile(file);
          const contents = await file.text();
          handleFileChange(contents);
          setProcessingFile(false);
        }
      }}
      accept="application/json"
    >
      {() => (
        <Tooltip label={tooltip} disabled={!tooltip}>
          <Button
            loading={processingFile}
            variant="subtle"
            classNames={{ root: 'bg-base-max w-[48px] h-[48px] p-0' }}
          >
            <Icon icon={icon} width="2rem" height="2rem"></Icon>
          </Button>
        </Tooltip>
      )}
    </FileButton>
  );
};

export default UploadJSONButton;
