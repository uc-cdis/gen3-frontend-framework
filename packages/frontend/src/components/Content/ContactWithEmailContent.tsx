import React from 'react';
import { Anchor } from '@mantine/core';
import { twMerge } from 'tailwind-merge';

export interface TextContentProps {
  readonly text: string | string[];
  readonly email?: string;
  readonly className?: string;
}

const DEFAULT_STYLE =
  'inline color-ink font-medium margin-block-start-1 margin-block-end-1';

const ContactWithEmailContent = ({
  text,
  email,
  className,
}: TextContentProps) => {
  const mergedClassname = className
    ? twMerge(DEFAULT_STYLE, className)
    : DEFAULT_STYLE;
  const textString = Array.isArray(text) ? text.join(' ') : text;
  // TODO: add better support for classnames
  return (
    <div className={mergedClassname}>
      <span>
        {textString}
        {email && (
          <Anchor
            classNames={{ root: mergedClassname }}
            href={`mailto:${email}`}
          >{` ${email}.`}</Anchor>
        )}
      </span>
    </div>
  );
};

export default ContactWithEmailContent;
