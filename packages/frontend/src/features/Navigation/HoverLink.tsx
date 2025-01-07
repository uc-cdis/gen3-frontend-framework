import React from 'react';
import Link from 'next/link';

interface ClassProps {
  readonly className?: string;
}

interface HoverLinkProps extends ClassProps {
  children?: React.ReactNode;
  href: string;
  noBasePath?: boolean;
}

/**
 * Component representing a hoverable link.
 *
 * @param {Object} props - The properties of the HoverLink component.
 * @param {string} props.className - The class name for the wrapping span element.
 * @param {string} props.href - The URL of the link.
 * @param {ReactNode} props.children - The content of the link.
 * @returns {ReactElement} - The rendered HoverLink component.
 */
const HoverLink = ({
  className,
  href,
  noBasePath,
  children,
}: HoverLinkProps) => {
  if (noBasePath)
    return (
      <span className={className}>
        <a href={href}>{children}</a>
      </span>
    );

  return (
    <span className={className}>
      <Link href={href} passHref>
        {children}
      </Link>
    </span>
  );
};

export default HoverLink;
