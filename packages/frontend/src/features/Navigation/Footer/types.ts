import { ReactElement } from 'react';
import { StylingOverrideWithMergeControl } from '../../../types';

export interface ColumnLinks {
  heading: string;
  items: ReadonlyArray<{
    text: string;
    href?: string;
    linkType?: 'gen3ff' | 'portal';
  }>;
}

interface BottomLinks {
  text: string;
  href: string;
}

/**
 *  A Text items for the footer
 *
 */
export interface FooterText {
  text: string;
  className?: StylingOverrideWithMergeControl;
}

export interface FooterLink extends FooterText {
  href: string;
  linkType?: 'gen3ff' | 'portal';
}

export interface FooterLogo extends FooterText {
  logo: string;
  description: string;
  width: number;
  height: number;
  href: string;
}

export type FooterRow = FooterLogo | FooterText | FooterLink;

export interface FooterColumn {
  heading?: string;
  items: Array<FooterRow>;
  classNames?: StylingOverrideWithMergeControl;
}

export interface FooterProps {
  bottomLinks?: ReadonlyArray<BottomLinks>;
  columnLinks?: ReadonlyArray<ColumnLinks>;
  footerLogos?: ReadonlyArray<FooterLogo>;
  footerRightLogos?: ReadonlyArray<FooterLogo>;
  rightSection?: ReadonlyArray<FooterColumn>;
  leftSection?: ReadonlyArray<FooterColumn>;
  classNames?: StylingOverrideWithMergeControl;
  customFooter?: ReactElement;
}

export const getFooterType = (
  obj: any,
): 'FooterText' | 'FooterLink' | 'FooterLogo' | 'unknown' => {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.logo === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.width === 'number' &&
    typeof obj.height === 'number'
  ) {
    return 'FooterLogo';
  }

  if (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.text === 'string' &&
    (obj.className === undefined || typeof obj.className === 'string')
  ) {
    if (
      typeof obj.href === 'string' &&
      (obj.linkType === undefined ||
        obj.linkType === 'gen3ff' ||
        obj.linkType === 'portal')
    ) {
      return 'FooterLink';
    }
    return 'FooterText';
  }

  return 'unknown';
};
