import { ReactElement } from 'react';

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

export interface FooterText {
  text: string;
  className?: string;
}

export interface FooterLink extends FooterText {
  href: string;
  linkType?: 'gen3ff' | 'portal';
}

export interface FooterLogo {
  readonly logo: string;
  readonly description: string;
  readonly width: number;
  readonly height: number;
}

export interface FooterProps {
  bottomLinks?: ReadonlyArray<BottomLinks>;
  columnLinks?: ReadonlyArray<ColumnLinks>;
  footerLogos?: ReadonlyArray<FooterLogo>;
  footerRightLogos?: ReadonlyArray<FooterLogo>;
  classNames?: Record<string, string>;
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
    typeof obj.label === 'string' &&
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
