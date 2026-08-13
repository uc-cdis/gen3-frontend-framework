import { JSONObject } from '@gen3/core';
import React from 'react';

import { Button } from '@mantine/core';

interface StandaloneDataDownloadButtonProps {
  title: string;
  readonly data: JSONObject;
}

const StandaloneDataDownloadButton = ({
  title,
  data,
}: StandaloneDataDownloadButtonProps) => {
  return (
    <div className="flex items-center gap-3 mt-3 pb-3 border-b border-gray-300">
      <div className="flex-1">{title}</div>
      <Button
        onClick={() => alert(JSON.stringify(data))}
        variant="outline"
        size="md"
      >
        Download
      </Button>
      <hr />
    </div>
  );
};
export default StandaloneDataDownloadButton;
