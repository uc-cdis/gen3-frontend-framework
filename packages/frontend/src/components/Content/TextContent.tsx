import React from 'react';
export interface TextContentProps {
  readonly text: string;
  readonly className?: string;
}
const TextContent = ({
  text,
  className = 'font-heading color-ink font-medium',
}: TextContentProps) => {
  return (
    <div className={className}>
      <p>{text}</p>
    </div>
  );
};

export default TextContent;
