import React, { useState } from 'react';
import { Button, FileButton, Tooltip } from '@mantine/core';
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
      {(props) => (
        <Tooltip label={tooltip} disabled={!tooltip}>
          <Button
            {...props}
            loading={processingFile}
            variant="outline"
            classNames={{ root: 'bg-base-max' }}
          >
            <Icon icon={icon} height="1.5rem"></Icon>
          </Button>
        </Tooltip>
      )}
    </FileButton>
  );
};

export default UploadJSONButton;
