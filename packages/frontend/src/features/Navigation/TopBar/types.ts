import { TopIconButtonPropsWithLink, TopIconButtonPropsWithModal } from './IconButton';
import { LoginButtonVisibility } from '../../../components/Login/types';
import { StylingOverrideWithMergeControl } from '../../../types';

export type TopBarItems = (TopIconButtonPropsWithLink | TopIconButtonPropsWithModal)

export interface TopBarProps {
  readonly items: TopBarItems[];
  readonly loginButtonVisibility?: LoginButtonVisibility;
  readonly externalLoginUrl?: string;
  readonly classNames?: StylingOverrideWithMergeControl;
  readonly itemClassnames?: StylingOverrideWithMergeControl;
}

export const isTopBarLinkButton = (
  topButton: TopIconButtonPropsWithLink | TopIconButtonPropsWithModal,
): topButton is TopIconButtonPropsWithLink =>
  (topButton as TopIconButtonPropsWithLink).href !== undefined;
