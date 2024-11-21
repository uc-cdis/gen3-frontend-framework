import { ReactElement } from 'react';
import { TopBarProps } from './TopBar';
import { BannerProps } from './Banner';
import { StylingOverrideWithMergeControl } from '../../types';

export interface NavigationButtonProps {
  readonly icon: string;
  readonly tooltip: string;
  readonly href: string;
  readonly name: string;
  readonly iconHeight?: string;
  readonly classNames?: StylingOverrideWithMergeControl;
}

export interface NavigationBarLogo {
  readonly src: string;
  readonly title?: string;
  readonly description: string;
  readonly width?: number;
  readonly height?: number;
  readonly basePath?: string;
  readonly divider?: boolean;
  readonly classNames?: StylingOverrideWithMergeControl;
}

export interface NavigationProps {
  readonly logo?: NavigationBarLogo;
  readonly items?: NavigationButtonProps[];
  readonly title?: string;
  readonly loginIcon?: ReactElement | string;
  readonly classNames?: StylingOverrideWithMergeControl;
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
  top: TopBarProps;
  navigation: NavigationProps;
  banners?: Array<BannerProps>;
  type?: 'horizontal' | 'vertical' | 'original';
  readonly siteProps?: CommonsData;
}

export interface MainContentProps {
  fixed: boolean;
}
