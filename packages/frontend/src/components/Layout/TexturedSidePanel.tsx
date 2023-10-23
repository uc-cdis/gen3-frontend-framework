import React from 'react';
import { Box } from '@mantine/core';

interface TexturedSidePanelProps {
  readonly url?: string;
}
const TexturedSidePanel = ({ url }: TexturedSidePanelProps) => {

  return (
    <div
      style={{ backgroundImage: `url(${url})` }}
      className="flex h-screen w-full first:bg-left last:bg-right bg-repeat-y"
    ></div>
  );
};

export default TexturedSidePanel;
