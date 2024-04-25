import { Anchor } from '@mantine/core';
import { hashCode } from '../../utils/hash';
import React from 'react';

export interface TextContentProps {
  readonly text: string | string[];
  readonly email?: string;
  readonly className?: string;
}

const ContactWithEmailContent = ({
  text,
  email,
  className = 'inline color-ink font-medium margin-block-start-1 margin-block-end-1',
}: TextContentProps) => {
  const textString = Array.isArray(text) ? text.join(' ') : text;
  return (
    <div className={className}>
      <span>
        {textString}
        {email && <Anchor href={`mailto:${email}`}>{` ${email}.`}</Anchor>}
      </span>
    </div>
  );
};

export default ContactWithEmailContent;
