import React from 'react';
import hash from 'stable-hash';

export enum ContentType {
  Text = 'text',
  TextArray = 'textArray',
  Html = 'html',
}

export interface TextContentProps {
  readonly text: string | string[];
  readonly className?: string;
  readonly type?: ContentType;
}
const TextContent = ({
  text,
  className = 'font-heading color-ink font-medium',
  type = ContentType.Text,
}: TextContentProps) => {
  switch (type) {
    case ContentType.Html: {
      const textString = Array.isArray(text) ? text.join('') : text;
      return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: textString }}
        />
      );
    }
      case ContentType.TextArray: {
        const textArray = !Array.isArray(text) ? [text] : text;
        return (
          <div className={className}>
            {textArray.map((item) => (
              <p key={hash(item)}>{item}</p>
            ))}
          </div>
        );
      }
    case ContentType.Text:
    default:
      return (
        <div className={className}>
          <p>{text}</p>
        </div>
      );
  }
};

export default TextContent;
