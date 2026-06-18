import React from 'react';
import { Transition } from '@mantine/core';
import { extractClassName } from '../utils';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { FooterProps } from './types';
import FooterSection from './FooterColumn';

const scaleY = {
  in: { opacity: 1, transform: 'scaleY(1)' },
  out: { opacity: 0, transform: 'scaleY(0)' },
  common: { transformOrigin: 'bottom' },
  transitionProperty: 'transform, opacity',
};

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ rightSection, leftSection, classNames = {}, hideFooter = false }, ref) => {
    const classNamesDefaults = {
      root: 'bg-primary-lighter text-primary-contrast p-4 shadow-sm',
      layout: 'flex items-center justify-between',
    };

    const mergedClassNames = mergeDefaultTailwindClassnames(
      classNamesDefaults,
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
                <div className={extractClassName('layout', mergedClassNames)}>
                  {leftSection && <FooterSection {...leftSection} />}
                  {rightSection && <FooterSection {...rightSection} />}
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
