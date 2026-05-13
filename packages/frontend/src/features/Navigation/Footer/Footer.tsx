import React from 'react';
import { extractClassName } from '../utils';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { FooterProps } from './types';
import FooterSection from './FooterColumn';

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ rightSection, leftSection, classNames = {} }, ref) => {
    const classNamesDefaults = {
      root: 'bg-primary-lighter text-primary-contrast p-4 shadow-sm',
      layout: 'flex items-center justify-between',
    };

    const mergedClassNames = mergeDefaultTailwindClassnames(
      classNamesDefaults,
      classNames,
    );

    return (
      <footer ref={ref}>
        <div className={extractClassName('root', mergedClassNames)}>
          <div className={extractClassName('layout', mergedClassNames)}>
            {leftSection && <FooterSection {...leftSection} />}
            {rightSection && <FooterSection {...rightSection} />}
          </div>
        </div>
      </footer>
    );
  },
);

Footer.displayName = 'Footer';

export default Footer;
