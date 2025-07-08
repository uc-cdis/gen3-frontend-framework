import React from 'react';
import { Image, NavLink, Stack } from '@mantine/core';
import NextImage from 'next/image';
import TextDescription from './TextDescription';
import Link from 'next/link';
import { AnalysisToolConfiguration } from './types';

const AnalysisCard: React.FC<AnalysisToolConfiguration> = ({
  title,
  description,
  type,
  icon,
  image,
  hasDemo,
  loginRequired,
  href,
  btnText,
}) => {
  return (
    <Stack
      key={title}
      align="stretch"
      justify="space-between"
      className="rounded-sm rounded-t-md bg-base-max p-0"
    >
      <div className="h-full">
        <div className="p-0 rounded-sm h-1/2 h-max-1/2 flex justify-center items-center overflow-hidden">
          <Image
            component={NextImage}
            src={`${image}`}
            alt={`${title} image`}
            height={1000}
            width={1000}
            radius="md"
          />
        </div>
        <div className="flex -mt-5 relative z-10">
          <div className="p-0.5 rounded-sm bg-base-lightest ml-5 border-2 border-base w-1/5 h-1/5">
            <Image
              component={NextImage}
              src={`${icon}`}
              alt={`${title} logo`}
              width={40}
              height={40}
              radius="lg"
            />
          </div>
          <div className="relative mb-0 ml-2">
            <span className="absolute bottom-0 left-0 text-xs text-gray-700 w-max">
              {type === 'application' ? 'Application' : 'Jupyter Notebook'}
            </span>
          </div>
        </div>
        <div className="flex flex-col mt-2 ml-2">
          <div className="text-sm font-black h-6">{title}</div>
          <div className="text-xs text-gray-400 h-6">
            {loginRequired ? 'Login Required' : ' '}
          </div>
          <div className="text-sm p-2 h-fit mt-2">
            <TextDescription description={description} />
          </div>
        </div>
      </div>
      <div className="flex mb-4 rounded-b-md">
        <div className="m-auto">
          <NavLink
            component={Link}
            href={href ?? '_blank'}
            classNames={{
              root: 'bg-accent text-accent-contrast hover:bg-accent-darker p-2 rounded-sm',
              label: 'text-sm font-semibold',
            }}
            label={
              btnText
                ? btnText
                : `Run ${type === 'application' ? 'App' : 'Notebook'}`
            }
          />
          {hasDemo && (
            <button className="ml-2 p-1.5 rounded-sm text-sm font-semibold">
              Demo
            </button>
          )}
        </div>
      </div>
    </Stack>
  );
};

export default AnalysisCard;
