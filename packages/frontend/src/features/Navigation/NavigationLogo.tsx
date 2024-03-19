import { NavigationBarLogo } from './types';
import HoverLink from './HoverLink';
import Image from 'next/image';
import React from 'react';

const NavigationLogo = ({
  src,
  title,
  description,
  basePath = '',
}: NavigationBarLogo) => {
  return (
    <div className="relative flex h-full justify-start items-center align-middle font-heading font-bold tracking-wide text-xl ml-[5px] mr-[20px]">
      <HoverLink className="relative w-96 h-full" href="/">
        <Image
          className="pr-3 object-contain"
          fill
          src={`${basePath}${src}`}
          alt={description ?? title}
        />
      </HoverLink>
      {title && (
        <div className="border-solid border-base-darker border-l-1 ml-1 mr-3 h-32 w-1 ">
          <HoverLink
            className="font-heading h3-typo pt-2 text-ink-dark hover:text-ink-darkest hover:border-accent hover:border-b-3"
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
