import React from 'react';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { IconSize } from '../../DataLibrary/types';
import { useRouter } from 'next/router';
import {
  type CoreState,
  isAuthenticated,
  selectUserAuthStatus,
  selectUserDetails,
  useCoreSelector,
} from '@gen3/core';
import { IconButton, TopIconButtonProps } from './IconButton';

type TopBarAccountButtonProps = Omit<TopIconButtonProps, 'name'>;

export const AccountButton = ({
  leftIcon = undefined,
  rightIcon = undefined,
  iconSize = 'md',
  classNames = {},
  tooltip = 'See account profile',
}: TopBarAccountButtonProps) => {
  const classNamesDefaults = {
    root: `flex items-center align-middle px-2 my-2`,
    button:
      'flex flex-nowrap items-center align-middle border-b-2 hover:border-accent border-transparent',
    leftIcon: 'text-secondary-contrast-lighter pr-1',
    label: 'font-content text-secondary-contrast-lighter block',
    rightIcon: 'text-secondary-contrast-lighter pl-1',
  };
  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  const router = useRouter();

  const handleSelected = async () => {
    await router.push('/Profile');
  };

  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );

  const userStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );
  const authenticated = isAuthenticated(userStatus);

  if (!authenticated) return null;

  // get the icon size otherwise use the value of iconsSize as a string value: e.g. 2em
  const iconSz = IconSize[iconSize] ?? iconSize;

  return (
    <IconButton
      name={userInfo?.username ?? 'Profile'}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      iconSize={iconSize}
      classNames={mergedClassnames}
      clickHandler={handleSelected}
      tooltip={tooltip}
    />
  );
};
