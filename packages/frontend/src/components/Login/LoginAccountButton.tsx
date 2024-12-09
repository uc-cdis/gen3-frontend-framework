import React from 'react';
import { UnstyledButton } from '@mantine/core';
import { useRouter } from 'next/router';
import {
  selectUserAuthStatus,
  selectUserDetails,
  useCoreSelector,
  isAuthenticated,
  type CoreState,
} from '@gen3/core';
import { mergeTailwindClassnameWithDefault } from '../../utils/mergeDefaultTailwindClassnames';

interface LoginAccountButtonProps {
  className?: string;
}

const LoginAccountButton = ({
  className = undefined,
}: LoginAccountButtonProps) => {
  const router = useRouter();

  const handleSelected = async () => {
    await router.push('Profile');
  };

  const userStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );
  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );

  const mergedClassname = mergeTailwindClassnameWithDefault(
    className,
    'flex flex-nowrap items-center align-middle border-b-2 hover:border-accent border-transparent',
  );

  if (userStatus && isAuthenticated(userStatus)) {
    return (
      <UnstyledButton className="mx-2" onClick={() => handleSelected()}>
        <div className={mergedClassname}>{userInfo?.username}</div>
      </UnstyledButton>
    );
  }
  return null;
};

export default LoginAccountButton;
