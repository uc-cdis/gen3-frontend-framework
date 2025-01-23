import { NavigationBarLogo } from './types';
import HoverLink from './HoverLink';
import Image from 'next/image';
import React from 'react';
import { extractClassName } from './utils';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';

const NavigationLogo = ({
  src,
  title,
  description,
  width,
  height,
  divider = false,
  noBasePath = undefined,
  classNames = {},
}: NavigationBarLogo) => {
  const classNamesDefaults = {
    root: 'relative flex py-0 justify-start items-center align-middle font-heading font-bold tracking-wide text-xl ml-[5px] mr-[20px]',
    link: 'relative object-contain',
    logo: 'px-3',
    title: 'border-solid border-base-darker ml-1 mr-3',
    divider:
      'border-solid border-gen3-smoke border-l-1 ml-[2px] mr-[7px] h-[64px] w-1',
    titleLink:
      'font-heading text-md pt-2 text-ink-dark hover:text-ink-darkest hover:border-accent hover:border-b-3',
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  return (
    <div
      className={extractClassName('root', mergedClassnames)}
      role="navigation"
    >
      <HoverLink
        className={extractClassName('link', mergedClassnames)}
        href="/"
        noBasePath={noBasePath}
      >
        <Image
          className={extractClassName('logo', mergedClassnames)}
          width={width ?? undefined}
          height={height ?? undefined}
          fill={!width && !height}
          src={`${src}`}
          alt={description ?? title ?? 'link back to homepage'}
        />
      </HoverLink>
      {divider && (
        <div className={extractClassName('divider', mergedClassnames)} />
      )}
      {title && (
        <div
          className={extractClassName('title', mergedClassnames)}
          role="navigation"
        >
          <HoverLink
            className={extractClassName('titleLink', mergedClassnames)}
            href={'/'}
          >
            {title}
          </HoverLink>
        </div>
      )}
    </div>
  );
};

export default NavigationLogo;
