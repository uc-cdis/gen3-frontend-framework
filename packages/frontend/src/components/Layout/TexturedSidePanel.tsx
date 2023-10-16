import React from 'react';
import { Box } from '@mantine/core';

interface TexturedSidePanelProps {
  readonly url?: string;
}
const TexturedSidePanel = ({ url }: TexturedSidePanelProps) => {

  return (
    <div
      style={{ backgroundImage: `url(${url})` }}
      className="flex p-4g ap-4 h-screen w-full"
    ></div>
  );
};

export default TexturedSidePanel;
