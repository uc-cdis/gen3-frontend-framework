import React, { ReactNode } from 'react';

interface NewTabLinkProps {
  href: string;
  children: ReactNode;
}

const NewTabLink: React.FC<NewTabLinkProps> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export default NewTabLink;
