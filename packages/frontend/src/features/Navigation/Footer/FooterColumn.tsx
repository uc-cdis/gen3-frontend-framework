import React, { FC } from 'react';
import Image from 'next/image';
import { FooterLink, FooterLogo, FooterText, getFooterType } from './types';

type FooterRow = FooterLogo | FooterText | FooterLink;

interface FooterColumn {
  heading?: string;
  rows: Array<FooterRow>;
  classNames?: Record<string, string>;
}

// Component for rendering a single row in the column
const FooterRowComponent: React.FC<FooterRow> = (row) => {
  switch (getFooterType(row)) {
    case 'FooterText': {
      const text = row as FooterText;
      return <p> {text.text}</p>;
    }

    case 'FooterLink': {
      const link = row as FooterLink;
      return (
        <React.Fragment key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="heal-link-footer"
          >
            {link.text ? link.text : link.href}
          </a>
        </React.Fragment>
      );
    }

    case 'FooterLogo': {
      const logo = row as FooterLogo;
      return (
        <Image
          key={`icons-${logo.logo}`}
          src={`${logo.logo}`}
          width={logo.width}
          height={logo.height}
          alt={logo.description}
        />
      );
    }
    default:
      return null;
  }
};

const FooterColumnComponent: React.FC<FooterColumn> = ({
  heading,
  rows,
  classNames,
}: FooterColumn) => {
  return (
    <div className="footer-column">
      {rows.map((item, index) => (
        <FooterRowComponent key={index} {...item} />
      ))}
    </div>
  );
};

export default FooterColumnComponent;
