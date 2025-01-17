import React, { useState } from 'react';
import { Button, Tooltip } from '@mantine/core';
import { Icon } from '@iconify/react';

interface JsonFileSaverProps {
  getData: () => object;
  filename?: string;
  label?: string;
  tooltip?: string;
  icon?: string;
  disabled?: boolean;
}

const JSONObjectDownloadButton: React.FC<JsonFileSaverProps> = ({
  getData,
  filename = 'data.json',
  icon = 'gen3:download',
  disabled = false,
  tooltip,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const saveToJSONFile = async () => {
    setIsDownloading(true);

    try {
      const data = getData();
      // Create blob from JSON data
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      // Create URL for the blob
      const url = URL.createObjectURL(blob);

      // Create temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Append to document, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Tooltip label={tooltip} disabled={!tooltip}>
      <Button
        variant="subtle"
        onClick={saveToJSONFile}
        disabled={isDownloading || disabled}
        loading={isDownloading}
        classNames={{ root: 'bg-base-max w-[48px] h-[48px] p-0' }}
      >
        <Icon icon={icon} width="2rem" height="2rem"></Icon>
      </Button>
    </Tooltip>
  );
};

export default JSONObjectDownloadButton;
