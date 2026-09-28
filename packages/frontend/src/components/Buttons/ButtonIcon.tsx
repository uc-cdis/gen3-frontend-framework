import { Icon } from '@iconify-icon/react';
import type { ReactElement } from 'react';

export type ButtonIcon = string | ReactElement;

export const buildIcon = (icon?: ButtonIcon) => {
  if (!icon) return undefined;
  if (typeof icon === 'string') return <Icon icon={icon} height="1rem" />;
  return icon;
};
