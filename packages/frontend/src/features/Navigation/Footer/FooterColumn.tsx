import React, { FC } from 'react';
import Image from 'next/image';
import {
  FooterColumn,
  FooterRow,
  FooterLink,
  FooterLogo,
  FooterText,
  getFooterType,
} from './types';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { extractClassName } from '../utils';

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
          layout="fixed"
        />
      );
    }
    default:
      return null;
  }
};

const FooterColumnTwDefaultStyles = {
  root: 'flex flex-col px-2 justify-start',
  heading: 'font-bold text-xl text-white font-heading',
};

const FooterColumnComponent: React.FC<FooterColumn> = ({
  heading,
  items,
  classNames = {},
}: FooterColumn) => {
  const mergedClassNames = mergeDefaultTailwindClassnames(
    FooterColumnTwDefaultStyles,
    classNames,
  );

  console.log('nergedClassNames', mergedClassNames);

  return (
    <div className={extractClassName('root', mergedClassNames)}>
      {heading && (
        <p className={extractClassName('heading', mergedClassNames)}>
          {heading}
        </p>
      )}
      {items?.map((item, index) => (
        <FooterRowComponent key={`footer-row-${index}`} {...item} />
      ))}
    </div>
  );
};

export default FooterColumnComponent;
