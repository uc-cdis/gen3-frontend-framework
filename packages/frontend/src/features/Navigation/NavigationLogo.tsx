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
  basePath = '',
  classNames = {},
}: NavigationBarLogo) => {
  const classNamesDefaults = {
    root: 'relative flex h-full py-2 justify-start items-center align-middle font-heading font-bold tracking-wide text-xl ml-[5px] mr-[20px]',
    link: 'relative w-96 h-full',
    title: 'border-solid border-base-darker border-l-1 ml-1 mr-3 h-32 w-1',
    titleLink:
      'font-heading h3-typo pt-2 text-ink-dark hover:text-ink-darkest hover:border-accent hover:border-b-3',
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(classNamesDefaults, classNames);

  return (
    <div className={extractClassName('root', mergedClassnames)}>
      <HoverLink className={extractClassName('link', mergedClassnames)} href="/">
        <Image
          className="pr-3 object-contain"
          fill
          src={`${basePath}${src}`}
          alt={description ?? title}
        />
      </HoverLink>
      {title && (
        <div className={extractClassName('title', mergedClassnames)}>
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
