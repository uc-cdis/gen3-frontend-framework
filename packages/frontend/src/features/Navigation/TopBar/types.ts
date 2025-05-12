import { NameAndIcon } from '../types';

export type TopBarButtonType = 'link' | 'login' | 'modal';

export interface TopIconButtonConfig extends NameAndIcon {
  tooltip?: string;
  clickHandler?: () => void;
  ariaLabel?: string;
  type?: TopBarButtonType;
  href?: string;
  modal?: string;
}
