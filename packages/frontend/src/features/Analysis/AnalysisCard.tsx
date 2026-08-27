import type { AriaAttributes } from 'react';
import React from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import { Image, NavLink, Stack, Tooltip } from '@mantine/core';
import TextDescription from './TextDescription';
import Link from 'next/link';
import type { AnalysisToolConfiguration } from './types';
import { withBasePath } from '../../utils/strings';

const CARD_ACTION_CLASSNAMES = {
  root: 'bg-accent text-accent-contrast text-nowrap text-center hover:bg-accent-darker p-2 rounded min-h-[44px] flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  label: 'text-sm font-semibold px-2',
};

type CardActionButtonProps = {
  label: string;
  href?: string;
  rel?: string;
  target?: string;
  onClick?: () => void;
} & Omit<React.ComponentProps<typeof NavLink>, 'label' | 'href' | 'onClick'> &
  AriaAttributes;

/**
 * Renders the card's action affordance. When `onClick` is provided it renders as
 * a real button and calls the handler; otherwise it renders as a Next.js link to
 * `href`.
 */
const CardActionButton: React.FC<CardActionButtonProps> = ({
  label,
  href,
  onClick,
  ...rest
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  if (onClick) {
    return (
      <NavLink
        component="button"
        type="button"
        onClick={handleClick}
        classNames={CARD_ACTION_CLASSNAMES}
        label={label}
        {...rest}
      />
    );
  }

  return (
    <NavLink
      component={Link}
      href={href ?? '#'}
      classNames={CARD_ACTION_CLASSNAMES}
      label={label}
      {...rest}
    />
  );
};

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
  onButtonClick,
}) => {
  const { basePath } = useRouter();

  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick({
        title,
        href,
      });
    }
  };

  return (
    <Stack key={title} className="rounded-sm rounded-t-md bg-base-max p-0">
      <div className="relative h-[28em]">
        <div className="p-0 h-max-1/3 h-1/3 flex justify-center items-start relative overflow-hidden auto-rows-min">
          <Image
            src={withBasePath(basePath, image ?? '')}
            alt={''}
            w="auto"
            classNames={{
              root: 'rounded-tl-lg rounded-tr-lg',
            }}
          />
        </div>
        <div className="flex -mt-5 relative z-10">
          {icon && (
            <div className="p-0.5 bg-base-lightest ml-5 border-2 border-base h-1/8 w-1/8 max-h-24 max-w-24">
              <Image
                component={NextImage}
                src={
                  typeof icon === 'string'
                    ? withBasePath(basePath, icon as string)
                    : icon
                }
                alt=""
                width={32}
                height={32}
                radius="lg"
              />
            </div>
          )}
          <div className="relative mb-0 ml-2">
            <span className="absolute bottom-0 left-0 text-sm font-normal text-gray-700 w-max capitalize">
              {type}
            </span>
          </div>
        </div>
        <div className="flex flex-col mt-2 ml-2">
          <Tooltip label={title} multiline withArrow w={400}>
            <h3
              title={title}
              className="w-full justify-start text-base-contrast-max sm:text-lg md:text-xl lg:text-2xl font-bold leading-6 line-clamp-2"
            >
              {title}
            </h3>
          </Tooltip>
          <div className="text-xs text-base-constrast-lighter h-6">
            {loginRequired ? 'Login Required' : ' '}
          </div>
          <div className="sm:text-sm text-md font-normal p-2">
            <TextDescription description={description} />
          </div>
        </div>
      </div>
      <div className="m-auto">
        <div className="flex mb-4 rounded-b-md mx-4 flex-nowrap justify-between gap-x-2">
          {(onButtonClick || href) && (
            <CardActionButton
              href={href}
              onClick={onButtonClick ? handleClick : undefined}
              label={
                btnText
                  ? btnText
                  : `Run ${type === 'application' ? 'App' : 'Notebook'}`
              }
            />
          )}
          {hasDemo && demoHref && (
            <CardActionButton
              href={demoHref}
              rel="noopener noreferrer"
              target="_blank"
              aria-label="Demo (opens in new tab)"
              label="Demo"
            />
          )}
        </div>
      </div>
    </Stack>
  );
};

export default AnalysisCard;
