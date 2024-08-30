import { ReactElement } from 'react';
import { TopBarProps } from './TopBar';

interface BottomLinks {
  text: string;
  href: string;
}

interface ColumnLinks {
  heading: string;
  items: ReadonlyArray<{
    text: string;
    href?: string;
    linkType?: 'gen3ff' | 'portal';
  }>;
}

interface FooterLogo {
  readonly logo: string;
  readonly description: string;
  readonly width: number;
  readonly height: number;
}

export interface FooterProps {
  readonly bottomLinks?: ReadonlyArray<BottomLinks>;
  readonly columnLinks?: ReadonlyArray<ColumnLinks>;
  readonly footerLogos?: ReadonlyArray<ReadonlyArray<FooterLogo>>;
  readonly footerRightLogos?: ReadonlyArray<ReadonlyArray<FooterLogo>>;
  readonly classNames?: Record<string, string>;
}

export interface NavigationButtonProps {
  readonly icon: string;
  readonly tooltip: string;
  readonly href: string;
  readonly name: string;
  readonly iconHeight?: string;
  readonly classNames?: Record<string, string>;
}

export interface NavigationBarLogo {
  readonly src: string;
  readonly title?: string;
  readonly description: string;
  readonly width?: number;
  readonly height?: number;
  readonly basePath?: string;
  readonly classNames?: Record<string, string>;
}

export interface NavigationProps {
  readonly logo?: NavigationBarLogo;
  readonly items?: NavigationButtonProps[];
  readonly title?: string;
  readonly loginIcon?: ReactElement | string;
  readonly classNames?: Record<string, string>;
}

export interface HeaderData {
  title: string;
  content: string;
  key: string;
}

/**
 * Sitewide props that can be passed to Pages
 */
interface CommonsData {
  contactEmail?: string;
}

export interface HeaderProps {
  readonly top: TopBarProps;
  readonly navigation: NavigationProps;
  readonly type?: 'horizontal' | 'vertical' | 'original';
  readonly siteProps?: CommonsData;
}

export interface MainContentProps {
  fixed: boolean;
}
