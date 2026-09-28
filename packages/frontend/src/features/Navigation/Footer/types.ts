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
  FooterLogo | FooterText | FooterLink | FooterLinks | FooterSectionProps;

export interface FooterColumnProps {
  heading?: string;
  rows?: Array<Record<string, FooterRow>>;
  classNames?: StylingOverrideWithMergeControl;
}

export interface FooterSectionProps {
  columns?: ReadonlyArray<FooterColumnProps>;
  className?: string;
}

export type FooterClassnames = StylingOverrideWithMergeControl & {
  root: string;
  layout: string;
  version: string;
};

export interface FooterProps {
  rightSection?: FooterSectionProps; // right footer section
  leftSection?: FooterSectionProps; // left footer section
  classNames?: FooterClassnames; // tailwind styling classNames
  customFooter?: ReactElement; // if custom footer is provided, it will override the default footer
  hideFooter?: boolean; // hide the footer
  showVersion?: boolean; // if true, show the Gen3 package version
}
