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
  className?: string;
}

export interface FooterLink extends FooterText {
  href: string;
  linkType?: 'gen3ff' | 'portal';
}

export interface FooterLinks {
  links: Array<FooterLink>;
  className?: string;
}

export interface FooterLink extends FooterText {
  href: string;
  linkType?: 'gen3ff' | 'portal';
}

export interface FooterLogo {
  logo: string;
  description: string;
  width: number;
  height: number;
  className?: string;
  href?: string;
}

export type FooterRow =
  | FooterLogo
  | FooterText
  | FooterLink
  | FooterLinks
  | FooterSectionProps;

export interface FooterColumnProps {
  heading?: string;
  rows: Array<Record<string, FooterRow>>;
  classNames?: StylingOverrideWithMergeControl;
}

export interface FooterSectionProps {
  columns: ReadonlyArray<FooterColumnProps>;
  className?: string;
}

export interface FooterProps {
  bottomLinks?: ReadonlyArray<BottomLinks>;
  columnLinks?: ReadonlyArray<ColumnLinks>;
  footerLogos?: ReadonlyArray<FooterLogo>;
  footerRightLogos?: ReadonlyArray<FooterLogo>;
  rightSection?: FooterSectionProps;
  leftSection?: FooterSectionProps;
  classNames?: StylingOverrideWithMergeControl;
  customFooter?: ReactElement;
  hideFooter?: boolean;
}
