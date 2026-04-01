import { JSONObject } from '@gen3/core';
import React from 'react';

import { Button } from '@mantine/core';

interface StandaloneDataDownloadButtonProps {
  readonly data: JSONObject;
}

const StandaloneDataDownloadButton = ({
  data,
}: StandaloneDataDownloadButtonProps) => {
  return (
    <div className="flex flex-wrap gap-3 mt-3">
      BUTTON LABEL:
      <Button
        onClick={() => alert('called on click here')}
        variant="outline"
        size="md"
      >
        Download
      </Button>
    </div>
  );
};
export default StandaloneDataDownloadButton;
