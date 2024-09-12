import { ReactElement } from 'react';
import { TopBarProps } from './TopBar';

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

export interface HeaderProps {
  top: TopBarProps;
  navigation: NavigationProps;
  type?: 'horizontal' | 'vertical' | 'original';
}

export interface MainContentProps {
  fixed: boolean;
}
