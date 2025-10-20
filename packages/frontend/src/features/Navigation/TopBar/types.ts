import { TopIconButtonPropsWithLink } from './IconButton';
import { LoginButtonVisibility } from '../../../components/Login/types';
import { StylingOverrideWithMergeControl } from '../../../types';

export interface TopBarProps {
  readonly items: TopIconButtonPropsWithLink[];
  readonly loginButtonVisibility?: LoginButtonVisibility;
  readonly externalLoginUrl?: string;
  readonly classNames?: StylingOverrideWithMergeControl;
  readonly itemClassnames?: StylingOverrideWithMergeControl;
}
