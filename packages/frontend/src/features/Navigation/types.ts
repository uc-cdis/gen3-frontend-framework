import { ComponentType, ReactElement } from 'react';
import { StylingOverrideWithMergeControl } from '../../types';
import { TopBarProps } from './TopBar/types';
import { FooterProps } from './Footer/types';

export interface NavigationButtonProps {
  icon: string;
  tooltip: Record<LinkAuthStatus, string> | string;
  href: string;
  noBasePath?: boolean;
  name: string;
  iconHeight?: string;
  classNames?: StylingOverrideWithMergeControl;
  enabledWithNoAccess?: boolean;
}

export enum LinkAuthStatus {
  Authorized = 'authorized',
  Unauthorized = 'unauthorized',
  Pending = 'pending',
  LoginRequired = 'loginRequired',
}

export interface NavigationButtonWithAuthStatus extends NavigationButtonProps {
  authStatus: LinkAuthStatus;
}

export interface NavigationBarLogo {
  readonly src: string;
  readonly title?: string;
  readonly description: string;
  readonly width?: number;
  readonly height?: number;
  readonly noBasePath?: boolean;
  readonly divider?: boolean;
  readonly classNames?: StylingOverrideWithMergeControl;
}

export interface NavigationProps {
  readonly logo?: NavigationBarLogo;
  readonly items?: NavigationButtonProps[];
  readonly title?: string;
  readonly loginIcon?: ReactElement | string;
  readonly classNames?: StylingOverrideWithMergeControl;
  readonly hideUnauthorizedLinks?: boolean;
}

export interface HeaderMetadata {
  title: string;
  content: string;
  key: string;
}

/**
 * Type guard to check if an object is of type HeaderMetadata
 * @param obj - The object to check
 * @returns True if the object is a valid HeaderMetadata
 */
export const isHeaderMetadata = (obj: unknown): obj is HeaderMetadata => {
  // Check if obj is a non-null object
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }

  const candidate = obj as Record<string, unknown>;

  // Check all required properties exist and are non-empty strings
  return (
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    typeof candidate.content === 'string' &&
    candidate.content.trim().length > 0 &&
    typeof candidate.key === 'string' &&
    candidate.key.trim().length > 0
  );
};

/**
 * Sitewide props that can be passed to Pages
 */
interface CommonsData {
  contactEmail?: string;
}

export type BannerLevelCategories = 'INFO' | 'WARNING' | 'ERROR';

export interface BannerProps {
  readonly message: string;
  readonly level: BannerLevelCategories;
  readonly dismissible: boolean;
  readonly isExternalLink: boolean;
  readonly id: number;
}

export interface HeaderProps {
  topBar: TopBarProps;
  navigation: NavigationProps;
  banners?: Array<BannerProps>;
  type?: 'horizontal' | 'vertical' | 'original';
  readonly siteProps?: CommonsData;
}

export interface MainContentProps {
  fixed: boolean;
}

export interface NameAndIcon {
  readonly name?: string;
  readonly iconSize?: string;
  readonly rightIcon?: string;
  readonly leftIcon?: string;
  readonly classNames?: StylingOverrideWithMergeControl;
}

export interface NavPageLayoutProps {
  headerProps: Readonly<HeaderProps>;
  footerProps: Readonly<FooterProps>;
  mainProps?: Partial<MainContentProps>;
  headerMetadata: HeaderMetadata;
  CustomHeaderComponent?: ComponentType<HeaderProps>;
  CustomFooterComponent?: ComponentType<FooterProps>;
}
