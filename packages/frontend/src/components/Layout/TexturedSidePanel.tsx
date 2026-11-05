import React from 'react';

interface TexturedSidePanelProps {
  readonly url?: string;
}
const TexturedSidePanel = ({ url }: TexturedSidePanelProps) => {
  return (
    <div
      aria-hidden="true"
      style={{ backgroundImage: `url(${url})` }}
      className="bg-contain flex h-full w-full bg-repeat-y last:-scale-x-100"
    />
  );
};

export default TexturedSidePanel;
