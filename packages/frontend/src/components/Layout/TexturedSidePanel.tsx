import React from 'react';
import { Box } from '@mantine/core';

interface TexturedSidePanelProps {
  readonly url?: string;
}
const TexturedSidePanel = ({ url }: TexturedSidePanelProps) => {

  return (
    <div
      style={{ backgroundImage: `url(${url})` }}
      className="flex h-screen w-full bg-left bg-repeat-y last:-scale-x-100"
    ></div>
  );
};

export default TexturedSidePanel;
