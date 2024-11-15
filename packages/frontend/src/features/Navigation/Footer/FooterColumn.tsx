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
} from './types';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { extractClassName } from '../utils';
import { extractObjectKey } from '../../../utils/values';

interface FooterRowComponentProps {
  item: Record<string, FooterRow>;
  rowClassname?: string;
}

// Component for rendering a single row in the column
// TODO: replace with a renderer factory
const FooterRowComponent: React.FC<FooterRowComponentProps> = ({
  item,
  rowClassname,
}) => {
  const itemType = extractObjectKey(item);
  if (!itemType) return null;

  const className = item[itemType].className ?? rowClassname;

  switch (itemType) {
    case 'Label': {
      const text = item[itemType] as FooterText;
      return <p className={className}> {text.text}</p>;
    }

    case 'Link': {
      const link = item[itemType] as FooterLink;
      return (
        <React.Fragment key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {link.text ? link.text : link.href}
          </a>
        </React.Fragment>
      );
    }

    case 'Links': {
      const links = item[itemType] as FooterLinks;
      return (
        <div className={`flex flex-no-wrap space-x-4 ${className ?? ''}`}>
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

    case 'Icon': {
      const logo = item[itemType] as FooterLogo;
      return (
        <Image
          key={`icons-${logo.logo}`}
          src={`${logo.logo}`}
          width={logo.width}
          height={logo.height}
          alt={logo.description}
          className={className}
        />
      );
    }
    case 'Section': {
      const section = item[itemType] as FooterSectionProps;
      return <FooterSection columns={section.columns} className={className} />;
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

  const rowClassname = extractClassName('rowItem', mergedClassNames);
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
            item={item}
            rowClassname={rowClassname}
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

export default React.memo(FooterSection);
