import React, { FC } from 'react';
import Image from 'next/image';
import {
  FooterColumnProps,
  FooterRow,
  FooterLink,
  FooterLogo,
  FooterText,
  FooterLinks,
  FooterSectionProps,
  getFooterType,
} from './types';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { extractClassName } from '../utils';

// Component for rendering a single row in the column
const FooterRowComponent: React.FC<FooterRow> = (row) => {
  switch (getFooterType(row)) {
    case 'FooterText': {
      const text = row as FooterText;
      return <p className={text?.className}> {text.text}</p>;
    }

    case 'FooterLink': {
      const link = row as FooterLink;
      return (
        <React.Fragment key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={link?.className}
          >
            {link.text ? link.text : link.href}
          </a>
        </React.Fragment>
      );
    }

    case 'FooterLinks': {
      const links = row as FooterLinks;
      return (
        <div
          className={`flex flex-no-wrap space-x-4 ${links?.className ?? ''}`}
        >
          {links?.links.map((link, i) => {
            return (
              <React.Fragment key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link?.className}
                >
                  {link.text ? link.text : link.href}
                </a>
                {i !== links?.links.length - 1 && (
                  <span className="mx-1">|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
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
          className={logo?.className}
        />
      );
    }
    case 'FooterSection': {
      const section = row as FooterSectionProps;
      return (
        <FooterSection
          columns={section.columns}
          className={section?.className}
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
  rowItem: '',
};

const FooterColumn: React.FC<FooterColumnProps> = ({
  heading,
  rows,
  classNames = {},
}: FooterColumnProps) => {
  const mergedClassNames = mergeDefaultTailwindClassnames(
    FooterColumnTwDefaultStyles,
    classNames,
  );

  const rowItem = extractClassName('rowItem', mergedClassNames);
  return (
    <div className={extractClassName('root', mergedClassNames)}>
      {heading && (
        <h1 className={extractClassName('heading', mergedClassNames)}>
          {heading}
        </h1>
      )}

      {rows?.map((item, index) => {
        return (
          <FooterRowComponent
            key={`footer-row-${index}`}
            {...{ ...item, className: item.className ?? rowItem }}
          />
        );
      })}
    </div>
  );
};

const FooterSection: React.FC<FooterSectionProps> = ({
  columns,
  className = undefined,
}: FooterSectionProps) => {
  return (
    <div className={`${className ?? 'flex items-center justify-center'}`}>
      {columns?.map((col, index) => (
        <FooterColumn key={`column-${index}`} {...col} />
      ))}
    </div>
  );
};

export default FooterSection;

//export default React.memo(FooterSection);
