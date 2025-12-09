import React from 'react';
import { Image, NavLink, Stack } from '@mantine/core';
import TextDescription from './TextDescription';
import Link from 'next/link';
import { AnalysisToolConfiguration } from './types';
import NextImage from 'next/image';

const AnalysisCard: React.FC<AnalysisToolConfiguration> = ({
  title,
  description,
  type,
  icon,
  image,
  hasDemo,
  loginRequired,
  href,
  demoHref,
  btnText,
}) => {
  return (
    <Stack
      key={title}
      align="stretch"
      justify="space-between"
      className="rounded-sm rounded-t-md bg-base-max p-0 h-full"
    >
      <div className="relative h-4/5">
        <div className="p-0 h-max-1/3 h-1/3 flex justify-center items-center relative overflow-hidden">
          <Image
            src={`${image}`}
            alt={`${title} image`}
            height={500}
            classNames={{
              root: 'rounded-tl-lg rounded-tr-lg',
            }}
          />
        </div>
        <div className="flex -mt-5 relative z-10">
          <div className="p-0.5 bg-base-lightest ml-5 border-2 border-base h-1/6 w-1/6 max-h-24 max-w-24">
            <Image
              component={NextImage}
              src={`${icon}`}
              alt=""
              width={40}
              height={40}
              radius="lg"
            />
          </div>
          <div className="relative mb-0 ml-2">
            <span className="absolute bottom-0 left-0 text-sm font-normal text-gray-700 w-max capitalize">
              {type}
            </span>
          </div>
        </div>
        <div className="flex flex-col mt-2 ml-2">
          <div className="w-full justify-start text-base-contrast-max sm:text-lg md:text-xl lg:text-2xl font-bold leading-6">
            {title}
          </div>
          <div className="text-xs text-gray-400 h-6">
            {loginRequired ? 'Login Required' : ' '}
          </div>
          <div className="sm:text-xs text-sm font-normal p-2">
            <TextDescription description={description} />
          </div>
        </div>
      </div>
      <div className="m-auto">
        <div className="flex mb-4 rounded-b-md mx-4 flex-nowrap justify-between gap-x-2">
          <NavLink
            component={Link}
            href={href ?? '_blank'}
            classNames={{
              root: 'bg-accent text-accent-contrast text-nowrap text-center hover:bg-accent-darker p-2 rounded',
              label: 'text-sm font-semibold px-2',
            }}
            label={
              btnText
                ? btnText
                : `Run ${type === 'application' ? 'App' : 'Notebook'}`
            }
          />
          {hasDemo && (
            <NavLink
              component={Link}
              href={demoHref ?? '_blank'}
              rel="noopener noreferrer"
              target="_blank"
              classNames={{
                root: 'bg-accent text-accent-contrast text-nowrap text-center hover:bg-accent-darker p-2 rounded',
                label: 'text-sm font-semibold px-2',
              }}
              label="Demo"
            />
          )}
        </div>
      </div>
    </Stack>
  );
};

export default AnalysisCard;
