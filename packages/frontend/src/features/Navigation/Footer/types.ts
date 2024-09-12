import { ReactElement } from 'react';
import {
  StylingMergeMode,
  StylingOverrideWithMergeControl,
} from '../../../types';

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

export interface FooterLogo extends FooterText {
  logo: string;
  description: string;
  width: number;
  height: number;
  href: string;
}

export type FooterRow =
  | FooterLogo
  | FooterText
  | FooterLink
  | FooterLinks
  | FooterSectionProps;

export interface FooterColumnProps {
  heading?: string;
  rows: Array<FooterRow>;
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
}

export const getFooterType = (
  obj: any,
):
  | 'FooterText'
  | 'FooterLink'
  | 'FooterLinks'
  | 'FooterLogo'
  | 'FooterSection'
  | 'unknown' => {
  if (!obj || typeof obj !== 'object') {
    console.log(
      'Unknown object type: ',
      obj,
      ' of type ',
      typeof obj,
      " returning 'unknown'",
    );
    return 'unknown';
  }

  if (
    typeof obj.logo === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.width === 'number' &&
    typeof obj.height === 'number'
  ) {
    console.log('is a Logo', obj);
    return 'FooterLogo';
  }

  if (
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

  if ('links' in obj) {
    return 'FooterLinks';
  }

  if ('columns' in obj) {
    return 'FooterSection';
  }

  console.log(
    'Unknown object type: ',
    obj,
    ' of type ',
    typeof obj,
    " returning 'unknown'",
  );
  return 'unknown';
};
