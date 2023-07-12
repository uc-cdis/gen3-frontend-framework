import React from 'react';
import Link from 'next/link';
import { PropsWithChildren } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

interface ClassProps {
  readonly className?: string;
}

interface Gen3LinkProps extends ClassProps {
  readonly href: string;
  readonly linkType?: string;
  readonly text: string;
  readonly showExternalIcon?: boolean;
}

const Gen3Link: React.FC<Gen3LinkProps> = ({
  className,
  href,
  linkType,
  text,
  showExternalIcon = false,
}: PropsWithChildren<Gen3LinkProps>) => {
  const portalBasename =
    process.env.NEXT_PUBLIC_PORTAL_BASENAME &&
    process.env.NEXT_PUBLIC_PORTAL_BASENAME !== '/'
      ? process.env.NEXT_PUBLIC_PORTAL_BASENAME
      : '';
  if (linkType === 'gen3ff') {
    return (
      <span className={className}>
        <Link href={href}>{text}</Link>
      </span>
    );
  } else if (linkType === 'portal') {
    return (
      <a
        className={className}
        href={`${portalBasename}${href}`}
        target="_parent"
      >
        {text}
      </a>
    );
  }
  // external link
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {showExternalIcon ? (
        <FaExternalLinkAlt className="pr-1" title="External Link" />
      ) : null}
      {text}
    </a>
  );
};

export default Gen3Link;
