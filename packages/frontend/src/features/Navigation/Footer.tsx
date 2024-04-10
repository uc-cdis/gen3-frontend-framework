import React from 'react';
import Image from 'next/image';
import Gen3Link from './Gen3Link';
import { FooterProps } from './types';
import { extractClassName } from './utils';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';

const Footer = ({
  bottomLinks,
  columnLinks,
  footerLogos,
  footerRightLogos,
  classNames = {},
}: FooterProps) => {

  const classNamesDefaults = {
    root: 'bg-primary-lighter text-primary-contrast p-4 shadow-sm',
  };

  const mergedClassNames= mergeDefaultTailwindClassnames(classNamesDefaults, classNames);

  return (
    <footer>
      <div className={extractClassName('root',mergedClassNames )}>
        <div className="flex justify-end">
          {(footerLogos || [[]]).map((col, index) => {
            return (
              <div
                key={`footer-col-${index}`}
                className={`flex flex-row gap-x-3 mr-8 ${
                  col.length > 1 ? 'justify-between' : ''
                }`}
              >
                {col.map((logo) => (
                  <Image
                    className="object-none"
                    key={`icons-${logo.logo}`}
                    src={`${logo.logo}`}
                    width={logo.width}
                    height={logo.height}
                    alt={logo.description}
                  />
                ))}
              </div>
            );
          })}
          <div className="flex w-[100%] pl-10 pt-3">
            {(columnLinks || []).map(({ heading, items }, i) => (
              <div className="flex flex-col pl-10" key={i}>
                <h1 className="font-bold text-xl text-white font-heading">
                  {heading}
                </h1>
                {(items || []).map(({ text, href, linkType }, j) => {
                  const attrs = {
                    className: `${
                      href && 'heal-link-footer'
                    } font-medium text-sm p-[2px] text-white font-content`,
                    key: j,
                  };
                  if (href) {
                    return (
                      <div {...attrs} key={href}>
                        <Gen3Link href={href} linkType={linkType} text={text} />
                      </div>
                    );
                  } else {
                    return (
                      <span {...attrs} key={href}>
                        {text}
                      </span>
                    );
                  }
                })}
              </div>
            ))}
          </div>
        </div>
        {(footerRightLogos || [[]]).map((col, index) => {
          return (
            <div
              key={`footer-col-${index}`}
              className={`flex gap-x-6 mr-8 ${
                col.length > 1 ? 'justify-end' : ''
              }`}
            >
              {col.map((logo) => (
                <Image
                  key={`icons-${logo.logo}`}
                  src={`${logo.logo}`}
                  width={logo.width}
                  height={logo.height}
                  alt={logo.description}
                />
              ))}
            </div>
          );
        })}
      </div>
      {bottomLinks && bottomLinks.length > 0 ? (
        <div className="pt-[4px] m-1 text-right text-xs text-white font-content">
          {bottomLinks.map((link, i) => (
            <React.Fragment key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="heal-link-footer"
              >
                {link.text ? link.text : link.href}
              </a>
              {i !== bottomLinks.length - 1 && <span className="mx-1">|</span>}
            </React.Fragment>
          ))}
        </div>
      ) : null}
    </footer>
  );
};

export default Footer;
