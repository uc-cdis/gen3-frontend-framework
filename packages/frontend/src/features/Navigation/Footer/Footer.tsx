import React from 'react';
import { Text, Transition } from '@mantine/core';
import { extractClassName } from '../utils';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import type { FooterProps } from './types';
import FooterSection from './FooterColumn';

const scaleY = {
  in: { opacity: 1, transform: 'scaleY(1)' },
  out: { opacity: 0, transform: 'scaleY(0)' },
  common: { transformOrigin: 'bottom' },
  transitionProperty: 'transform, opacity',
};

const STYLING_DEFAULTS = {
  root: 'bg-primary-lighter text-primary-contrast-lighter p-4 shadow-sm',
  layout: 'flex items-center justify-between',
  version:
    'flex justify-start items-center gap-x-2 text-primary-contrast-lighter',
};

const GEN3_VERSION = process.env.NEXT_PUBLIC_GEN3_VERSION;

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      rightSection,
      leftSection,
      classNames = {},
      hideFooter = false,
      showVersion = true,
    },
    ref,
  ) => {
    const mergedClassNames = mergeDefaultTailwindClassnames(
      STYLING_DEFAULTS,
      classNames,
    );

    if (hideFooter) {
      return null;
    }

    return (
      <footer ref={ref}>
        <Transition
          mounted={!hideFooter}
          transition={scaleY}
          duration={1000}
          timingFunction="ease"
          keepMounted
        >
          {(transitionStyle) => (
            <div style={transitionStyle}>
              <div className={extractClassName('root', mergedClassNames)}>
                <div className="flex flex-col">
                  <div className={extractClassName('layout', mergedClassNames)}>
                    {leftSection && <FooterSection {...leftSection} />}
                    {rightSection && <FooterSection {...rightSection} />}
                  </div>
                  {GEN3_VERSION && showVersion ? (
                    <div
                      className={extractClassName('version', mergedClassNames)}
                    >
                      <Text size="0.625rem">UI</Text>
                      <Text size="0.625rem" fw={600}>
                        v{GEN3_VERSION}
                      </Text>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </Transition>
      </footer>
    );
  },
);

Footer.displayName = 'Footer';

export default Footer;
