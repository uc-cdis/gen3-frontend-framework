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
    <div className="flex flex-wrap gap-3 mt-3">
      {title}
      <Button
        onClick={() => alert(JSON.stringify(data))}
        variant="outline"
        size="md"
      >
        Download
      </Button>
    </div>
  );
};
export default StandaloneDataDownloadButton;
