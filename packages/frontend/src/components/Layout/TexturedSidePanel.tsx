import React from 'react';
import { Box } from '@mantine/core';

interface TexturedSidePanelProps {
  readonly url?: string;
}
const TexturedSidePanel = ({ url }: TexturedSidePanelProps) => {
  return (
    <Box
      styles={{ backgroundImage: url }}
      className="bg-primary-light flex p-4g ap-4 h-screen w-min-48 justify-center sticky"
    ></Box>
  );
};

export default TexturedSidePanel;
